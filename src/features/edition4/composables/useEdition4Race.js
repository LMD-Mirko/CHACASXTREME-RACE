import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  fetchActiveCompetition,
  fetchCategories,
  fetchRiders,
  fetchClassifications,
  mapClassificationToUi,
} from '@/composables/useBackendApi';
import {
  onRaceEvent,
  ensureRaceChannels,
  softReconnectSocket,
  recoverSocketAfterForeground,
} from '@/core/network/raceRealtime';
import { bootstrapPublicRaceSocket, wsConnected } from '@/composables/usePublicRaceSocket';
import { MEGA_AVALANCHA, normalizeCategoryLabel } from '@/features/edition4/constants';

function hasMeaningfulTime(value) {
  if (value == null) return false;
  const s = String(value).trim();
  return s !== '' && s !== '—' && s !== '-' && s !== 'N/A' && s.toLowerCase() !== 'null';
}

function hasFinalResults(rows, manga) {
  // Solo cambiar a Final si realmente hubo llegadas en esa manga
  if ((manga?.arrived_count ?? 0) > 0) return true;
  return (rows || []).some((r) => {
    const status = String(r.status || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (status.includes('LLEG')) return true;
    if (r.duration_ms != null && Number(r.duration_ms) > 0) return true;
    if (hasMeaningfulTime(r.time_formatted)) return true;
    if (hasMeaningfulTime(r.meta_time)) return true;
    return false;
  });
}

function clockFromExact(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  const timePart = s.includes('T')
    ? s.split('T')[1]
    : (s.includes(' ') ? s.split(' ')[1] : s);
  return (timePart || s).slice(0, 12) || null;
}

/** MM:SS.mmm | HH:MM:SS.mmm → ms */
function parseNetToMs(net) {
  if (net == null || net === '' || net === 'N/A' || net === '—') return null;
  const s = String(net).trim();
  const parts = s.split(':');
  try {
    if (parts.length === 3) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      const secParts = String(parts[2]).split('.');
      const sec = parseInt(secParts[0], 10) || 0;
      const ms = parseInt(String(secParts[1] || '0').padEnd(3, '0').slice(0, 3), 10) || 0;
      return ((h * 3600 + m * 60 + sec) * 1000) + ms;
    }
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10) || 0;
      const secParts = String(parts[1]).split('.');
      const sec = parseInt(secParts[0], 10) || 0;
      const ms = parseInt(String(secParts[1] || '0').padEnd(3, '0').slice(0, 3), 10) || 0;
      return ((m * 60 + sec) * 1000) + ms;
    }
  } catch (_) { /* ignore */ }
  return null;
}

