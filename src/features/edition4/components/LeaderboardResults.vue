<script setup>
import { ref, computed, watch } from 'vue';
import { Trophy, Clock, Award, MapPin, BarChart2, Table as TableIcon } from 'lucide-vue-next';
import LeaderboardChart from './LeaderboardChart.vue';
import { MEGA_KEY, buildCategoryOptions, isMegaFilter } from '../constants';

const props = defineProps({
  riders: { type: Array, required: true },
  categories: { type: Array, default: () => [] },
  viewPhase: { type: String, default: 'practica' },
  isFinalView: { type: Boolean, default: false },
  manga: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
});

const emit = defineEmits(['update:viewPhase']);

const selectedResultsCategory = ref(MEGA_KEY);
const viewMode = ref('chart');

const categoryOptions = computed(() => buildCategoryOptions(props.categories?.length
  ? props.categories
  : [...new Set(props.riders.map((r) => r.categoria_elegida).filter(Boolean))]
));

watch(categoryOptions, (opts) => {
  if (!opts.length) return;
  const keys = opts.map((o) => o.key);
  if (!keys.includes(selectedResultsCategory.value)) {
    selectedResultsCategory.value = MEGA_KEY;
  }
}, { immediate: true });

const isMega = computed(() => isMegaFilter(selectedResultsCategory.value));