function formatGapFromMs(gapMs) {
  if (!Number.isFinite(gapMs) || gapMs <= 0) return '00:00.000';
  const mins = Math.floor(gapMs / 60000);
  const secs = Math.floor((gapMs % 60000) / 1000);
  const ms = Math.floor(gapMs % 1000);
  return `+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

/** Recalcula puestos 1..N en vivo entre quienes ya llegaron */
function recomputeLiveStandings(list) {
  const rows = (list || []).map((r) => ({ ...r }));
  const arrived = rows.filter((r) => r.estado_carrera === 'llego');

  arrived.sort((a, b) => {
    const da = a.duration_ms ?? parseNetToMs(a.tiempo_meta) ?? Number.POSITIVE_INFINITY;
    const db = b.duration_ms ?? parseNetToMs(b.tiempo_meta) ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return (Number(a.numero_dorsal) || 0) - (Number(b.numero_dorsal) || 0);
  });

  const leaderMs = arrived.length
    ? (arrived[0].duration_ms ?? parseNetToMs(arrived[0].tiempo_meta))
    : null;

  const byId = {};
  arrived.forEach((r, i) => {
    const ms = r.duration_ms ?? parseNetToMs(r.tiempo_meta);
    byId[r.id] = {
      position: i + 1,
      duration_ms: ms ?? r.duration_ms ?? null,
      diferencia: (i === 0 || leaderMs == null || ms == null)
        ? '00:00.000'
        : formatGapFromMs(ms - leaderMs),
    };
  });

  const statusScore = (s) => {
    if (s === 'llego') return 1;
    if (s === 'en_carrera') return 2;
    if (s === 'DNF' || s === 'DNS') return 3;
    return 4;
  };

  return rows
    .map((r) => (r.estado_carrera === 'llego' && byId[r.id] ? { ...r, ...byId[r.id] } : r))
    .sort((a, b) => {
      const sa = statusScore(a.estado_carrera);
      const sb = statusScore(b.estado_carrera);
      if (sa !== sb) return sa - sb;
      if (a.estado_carrera === 'llego' && b.estado_carrera === 'llego') {
        return (a.position ?? 9999) - (b.position ?? 9999);
      }
      if (a.estado_carrera === 'en_carrera' && b.estado_carrera === 'en_carrera') {
        const pa = a.paso_p1 ? 0 : 1;
        const pb = b.paso_p1 ? 0 : 1;
        if (pa !== pb) return pa - pb;
        if (a.paso_p1 && b.paso_p1) {
          return String(a.hora_p1 || '').localeCompare(String(b.hora_p1 || ''));
        }
      }
      return (Number(a.numero_dorsal) || 0) - (Number(b.numero_dorsal) || 0);
    });
}

export function useEdition4Race() {
  const ridersList = ref([]);
  const categories = ref([]);
  const activeCompetition = ref(null);
  const viewPhase = ref('practica');
  const classificationRiders = ref([]);
  const manga = ref(null);
  const selectedCategoryName = ref(null);

  const ridersLoading = ref(false);
  const resultsLoading = ref(false);
  const ridersError = ref(null);
  const resultsError = ref(null);
  /** category_id -> { category_name, start_time, total_riders, phase } */
  const liveStartsByCategory = ref({});

  let classReqId = 0;
  let mangaRefreshTimer = null;
  let finishReloadTimer = null;

  const photoByRiderId = computed(() => {
    const map = {};
    for (const r of ridersList.value) {
      if (r.id && r.foto_url) map[r.id] = r.foto_url;
    }
    return map;
  });

  const categoryNames = computed(() => {
    if (categories.value.length) {
      return categories.value.map((c) => c.name);
    }
    const fromRiders = [...new Set(ridersList.value.map((r) => r.categoria_elegida).filter(Boolean))];
    return fromRiders.length ? fromRiders : ['Elite'];
  });

  const categoryNameById = computed(() => {
    const map = {};
    for (const c of categories.value) {
      if (c?.id != null) map[c.id] = c.name;
    }
    return map;
  });

  const isFinalView = computed(() => viewPhase.value === 'final');

  const competitionPhase = computed(() => {
    const p = activeCompetition.value?.current_phase || activeCompetition.value?.phase;
    return p === 'final' ? 'final' : 'practica';
  });

  /** Horas de salida de la fase vista. Todas largan juntas → Mega Avalancha. */
  const phaseStartRows = computed(() => {
    const phase = viewPhase.value;
    const starts = activeCompetition.value?.category_starts
      || activeCompetition.value?.categoryStarts
      || [];
    const rows = [];

    for (const s of starts) {
      const raw = phase === 'final' ? s.final_start_time : s.practice_start_time;
      if (!raw) continue;
      const id = s.category_id;
      const live = liveStartsByCategory.value[id];
      const liveOk = live && (live.phase == null || live.phase === phase);
      rows.push({
        category_id: id,
        category_name:
          normalizeCategoryLabel(live?.category_name)
          || s.category?.name
          || categoryNameById.value[id]
          || `Cat ${id}`,
        start_time: (liveOk ? live.start_time : null) || raw,
        total_riders: liveOk ? (live.total_riders ?? null) : null,
      });
    }

    for (const [id, live] of Object.entries(liveStartsByCategory.value)) {
      if (live.phase && live.phase !== phase) continue;
      if (rows.some((r) => String(r.category_id) === String(id))) continue;
      rows.push({
        category_id: Number(id) || id,
        category_name: normalizeCategoryLabel(live.category_name) || MEGA_AVALANCHA,
        start_time: live.start_time,
        total_riders: live.total_riders,
      });
    }

    if (!rows.length) return [];

    const sorted = [...rows].sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
    const pick = sorted[sorted.length - 1];
    const ridersSum = rows.reduce((n, r) => n + (Number(r.total_riders) || 0), 0);

    return [{
      category_id: 'mega',
      category_name: MEGA_AVALANCHA,
      start_time: pick.start_time,
      total_riders: ridersSum > 0 ? ridersSum : (pick.total_riders ?? null),
    }];
  });

  const latestStart = computed(() => phaseStartRows.value[0] || null);

  const phaseLabel = computed(() => (viewPhase.value === 'final' ? 'Final' : 'Clasificación'));

  function recordStartFromEvent(e) {
    if (!e) return;
    const id = e.category_id;
    const phase = competitionPhase.value;
    const payload = {
      category_id: id,
      category_name: normalizeCategoryLabel(e.category_name) || categoryNameById.value[id] || 'Categoría',
      start_time: e.start_time,
      total_riders: e.total_riders ?? null,
      phase,
    };
    if (id != null) {
      liveStartsByCategory.value = {
        ...liveStartsByCategory.value,
        [id]: payload,
      };
    }
  }

  async function refreshCompetitionStarts() {
    try {
      const comp = await fetchActiveCompetition();
      if (comp) {
        activeCompetition.value = {
          ...activeCompetition.value,
          ...comp,
        };
      }
    } catch (_) { /* ignore */ }
  }

  async function loadCategories() {
    try {
      categories.value = await fetchCategories();
      if (!selectedCategoryName.value && categories.value.length) {
        selectedCategoryName.value = categories.value[0].name;
      }
    } catch (err) {
      console.warn('[edition4] categories', err);
    }
  }

  async function loadRiders() {
    ridersLoading.value = true;
    ridersError.value = null;
    try {
      ridersList.value = await fetchRiders();
      if (!selectedCategoryName.value && ridersList.value.length) {
        selectedCategoryName.value = ridersList.value[0].categoria_elegida;
      }
    } catch (err) {
      console.error('[edition4] riders', err);
      ridersError.value = 'No se pudo cargar el padrón de competidores.';
      ridersList.value = [];
    } finally {
      ridersLoading.value = false;
    }
  }

  async function resolveDefaultPhase(competitionId) {
    // Preferir Final solo si ya hay tiempos/llegadas reales de esa manga
    try {
      const finalPayload = await fetchClassifications(competitionId, { phase: 'final' });
      if (hasFinalResults(finalPayload.classifications, finalPayload.manga)) {
        return 'final';
      }
    } catch (_) { /* ignore */ }

    const phase = activeCompetition.value?.current_phase || activeCompetition.value?.phase;
    // Si el staff ya cambió a final pero aún no hay metas, respetar fase activa
    return phase === 'final' ? 'final' : 'practica';
  }

  async function loadActiveCompetitionAndPhase() {
    try {
      activeCompetition.value = await fetchActiveCompetition();
      if (!activeCompetition.value?.id) {
        resultsError.value = 'No hay competencia activa.';
        return;
      }
      viewPhase.value = await resolveDefaultPhase(activeCompetition.value.id);
    } catch (err) {
      console.error('[edition4] competition', err);
      activeCompetition.value = null;
      resultsError.value = 'No se pudo cargar la competencia activa.';
    }
  }

  async function loadClassifications({ soft = false } = {}) {
    if (!activeCompetition.value?.id) {
      classificationRiders.value = [];
      manga.value = null;
      return;
    }

    const reqId = ++classReqId;

    if (!soft) {
      resultsLoading.value = true;
      resultsError.value = null;
    }

    try {
      const payload = await fetchClassifications(activeCompetition.value.id, {
        phase: viewPhase.value,
      });
      if (reqId !== classReqId) return;

      manga.value = payload.manga;
      const prevById = Object.fromEntries(
        (classificationRiders.value || []).map((r) => [r.id, r])
      );
      const merged = payload.classifications.map((row) => {
        const mapped = mapClassificationToUi(row, photoByRiderId.value);
        const prev = prevById[mapped.id];
        if (!prev) return mapped;

        if (prev.paso_p1 && !mapped.paso_p1) {
          mapped.paso_p1 = true;
          mapped.hora_p1 = prev.hora_p1;
          if (mapped.estado_carrera !== 'llego') mapped.estado_carrera = 'en_carrera';
        }

        if (prev.estado_carrera === 'llego') {
          if (mapped.estado_carrera !== 'llego') mapped.estado_carrera = 'llego';
          if (!mapped.tiempo_meta && prev.tiempo_meta) mapped.tiempo_meta = prev.tiempo_meta;
          if (mapped.duration_ms == null && prev.duration_ms != null) {
            mapped.duration_ms = prev.duration_ms;
          }
          if (mapped.position == null && prev.position != null) mapped.position = prev.position;
        }
        return mapped;
      });
      classificationRiders.value = recomputeLiveStandings(merged);
    } catch (err) {
      console.error('[edition4] classifications', err);
      if (!soft && reqId === classReqId) {
        resultsError.value = 'Error al cargar la tabla de puestos.';
        classificationRiders.value = [];
      }
    } finally {
      if (!soft && reqId === classReqId) resultsLoading.value = false;
    }
  }

  function applyCheckpointPassLocal(e) {
    if (!e) return;
    const cp = String(e.checkpoint_name || '').toUpperCase();
    if (cp === 'META') return;

    const riderId = e.rider_id;
    const plate = e.plate_number;
    const list = classificationRiders.value || [];
    const idx = list.findIndex(
      (r) => (riderId != null && r.id === riderId)
        || (plate != null && Number(r.numero_dorsal) === Number(plate))
    );
    if (idx < 0) return;

    const next = [...list];
    const cur = next[idx];
    next[idx] = {
      ...cur,
      paso_p1: true,
      hora_p1: clockFromExact(e.exact_time || e.intermediate_time) || cur.hora_p1,
      estado_carrera: cur.estado_carrera === 'llego' ? 'llego' : 'en_carrera',
    };
    classificationRiders.value = next;
  }

  function applyFinishLocal(e) {
    if (!e) return;
    const plate = e.plate_number;
    const list = classificationRiders.value || [];
    const idx = list.findIndex((r) => plate != null && Number(r.numero_dorsal) === Number(plate));
    if (idx < 0) return;

    const next = [...list];
    const cur = next[idx];
    const net = e.net_time && e.net_time !== 'N/A' ? e.net_time : cur.tiempo_meta;
    const durationMs = e.duration_ms ?? parseNetToMs(net) ?? cur.duration_ms ?? null;

    next[idx] = {
      ...cur,
      estado_carrera: 'llego',
      tiempo_meta: net || cur.tiempo_meta,
      duration_ms: durationMs,
      position: e.current_position ?? cur.position,
    };
    classificationRiders.value = recomputeLiveStandings(next);
  }

  function setViewPhase(phase) {
    if (phase !== 'practica' && phase !== 'final') return;
    viewPhase.value = phase;
  }

  const unsubscribers = [];

  function track(fn) {
    unsubscribers.push(fn);
  }

  function setupRealtime() {
    bootstrapPublicRaceSocket();
    ensureRaceChannels();

    track(onRaceEvent('timing', '.RiderPassedCheckpoint', (e) => {
      applyCheckpointPassLocal(e);
      loadClassifications({ soft: true });
    }));

    track(onRaceEvent('timing', '.RiderFinished', (e) => {
      applyFinishLocal(e);
      if (finishReloadTimer) clearTimeout(finishReloadTimer);
      finishReloadTimer = setTimeout(() => {
        finishReloadTimer = null;
        loadClassifications({ soft: true });
      }, 300);
    }));

    track(onRaceEvent('timing', '.CategoryMangaCompleted', () => {
      loadClassifications({ soft: true });
    }));

    track(onRaceEvent('mountain', '.CategoryMangaStarted', (e) => {
      recordStartFromEvent(e);
      if (mangaRefreshTimer) clearTimeout(mangaRefreshTimer);
      mangaRefreshTimer = setTimeout(async () => {
        mangaRefreshTimer = null;
        await refreshCompetitionStarts();
        await loadClassifications({ soft: true });
      }, 400);
    }));

    track(onRaceEvent('infrastructure', '.CompetitionPhaseChanged', async (e) => {
      const phase = e?.new_phase || e?.phase;
      if (phase && activeCompetition.value) {
        activeCompetition.value.current_phase = phase;
      }
      await refreshCompetitionStarts();
      await loadClassifications({ soft: true });
    }));

    track(onRaceEvent('infrastructure', '.RaceReset', async () => {
      liveStartsByCategory.value = {};
      await refreshCompetitionStarts();
      await loadClassifications();
    }));

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        recoverSocketAfterForeground();
        loadClassifications({ soft: true });
      } else {
        softReconnectSocket();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    unsubscribers.push(() => document.removeEventListener('visibilitychange', onVis));
    unsubscribers.push(() => {
      if (mangaRefreshTimer) clearTimeout(mangaRefreshTimer);
      if (finishReloadTimer) clearTimeout(finishReloadTimer);
    });
  }

  watch(viewPhase, () => {
    loadClassifications();
  });

  onMounted(async () => {
    await Promise.all([loadCategories(), loadRiders(), loadActiveCompetitionAndPhase()]);
    await loadClassifications();
    setupRealtime();
  });

  onBeforeUnmount(() => {
    while (unsubscribers.length) {
      const off = unsubscribers.pop();
      try { off?.(); } catch (_) { /* ignore */ }
    }
  });

  return {
    ridersList,
    categories,
    categoryNames,
    activeCompetition,
    viewPhase,
    isFinalView,
    classificationRiders,
    manga,
    selectedCategoryName,
    ridersLoading,
    resultsLoading,
    ridersError,
    resultsError,
    wsConnected,
    latestStart,
    phaseStartRows,
    phaseLabel,
    setViewPhase,
    loadClassifications,
    loadRiders,
  };
}