const parseTime = (timeStr) => {
  if (!timeStr) return Number.POSITIVE_INFINITY;
  try {
    const parts = String(timeStr).split(':');
    if (parts.length === 3) {
      const hrs = parseInt(parts[0], 10) || 0;
      const mins = parseInt(parts[1], 10) || 0;
      const secsParts = parts[2].split('.');
      const secs = parseInt(secsParts[0], 10) || 0;
      const ms = parseFloat(`0.${secsParts[1] || '0'}`) || 0;
      return hrs * 3600 + mins * 60 + secs + ms;
    }
    const mins = parseInt(parts[0], 10) || 0;
    const secsParts = (parts[1] || '0').split('.');
    const secs = parseInt(secsParts[0], 10) || 0;
    const ms = parseFloat(`0.${secsParts[1] || '0'}`) || 0;
    return mins * 60 + secs + ms;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
};

const formatDiff = (secsVal) => {
  if (!Number.isFinite(secsVal) || secsVal <= 0) return '00:00.000';
  const mins = Math.floor(secsVal / 60);
  const secs = Math.floor(secsVal % 60);
  const ms = Math.floor((secsVal % 1) * 1000);
  return `+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
};

const finalLeaderboard = computed(() => {
  const mega = isMega.value;
  const cat = String(selectedResultsCategory.value || '').toLowerCase();

  let rows = props.riders.filter((r) => {
    if (mega) return true;
    return String(r.categoria_elegida || '').toLowerCase() === cat;
  });

  rows = [...rows].sort((a, b) => {
    const score = (s) => {
      if (s === 'llego') return 1;
      if (s === 'en_carrera') return 2;
      if (s === 'DNF' || s === 'DNS') return 3;
      return 4;
    };
    const sa = score(a.estado_carrera);
    const sb = score(b.estado_carrera);
    if (sa !== sb) return sa - sb;
    if (a.estado_carrera === 'llego' && b.estado_carrera === 'llego') {
      // duration_ms en ms; parseTime en segundos → unificar a segundos
      const ta = a.duration_ms != null ? a.duration_ms / 1000 : parseTime(a.tiempo_meta);
      const tb = b.duration_ms != null ? b.duration_ms / 1000 : parseTime(b.tiempo_meta);
      if (ta !== tb) return ta - tb;
      const pa = typeof a.position === 'number' ? a.position : null;
      const pb = typeof b.position === 'number' ? b.position : null;
      if (pa != null && pb != null) return pa - pb;
      return 0;
    }
    // En ruta: quien ya pasó P1 primero; entre ellos, por hora de paso
    if (a.estado_carrera === 'en_carrera' && b.estado_carrera === 'en_carrera') {
      const pa = a.paso_p1 ? 0 : 1;
      const pb = b.paso_p1 ? 0 : 1;
      if (pa !== pb) return pa - pb;
      if (a.paso_p1 && b.paso_p1) {
        return String(a.hora_p1 || '').localeCompare(String(b.hora_p1 || ''));
      }
    }
    return 0;
  });

  if (!mega) return rows;

  const arrived = rows.filter((r) => r.estado_carrera === 'llego');
  const leaderTime = arrived.length ? Math.min(...arrived.map((r) => parseTime(r.tiempo_meta))) : null;

  let pos = 0;
  return rows.map((r) => {
    if (r.estado_carrera !== 'llego') {
      return { ...r, _megaPos: null, diferencia: r.diferencia || '--:--' };
    }
    pos += 1;
    const t = parseTime(r.tiempo_meta);
    const gap = leaderTime != null && Number.isFinite(t) ? formatDiff(t - leaderTime) : (r.diferencia || '--:--');
    return {
      ...r,
      _megaPos: pos,
      diferencia: pos === 1 ? '00:00.000' : gap,
    };
  });
});

const statusLabel = computed(() => {
  if (props.manga?.is_closed) {
    return props.isFinalView ? 'FINAL CERRADA / OFICIAL' : 'CLASIFICACIÓN CERRADA';
  }
  if (props.manga?.still_racing > 0) {
    return props.isFinalView ? 'FINAL EN CURSO' : 'CLASIFICACIÓN EN CURSO';
  }
  return props.isFinalView ? 'RESULTADOS FINAL' : 'CLASIFICACIÓN';
});

const displayPosition = (rider, idx) => {
  if (isMega.value) {
    if (rider.estado_carrera === 'llego' && rider._megaPos != null) return rider._megaPos;
    return rider.estado_carrera === 'llego' ? idx + 1 : '—';
  }
  if (rider.estado_carrera === 'llego') {
    if (typeof rider.position === 'number') return rider.position;
    return idx + 1;
  }
  return '—';
};

const arrivedCount = computed(() => finalLeaderboard.value.filter((r) => r.estado_carrera === 'llego').length);
const racingCount = computed(() => finalLeaderboard.value.filter((r) => r.estado_carrera === 'en_carrera').length);
const leader = computed(() => finalLeaderboard.value.find((r) => r.estado_carrera === 'llego') || null);
const selectedCategoryLabel = computed(() => {
  const opt = categoryOptions.value.find((o) => o.key === selectedResultsCategory.value);
  return opt?.label || 'Mega Avalancha';
});
</script>

<template>
  <div class="results-wrapper results-wrapper--pro">
    <div class="results-hero-panel">
      <div class="results-hero-top">
        <div class="results-hero-copy">
          <span class="results-kicker font-accent">
            {{ isFinalView ? 'Manga final' : 'Manga de clasificación' }}
            <span class="sym"> · </span>{{ statusLabel }}
          </span>
          <h2 class="results-heading" :class="isMega ? 'font-podium' : 'font-accent cat-title'">
            {{ isMega ? 'Mega Avalancha' : selectedCategoryLabel }}
          </h2>
          <p class="results-sub font-symbols">
            Lectura oficial de puestos
            <span class="sym"> · </span><span class="font-accent">{{ selectedCategoryLabel }}</span>
          </p>
        </div>

        <div class="phase-tabs">
          <button
            type="button"
            class="phase-tab font-accent"
            :class="{ active: viewPhase === 'practica' }"
            @click="emit('update:viewPhase', 'practica')"
          >
            Clasificación
          </button>
          <button
            type="button"
            class="phase-tab font-accent"
            :class="{ active: viewPhase === 'final' }"
            @click="emit('update:viewPhase', 'final')"
          >
            Final
          </button>
        </div>
      </div>

      <div class="results-stat-row">
        <div class="stat-chip">
          <span class="stat-chip__lbl font-accent">Llegaron</span>
          <span class="stat-chip__val font-symbols">{{ arrivedCount }}</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip__lbl font-accent">En tabla</span>
          <span class="stat-chip__val font-symbols">{{ finalLeaderboard.length }}</span>
        </div>
        <div class="stat-chip" v-if="racingCount">
          <span class="stat-chip__lbl font-accent">En ruta</span>
          <span class="stat-chip__val font-symbols">{{ racingCount }}</span>
        </div>
        <div class="stat-chip" v-if="manga?.duration_formatted">
          <span class="stat-chip__lbl font-accent">Transcurrido</span>
          <span class="stat-chip__val font-symbols">{{ manga.duration_formatted }}</span>
        </div>
        <div class="stat-chip stat-chip--leader" v-if="leader">
          <span class="stat-chip__lbl font-accent">Líder</span>
          <span class="stat-chip__val font-symbols">
            #{{ leader.numero_dorsal }}
            <span class="sym"> · </span>{{ leader.tiempo_meta }}
          </span>
        </div>
      </div>
    </div>

    <div class="section-toolbar section-toolbar--pro">
      <div class="toolbar-left">
        <label class="cat-select-wrap font-accent">
          <span class="cat-select-lbl">Categoría</span>
          <select
            v-model="selectedResultsCategory"
            class="cat-select"
            aria-label="Filtrar por categoría"
          >
            <option
              v-for="opt in categoryOptions"
              :key="opt.key"
              :value="opt.key"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="toolbar-right">
        <div class="view-mode-toggle-wrap view-mode-toggle-wrap--pro">
          <button
            class="toggle-btn font-accent"
            :class="{ active: viewMode === 'chart' }"
            @click="viewMode = 'chart'"
          >
            <BarChart2 :size="14" />
            <span>GRÁFICO</span>
          </button>
          <button
            class="toggle-btn font-accent"
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <TableIcon :size="14" />
            <span>TABLA</span>
          </button>
        </div>
      </div>
    </div>

    <p v-if="error" class="results-banner error">{{ error }}</p>
    <p v-else-if="loading" class="results-banner">Actualizando puestos…</p>
    <p v-else-if="!finalLeaderboard.length" class="results-banner">
      Aún no hay resultados para {{ isFinalView ? 'la Final' : 'Clasificación' }}
      {{ isMega ? 'en Mega Avalancha' : 'en esta categoría' }}.
    </p>

    <LeaderboardChart
      v-if="viewMode === 'chart' && finalLeaderboard.length"
      :riders="finalLeaderboard"
      :is-mega="isMega"
      :is-final="isFinalView"
    />

    <div v-else-if="viewMode === 'table' && finalLeaderboard.length" class="table-and-cards-view-wrap">
      <div class="results-table-panel results-table-panel--minimal">
        <table class="results-table results-table--minimal">
          <thead>
            <tr>
              <th class="th-pos">#</th>
              <th class="th-dorsal">No.</th>
              <th class="th-pilot">Piloto</th>
              <th v-if="isMega" class="th-cat">Cat.</th>
              <th class="th-time">Tiempo</th>
              <th class="th-gap">Diff</th>
              <th v-if="isFinalView" class="th-clasif">Clasif.</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(rider, idx) in finalLeaderboard"
              :key="rider.id || idx"
              :class="{
                'is-podium': displayPosition(rider, idx) <= 3 && rider.estado_carrera === 'llego',
                'is-leader': displayPosition(rider, idx) === 1 && rider.estado_carrera === 'llego',
                'is-out': rider.estado_carrera === 'DNF' || rider.estado_carrera === 'DNS',
              }"
            >
              <td class="col-pos">
                <span
                  class="rank-num font-symbols"
                  :class="{
                    'rank-1': displayPosition(rider, idx) === 1 && rider.estado_carrera === 'llego',
                    'rank-2': displayPosition(rider, idx) === 2 && rider.estado_carrera === 'llego',
                    'rank-3': displayPosition(rider, idx) === 3 && rider.estado_carrera === 'llego',
                  }"
                >
                  {{ rider.estado_carrera === 'llego'
                    ? displayPosition(rider, idx)
                    : '—' }}
                </span>
              </td>

              <td class="col-dorsal">
                <span class="dorsal-num font-symbols">{{ rider.numero_dorsal ?? '—' }}</span>
              </td>

              <td class="col-pilot">
                <div class="pilot-row">
                  <img
                    :src="rider.foto_url"
                    :alt="rider.nombres_completos"
                    class="pilot-avatar"
                    loading="lazy"
                  />
                  <div class="pilot-meta">
                    <div class="pilot-name-line">
                      <span class="pilot-name">{{ rider.nombres_completos }}</span>
                      <span
                        v-if="rider.estado_carrera !== 'llego'"
                        class="status-inline font-accent"
                        :class="rider.estado_carrera === 'en_carrera' && rider.paso_p1
                          ? 'st-p1'
                          : ('st-' + rider.estado_carrera)"
                      >
                        {{ rider.estado_carrera === 'en_carrera'
                          ? (rider.paso_p1 ? 'P1' : 'EN RUTA')
                          : rider.estado_carrera === 'DNF' ? 'DNF'
                          : rider.estado_carrera === 'DNS' ? 'DNS'
                          : 'PRE' }}
                      </span>
                    </div>
                    <div class="pilot-sub font-symbols">
                      <span v-if="rider.club_team">{{ rider.club_team }}</span>
                      <span v-if="rider.club_team && rider.procedencia" class="sym"> · </span>
                      <span v-if="rider.procedencia">{{ rider.procedencia }}</span>
                      <template v-if="rider.paso_p1 && rider.hora_p1 && rider.estado_carrera === 'en_carrera'">
                        <span class="sym"> · </span>
                        <span class="p1-clock">P1 {{ rider.hora_p1 }}</span>
                      </template>
                    </div>
                  </div>
                </div>
              </td>

              <td v-if="isMega" class="col-cat">
                <span class="cat-text font-accent">{{ rider.categoria_elegida }}</span>
              </td>

              <td class="col-time font-symbols">
                <span v-if="rider.estado_carrera === 'llego'">{{ rider.tiempo_meta }}</span>
                <span v-else-if="rider.estado_carrera === 'en_carrera' && rider.paso_p1" class="time-p1 font-symbols">
                  {{ rider.hora_p1 || 'P1' }}
                </span>
                <span v-else-if="rider.estado_carrera === 'en_carrera'" class="time-muted">…</span>
                <span v-else class="time-muted">—</span>
              </td>

              <td class="col-diff font-symbols">
                <span
                  v-if="rider.estado_carrera === 'llego'"
                  :class="{ 'is-leader-gap': displayPosition(rider, idx) === 1 }"
                >
                  {{ displayPosition(rider, idx) === 1 ? '—' : rider.diferencia }}
                </span>
                <span v-else class="time-muted">—</span>
              </td>

              <td v-if="isFinalView" class="col-clasif font-symbols">
                <template v-if="rider.clasificacion_position">
                  <span class="clasif-pos">{{ rider.clasificacion_position }}º</span>
                  <span class="clasif-time">{{ rider.clasificacion_time || '—' }}</span>
                </template>
                <span v-else class="time-muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="results-mobile-view">
        <div
          v-for="(rider, idx) in finalLeaderboard"
          :key="'m-' + (rider.id || idx)"
          class="rider-card"
          :class="{
            'podium-card-1st': displayPosition(rider, idx) === 1 && rider.estado_carrera === 'llego',
            'podium-card-2nd': displayPosition(rider, idx) === 2 && rider.estado_carrera === 'llego',
            'podium-card-3rd': displayPosition(rider, idx) === 3 && rider.estado_carrera === 'llego',
          }"
        >
          <div class="rider-card__bg-pattern"></div>
          <span class="card-bracket tl"></span>
          <span class="card-bracket tr"></span>
          <span class="card-bracket bl"></span>
          <span class="card-bracket br"></span>

          <div class="rider-card__header">
            <div class="rider-card__position">
              <div
                class="podium-badge-premium"
                v-if="displayPosition(rider, idx) <= 3 && rider.estado_carrera === 'llego'"
                :class="'podium-rank-' + displayPosition(rider, idx)"
              >
                <Trophy :size="12" class="trophy-icon" />
                <span>{{ displayPosition(rider, idx) }}</span>
              </div>
              <span v-else class="normal-position-badge font-podium">
                #{{ String(displayPosition(rider, idx)).padStart(2, '0') }}
              </span>
            </div>

            <div class="rider-card__avatar-frame-wrap">
              <div class="rider-card__avatar-frame">
                <img :src="rider.foto_url" :alt="rider.nombres_completos" class="rider-card__avatar" />
              </div>
              <span class="status-dot" :class="rider.estado_carrera"></span>
            </div>

            <div class="rider-card__pilot-details">
              <h3 class="rider-card__name font-podium">{{ rider.nombres_completos }}</h3>
              <span class="mobile-cat font-accent" v-if="isMega">{{ rider.categoria_elegida }}</span>
              <span class="rider-card__team" v-if="rider.club_team">
                {{ rider.club_team }}
              </span>
              <span class="rider-card__team no-team" v-else>
                INDEPENDIENTE
              </span>
            </div>

            <div class="rider-card__dorsal font-podium">
              <div class="dorsal-plate">
                <span class="dorsal-plate__title">DORSAL</span>
                <span class="dorsal-plate__number">{{ rider.numero_dorsal ?? '--' }}</span>
              </div>
            </div>
          </div>

          <div class="rider-card__body">
            <div class="rider-card__info-row">
              <div class="rider-card__origin">
                <MapPin :size="12" class="origin-icon" />
                <span class="rider-card__label">Procedencia:</span>
                <span class="rider-card__value">{{ rider.procedencia }}</span>
              </div>
            </div>

            <div class="rider-card__stats-grid">
              <div class="rider-card__stat-item">
                <div class="stat-hdr">
                  <Clock :size="10" class="stat-icon" />
                  <span class="rider-card__stat-label">TIEMPO TOTAL</span>
                </div>
                <span class="rider-card__stat-value font-symbols highlight-time">
                  <template v-if="rider.estado_carrera === 'en_carrera' && rider.paso_p1">
                    {{ rider.hora_p1 || 'P1' }}
                  </template>
                  <template v-else-if="rider.estado_carrera === 'en_carrera'">EN RUTA</template>
                  <template v-else>{{ rider.tiempo_meta ?? '--:--' }}</template>
                </span>
              </div>

              <div class="rider-card__stat-item">
                <div class="stat-hdr">
                  <Award :size="10" class="stat-icon" />
                  <span class="rider-card__stat-label">DIFERENCIA</span>
                </div>
                <span
                  class="rider-card__stat-value font-symbols"
                  :class="{ 'first-place-color': displayPosition(rider, idx) === 1 && rider.estado_carrera === 'llego' }"
                >
                  {{ rider.diferencia }}
                </span>
              </div>

              <div class="rider-card__stat-item status-col">
                <span class="rider-card__stat-label">ESTADO</span>
                <div class="rider-card__stat-value flex-center">
                  <span v-if="rider.estado_carrera === 'llego'" class="status-pill status-pill--arrived">LLEGÓ</span>
                  <span v-else-if="rider.estado_carrera === 'en_carrera' && rider.paso_p1" class="status-pill status-pill--p1">P1</span>
                  <span v-else-if="rider.estado_carrera === 'en_carrera'" class="status-pill status-pill--route">EN RUTA</span>
                  <span v-else-if="rider.estado_carrera === 'DNF'" class="status-pill status-pill--dnf">DNF</span>
                  <span v-else-if="rider.estado_carrera === 'DNS'" class="status-pill status-pill--dns">DNS</span>
                  <span v-else class="status-pill status-pill--dns">PRE</span>
                </div>
              </div>

              <div v-if="isFinalView" class="rider-card__stat-item">
                <div class="stat-hdr">
                  <span class="rider-card__stat-label">CLASIFICACIÓN</span>
                </div>
                <span class="rider-card__stat-value font-symbols">
                  <template v-if="rider.clasificacion_position">
                    {{ rider.clasificacion_position }}<span class="sym">º</span>
                    <span class="sym"> · </span>{{ rider.clasificacion_time || '—' }}
                  </template>
                  <template v-else><span class="sym">—</span></template>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1.5rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-mode-toggle-wrap {
  display: flex;
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.2rem;
  backdrop-filter: blur(10px);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.45rem 1rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.03);
}

.toggle-btn.active {
  color: #000;
  background: var(--primary-color);
  box-shadow: 0 2px 8px rgba(255, 94, 0, 0.3);
}

.horizontal-selector {
  display: flex;
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid rgba(255, 94, 0, 0.25);
  border-radius: 12px;
  overflow: hidden;
  padding: 0.25rem;
}

.category-selector-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.6rem 1.4rem;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.category-selector-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.03);
}

.category-selector-btn.active {
  color: #020202;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  box-shadow: 0 4px 12px rgba(255, 94, 0, 0.35);
}

.results-meta-tag {
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 2px;
  background: rgba(34, 197, 94, 0.08);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  padding: 0.45rem 1rem;
  border-radius: 8px;
}

.results-table-panel {
  background: rgba(8, 8, 8, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.8rem;
  margin-bottom: 5rem;
  overflow-x: auto;
}

@media (min-width: 769px) {
  .results-table-panel {
    backdrop-filter: blur(12px);
  }
}

@media (max-width: 768px) {
  .results-table-panel {
    background: rgba(12, 12, 12, 0.95);
  }
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.results-table th {
  font-family: var(--font-accent);
  font-size: 0.65rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 1px;
  padding: 0.85rem 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.results-table td {
  padding: 1rem 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

/* Podium highlights */
.podium-1st {
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.04), transparent);
  border-left: 3px solid #fbbf24;
}

.podium-2nd {
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.04), transparent);
  border-left: 3px solid #94a3b8;
}

.podium-3rd {
  background: linear-gradient(90deg, rgba(180, 83, 9, 0.04), transparent);
  border-left: 3px solid #b45309;
}

.podium-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 900;
  font-size: 0.85rem;
}

.podium-1st .podium-badge {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.25);
}

.podium-2nd .podium-badge {
  background: rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.podium-3rd .podium-badge {
  background: rgba(180, 83, 9, 0.15);
  color: #fb923c;
  border: 1px solid rgba(180, 83, 9, 0.25);
}

.trophy-icon {
  animation: wobble 2s infinite;
}

@keyframes wobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}

.first-place-color {
  color: #fbbf24;
  font-weight: 800;
}

.col-time {
  font-size: 0.9rem;
  color: #fff;
  font-weight: 800;
}

.status-pill {
  font-family: var(--font-accent);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 0.15rem 0.5rem;
  border-radius: 100px;
}

.status-pill--arrived {
  background: rgba(34, 197, 94, 0.08);
  color: #22c55e;
}

.status-pill--dnf {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.status-pill--dns {
  background: rgba(156, 163, 175, 0.08);
  color: #9ca3af;
}

/* Table avatars */
.pilot-info-wrap {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.pilot-avatar-frame {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 2px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.podium-1st .pilot-avatar-frame {
  border-color: #fbbf24;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.45);
}

.podium-2nd .pilot-avatar-frame {
  border-color: #cbd5e1;
  box-shadow: 0 0 10px rgba(203, 213, 225, 0.45);
}

.podium-3rd .pilot-avatar-frame {
  border-color: #fb923c;
  box-shadow: 0 0 10px rgba(251, 146, 60, 0.45);
}

.pilot-table-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .section-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .toolbar-right {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
  }

  .view-mode-toggle-wrap {
    justify-content: center;
  }

  .toggle-btn {
    flex: 1;
    justify-content: center;
  }

  .results-meta-tag {
    text-align: center;
  }

  .horizontal-selector {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .category-selector-btn {
    padding: 0.6rem 1.1rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .results-table th:nth-child(4),
  .results-table td:nth-child(4) {
    display: none;
  }
}

/* Cards view hidden by default */
.results-mobile-view {
  display: none;
}

/* Card layout styles */
.rider-card {
  position: relative;
  background: linear-gradient(145deg, rgba(18, 18, 18, 0.95) 0%, rgba(8, 8, 8, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.rider-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 94, 0, 0.3);
  box-shadow: 0 12px 30px rgba(255, 94, 0, 0.05);
}

/* Background Carbon Pattern */
.rider-card__bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 94, 0, 0.015) 1px, transparent 0);
  background-size: 12px 12px;
  pointer-events: none;
  z-index: 0;
}

/* Corner Brackets for Tech Look */
.card-bracket {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  pointer-events: none;
  z-index: 1;
}
.card-bracket.tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
.card-bracket.tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
.card-bracket.bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
.card-bracket.br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

.rider-card:hover .card-bracket {
  border-color: rgba(255, 94, 0, 0.35);
}

/* Podium Border Highlights and subtle glowing backgrounds */
.podium-card-1st {
  border-left: 4px solid #fbbf24;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.03) 0%, rgba(12, 12, 12, 0.95) 100%);
  box-shadow: inset 3px 0 15px rgba(251, 191, 36, 0.02), 0 10px 25px rgba(0, 0, 0, 0.4);
}
.podium-card-1st .card-bracket.tl, .podium-card-1st .card-bracket.bl {
  border-color: rgba(251, 191, 36, 0.25);
}

.podium-card-2nd {
  border-left: 4px solid #94a3b8;
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.03) 0%, rgba(12, 12, 12, 0.95) 100%);
}
.podium-card-2nd .card-bracket.tl, .podium-card-2nd .card-bracket.bl {
  border-color: rgba(148, 163, 184, 0.25);
}

.podium-card-3rd {
  border-left: 4px solid #e27d34;
  background: linear-gradient(135deg, rgba(226, 125, 52, 0.03) 0%, rgba(12, 12, 12, 0.95) 100%);
}
.podium-card-3rd .card-bracket.tl, .podium-card-3rd .card-bracket.bl {
  border-color: rgba(226, 125, 52, 0.25);
}

/* Premium Podium Badge */
.podium-badge-premium {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  font-family: var(--font-podium);
  font-weight: 900;
  font-size: 0.8rem;
  min-width: 42px;
}

.podium-rank-1st {
  background: rgba(251, 191, 36, 0.08);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.1);
}

.podium-rank-2nd {
  background: rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.podium-rank-3rd {
  background: rgba(226, 125, 52, 0.08);
  color: #fb923c;
  border: 1px solid rgba(226, 125, 52, 0.2);
}

.normal-position-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  font-weight: 800;
  padding: 0.3rem 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  min-width: 42px;
}

/* Header */
.rider-card__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  z-index: 2;
}

/* Avatar layout with glowing indicators */
.rider-card__avatar-frame-wrap {
  position: relative;
  flex-shrink: 0;
}

.rider-card__avatar-frame {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 2.5px;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.podium-card-1st .rider-card__avatar-frame {
  border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.25);
}

.podium-card-2nd .rider-card__avatar-frame {
  border-color: rgba(203, 213, 225, 0.5);
}

.podium-card-3rd .rider-card__avatar-frame {
  border-color: rgba(251, 146, 60, 0.5);
}

.rider-card__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #080808;
}
.status-dot.llego { background-color: #22c55e; box-shadow: 0 0 6px #22c55e; }
.status-dot.DNF { background-color: #ef4444; }
.status-dot.DNS { background-color: #9ca3af; }

/* Pilot Details & Name */
.rider-card__pilot-details {
  flex-grow: 1;
  min-width: 0;
}

.rider-card__name {
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 900;
  margin-bottom: 0.25rem;
  line-height: 1.25;
  text-transform: uppercase;
  word-wrap: break-word;
  letter-spacing: 0.5px;
}

.rider-card__team {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--font-accent);
  color: var(--primary-color);
  font-size: 0.68rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.rider-card__team.no-team {
  color: rgba(255, 255, 255, 0.3);
}

.team-icon {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Dorsal Plate DH Style */
.dorsal-plate {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: #000;
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
  min-width: 48px;
  transform: skewX(-6deg);
  box-shadow: 0 4px 10px rgba(255, 94, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dorsal-plate__title {
  font-size: 0.45rem;
  font-weight: 950;
  letter-spacing: 0.5px;
  line-height: 1;
  opacity: 0.8;
}

.dorsal-plate__number {
  font-size: 0.95rem;
  font-weight: 950;
  line-height: 1.1;
}

.podium-card-1st .dorsal-plate {
  background: #fbbf24;
  box-shadow: 0 4px 10px rgba(251, 191, 36, 0.2);
}

/* Card Body */
.rider-card__body {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 2;
}

/* Origin Info Row */
.rider-card__origin {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
}

.origin-icon {
  color: var(--primary-color);
  opacity: 0.85;
}

.rider-card__label {
  color: rgba(255, 255, 255, 0.35);
  font-weight: 600;
}

.rider-card__value {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
}

/* Stats HUD Grid */
.rider-card__stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.rider-card__stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding-right: 0.25rem;
}

.rider-card__stat-item:last-child {
  border-right: none;
  padding-right: 0;
}

.stat-hdr {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0.6;
}

.stat-icon {
  color: var(--primary-color);
}

.rider-card__stat-label {
  font-family: var(--font-accent);
  font-size: 0.52rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;
  font-weight: 800;
}

.rider-card__stat-value {
  font-size: 0.85rem;
  color: #ffffff;
  font-weight: 850;
  letter-spacing: 0.2px;
}

.rider-card__stat-value.highlight-time {
  color: #fff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
}

.rider-card__stat-value .status-pill {
  font-size: 0.55rem;
  font-weight: 900;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

/* Helper flex layout styles */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.status-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.status-col .rider-card__stat-label {
  text-align: center;
}

@media (max-width: 768px) {
  .results-table-panel {
    display: none; /* Hide table on mobile */
  }

  .results-mobile-view {
    display: flex; /* Show cards on mobile */
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 5rem;
  }
}

@media (max-width: 400px) {
  .rider-card__stats-grid {
    padding: 0.5rem;
  }
  .rider-card__stat-value {
    font-size: 0.78rem;
  }
}

.phase-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.phase-tabs {
  display: inline-flex;
  gap: 0.35rem;
  padding: 0.3rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
}
.phase-tab {
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.55);
  padding: 0.55rem 1.1rem;
  border-radius: 9px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}
.phase-tab.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #020202;
}
.manga-chip {
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  color: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.4rem 0.75rem;
  border-radius: 100px;
}
.results-banner {
  text-align: center;
  margin: 1rem 0 1.5rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(255,94,0,0.06);
  border: 1px solid rgba(255,94,0,0.2);
  color: rgba(255,255,255,0.7);
}
.results-banner.error {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.35);
  color: #fca5a5;
}
.results-meta-tag.closed {
  border-color: rgba(74, 222, 128, 0.4);
  color: #4ade80;
}
.status-pill--route {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.35);
}
.status-pill--p1 {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
}
.col-clasif {
  white-space: nowrap;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.75);
}
.status-dot.en_carrera {
  background: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.7);
}


.results-hero-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.15rem;
  border-bottom: 1px solid rgba(255, 94, 0, 0.18);
  flex-wrap: wrap;
}
.results-kicker {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--primary-color);
  margin-bottom: 0.3rem;
}
.results-heading {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 950;
  letter-spacing: -1px;
  line-height: 0.95;
}
.results-sub {
  margin: 0.4rem 0 0;
  color: rgba(255,255,255,0.45);
  font-size: 0.9rem;
}
.phase-tabs {
  display: inline-flex;
  gap: 0.35rem;
  padding: 0.3rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
}
.phase-tab {
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.55);
  padding: 0.55rem 1.15rem;
  border-radius: 9px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}
.phase-tab.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #020202;
}

.cat-title {
  letter-spacing: 0.02em;
  text-transform: none;
  font-weight: 800;
  line-height: 1.15;
}

.cat-select-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: min(100%, 320px);
}

.cat-select-lbl {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 94, 0, 0.85);
}

.cat-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  background-color: rgba(8, 8, 8, 0.92);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23ff5e00' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.9rem center;
  border: 1px solid rgba(255, 94, 0, 0.35);
  border-radius: 12px;
  color: #fff;
  font-family: var(--font-accent), 'Poppins', system-ui, sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.3;
  padding: 0.75rem 2.4rem 0.75rem 0.95rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.cat-select:hover,
.cat-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 94, 0, 0.15);
}

.cat-select option {
  background: #0a0a0a;
  color: #fff;
  font-family: var(--font-accent), 'Poppins', system-ui, sans-serif;
}

.horizontal-selector {
  display: flex;
  gap: 0.3rem;
  background: rgba(8, 8, 8, 0.75);
  border: 1px solid rgba(255, 94, 0, 0.22);
  border-radius: 14px;
  padding: 0.3rem;
  max-width: min(100%, 720px);
  overflow-x: auto;
  scrollbar-width: none;
}
.horizontal-selector::-webkit-scrollbar { display: none; }
.category-selector-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255,255,255,0.48);
  padding: 0.5rem 0.95rem;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.7px;
  cursor: pointer;
  border-radius: 10px;
  text-transform: uppercase;
  white-space: nowrap;
  transition: all 0.25s ease;
}
.category-selector-btn.mega { color: rgba(251, 191, 36, 0.85); }
.category-selector-btn:hover { color: #fff; background: rgba(255,255,255,0.04); }
.category-selector-btn.active {
  color: #020202;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  box-shadow: 0 6px 18px rgba(255, 94, 0, 0.35);
}
.category-selector-btn.active.mega {
  background: linear-gradient(135deg, #ff3d00 0%, #ff8a00 45%, #fbbf24 100%);
  box-shadow: 0 8px 24px rgba(255, 61, 0, 0.45);
}
.results-banner {
  text-align: center;
  margin: 1rem 0 1.5rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(255,94,0,0.06);
  border: 1px solid rgba(255,94,0,0.2);
  color: rgba(255,255,255,0.7);
}
.results-banner.error {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.35);
  color: #fca5a5;
}
.results-meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.results-meta-tag.closed {
  border-color: rgba(74, 222, 128, 0.4);
  color: #4ade80;
}
.results-meta-tag.mega {
  border-color: rgba(251, 191, 36, 0.45);
  color: var(--secondary-color);
  background: rgba(251, 191, 36, 0.08);
}
.status-pill--route {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.35);
}
.col-clasif {
  white-space: nowrap;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.75);
}
.cat-badge {
  display: inline-block;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--secondary-color);
  border: 1px solid rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.08);
}
.mobile-cat {
  display: inline-block;
  margin: 0.15rem 0 0.25rem;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--primary-color);
}
.status-dot.en_carrera {
  background: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.7);
}
@media (max-width: 900px) {
  .section-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-right {
    flex-wrap: wrap;
  }
  .horizontal-selector {
    max-width: 100%;
  }
}

/* ── Minimal results table ───────────────────────────────── */
.results-table-panel--minimal {
  background: rgba(6, 6, 6, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 0.35rem 0.5rem 0.75rem;
  margin-bottom: 4rem;
  overflow-x: auto;
}

.results-table--minimal {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.results-table--minimal th {
  font-family: var(--font-accent);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.32);
  padding: 0.95rem 0.85rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  white-space: nowrap;
}

.results-table--minimal td {
  padding: 0.85rem 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
}

.results-table--minimal tbody tr {
  transition: background 0.2s ease;
}

.results-table--minimal tbody tr:hover {
  background: rgba(255, 94, 0, 0.035);
}

.results-table--minimal tbody tr:last-child td {
  border-bottom: none;
}

.results-table--minimal .is-leader {
  background: linear-gradient(90deg, rgba(255, 94, 0, 0.07), transparent 42%);
}

.results-table--minimal .is-out {
  opacity: 0.48;
}

.results-table--minimal .th-pos,
.results-table--minimal .col-pos {
  width: 3rem;
  text-align: center;
  padding-left: 0.6rem;
  padding-right: 0.4rem;
}

.results-table--minimal .th-dorsal,
.results-table--minimal .col-dorsal {
  width: 3.5rem;
}

.results-table--minimal .th-time,
.results-table--minimal .col-time,
.results-table--minimal .th-gap,
.results-table--minimal .col-diff,
.results-table--minimal .th-clasif,
.results-table--minimal .col-clasif {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.rank-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
}

.rank-num.rank-1 { color: #fbbf24; font-weight: 800; }
.rank-num.rank-2 { color: #cbd5e1; font-weight: 800; }
.rank-num.rank-3 { color: #fb923c; font-weight: 800; }

.dorsal-num {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.pilot-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.pilot-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #111;
}

.is-leader .pilot-avatar {
  border-color: rgba(255, 94, 0, 0.55);
}

.pilot-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.pilot-name-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.pilot-name {
  font-family: var(--font-accent);
  font-size: 0.92rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pilot-sub {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.38);
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-inline {
  flex-shrink: 0;
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-inline.st-en_carrera {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.12);
}
.status-inline.st-p1 {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.14);
}
.status-inline.st-DNF {
  color: #f87171;
  background: rgba(239, 68, 68, 0.12);
}
.status-inline.st-DNS,
.status-inline.st-pre_inscrito {
  color: #9ca3af;
  background: rgba(156, 163, 175, 0.1);
}

.cat-text {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(251, 191, 36, 0.85);
}

.results-table--minimal .col-time {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.results-table--minimal .col-diff {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
}

.results-table--minimal .is-leader-gap {
  color: rgba(255, 255, 255, 0.28);
}

.time-muted {
  color: rgba(255, 255, 255, 0.22);
}

.time-p1,
.p1-clock {
  color: #fbbf24;
  font-variant-numeric: tabular-nums;
}

.col-clasif {
  white-space: nowrap;
}

.clasif-pos {
  display: inline-block;
  min-width: 1.6rem;
  margin-right: 0.4rem;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 700;
}

.clasif-time {
  color: rgba(255, 255, 255, 0.38);
  font-size: 0.8rem;
}

@media (max-width: 900px) {
  .results-table-panel--minimal {
    padding: 0.25rem 0.35rem 0.5rem;
  }
  .results-table--minimal th,
  .results-table--minimal td {
    padding: 0.75rem 0.55rem;
  }
  .pilot-avatar {
    width: 32px;
    height: 32px;
  }
}

/* ── Results pro shell ───────────────────────────────────── */
.results-wrapper--pro {
  animation: resultsIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes resultsIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

.results-hero-panel {
  margin-bottom: 1.5rem;
  padding: 1.35rem 1.4rem 1.25rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 94, 0, 0.2);
  background:
    radial-gradient(ellipse at 12% 0%, rgba(255, 94, 0, 0.14) 0%, transparent 55%),
    radial-gradient(ellipse at 90% 20%, rgba(251, 191, 36, 0.08) 0%, transparent 45%),
    rgba(8, 8, 8, 0.72);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

.results-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.25rem;
  flex-wrap: wrap;
  margin-bottom: 1.15rem;
}

.results-kicker {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 2.2px;
  text-transform: uppercase;
  color: var(--primary-color);
  margin-bottom: 0.4rem;
}

.results-heading {
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 950;
  letter-spacing: -1.2px;
  line-height: 0.95;
}

.results-sub {
  margin: 0.45rem 0 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.88rem;
}

.results-stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 88px;
  padding: 0.55rem 0.8rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.stat-chip--leader {
  border-color: rgba(255, 94, 0, 0.35);
  background: rgba(255, 94, 0, 0.08);
  min-width: 140px;
}

.stat-chip__lbl {
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
}

.stat-chip__val {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.section-toolbar--pro {
  margin-bottom: 1.5rem;
  padding: 0.55rem;
  border-radius: 16px;
  background: rgba(6, 6, 6, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.view-mode-toggle-wrap--pro {
  border-color: rgba(255, 94, 0, 0.22);
}

.view-mode-toggle-wrap--pro .toggle-btn.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #020202;
  box-shadow: 0 4px 14px rgba(255, 94, 0, 0.3);
}

@media (max-width: 768px) {
  .results-hero-panel {
    padding: 1.1rem 1rem;
  }
  .results-hero-top {
    flex-direction: column;
  }
  .phase-tabs {
    width: 100%;
  }
  .phase-tab {
    flex: 1;
  }
}
</style>
