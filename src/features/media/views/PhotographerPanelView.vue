<template>
  <div class="desk">
    <header class="desk-top">
      <div class="desk-top-inner">
        <div class="identity">
          <p class="kicker">Media Desk · Chacas Xtreme Race</p>
          <h1>{{ profile?.full_name || 'Panel' }}</h1>
          <p class="ig">@{{ profile?.instagram }}</p>
        </div>
        <div class="top-actions">
          <button type="button" class="tab-chip" :class="{ on: activeTab === 'upload' }" @click="activeTab = 'upload'">
            Subir
          </button>
          <button type="button" class="tab-chip" :class="{ on: activeTab === 'library' }" @click="loadLibrary">
            Biblioteca
            <span v-if="library.length" class="badge">{{ library.length }}</span>
          </button>
          <button type="button" class="tab-chip danger" @click="logout">Salir</button>
        </div>
      </div>
      <div v-if="queueActiveCount" class="upload-strip">
        <div class="upload-strip-bar" :style="{ width: `${overallPercent}%` }" />
        <div class="upload-strip-meta">
          <strong>{{ queueActiveCount }} en curso</strong>
          <span>{{ overallPercent }}% · {{ formatBytes(overallLoaded) }} / {{ formatBytes(overallTotal) }}</span>
          <span v-if="overallSpeed > 0">{{ formatSpeed(overallSpeed) }} · ETA {{ formatEta(overallEta) }}</span>
        </div>
      </div>
    </header>

    <main class="desk-main">
      <template v-if="activeTab === 'upload'">
        <section class="dest card">
          <div class="section-head">
            <span class="step">01</span>
            <div>
              <h2>Destino del material</h2>
              <p>Asocia a una placa o marca como general (ambiente / ruta).</p>
            </div>
          </div>

          <div class="dest-modes">
            <button type="button" class="mode-card" :class="{ active: !isGeneral }" @click="isGeneral = false">
              <span class="mode-icon">#</span>
              <span>
                <strong>Por competidor</strong>
                <small>Va al dossier del rider</small>
              </span>
            </button>
            <button type="button" class="mode-card" :class="{ active: isGeneral }" @click="setGeneral">
              <span class="mode-icon">◎</span>
              <span>
                <strong>General</strong>
                <small>Galería / ambiente</small>
              </span>
            </button>
          </div>

          <div v-if="!isGeneral" class="combobox" ref="comboRef">
            <label class="combo-label">Competidor</label>
            <button
              type="button"
              class="combo-trigger"
              :class="{ open: comboOpen, filled: !!selectedRider }"
              @click="toggleCombo"
            >
              <span v-if="selectedRider" class="combo-value">
                <strong>#{{ selectedRider.plate_number }}</strong>
                {{ selectedRider.full_name }}
                <em>{{ selectedRider.category?.name || '' }}</em>
              </span>
              <span v-else class="combo-placeholder">Seleccionar competidor…</span>
              <span class="combo-caret">▾</span>
            </button>
            <div v-if="comboOpen" class="combo-dropdown">
              <div class="combo-search-wrap">
                <input
                  ref="comboInputRef"
                  v-model="riderQuery"
                  type="text"
                  class="combo-search"
                  placeholder="Escribe placa o nombre…"
                  @input="onRiderSearch"
                  @keydown.esc="comboOpen = false"
                />
              </div>
              <div v-if="ridersLoading" class="combo-empty">Cargando padrón…</div>
              <div v-else-if="!riderResults.length" class="combo-empty">Sin resultados</div>
              <ul v-else class="combo-list" role="listbox">
                <li
                  v-for="r in riderResults"
                  :key="r.id"
                  role="option"
                  :class="{ selected: selectedRider?.id === r.id }"
                  @mousedown.prevent="selectRider(r)"
                >
                  <span class="plate">#{{ r.plate_number }}</span>
                  <span class="name">{{ r.full_name }}</span>
                  <span class="cat">{{ r.category?.name || '—' }}</span>
                </li>
              </ul>
            </div>
            <p v-if="selectedRider" class="selected-note">
              Listo · subidas a <strong>#{{ selectedRider.plate_number }} · {{ selectedRider.full_name }}</strong>
            </p>
          </div>
          <p v-else class="selected-note general-note">Modo general activo · no se asocia a placa</p>
        </section>

        <section class="drop card" :class="{ locked: !canUpload, dragging: isDragging }">
          <div class="section-head">
            <span class="step">02</span>
            <div>
              <h2>Agregar archivos</h2>
              <p>
                Fotos hasta 200 MB · Videos hasta 4 GB · calidad original · subida por partes con reintento
              </p>
            </div>
          </div>

          <div
            class="dropzone"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="openPicker"
          >
            <input
              ref="fileInput"
              type="file"
              class="sr-only"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,video/mp4,video/quicktime,video/webm,.mov,.mp4,.m4v"
              multiple
              @change="onPicked"
            />
            <div class="dz-ring" />
            <strong>Arrastra fotos o videos aquí</strong>
            <span>o haz clic para elegir · se encolan y suben con progreso en vivo</span>
          </div>

          <p v-if="!canUpload" class="gate">Selecciona un destino arriba para habilitar la cola</p>
        </section>

        <section v-if="queue.length" class="queue card">
          <div class="section-head row">
            <div class="section-head">
              <span class="step">03</span>
              <div>
                <h2>Cola de subida</h2>
                <p>{{ queueDoneCount }}/{{ queue.length }} listos · {{ queueActiveCount }} activos</p>
              </div>
            </div>
            <div class="queue-actions">
              <button
                type="button"
                class="btn solid"
                :disabled="!canUpload || !queueIdleCount"
                @click="startAll"
              >
                Subir pendientes
              </button>
              <button type="button" class="btn ghost" :disabled="!queue.length" @click="clearFinished">
                Limpiar listos
              </button>
            </div>
          </div>

          <ul class="queue-list">
            <li v-for="item in queue" :key="item.id" class="queue-item" :data-status="item.status">
              <div class="qi-preview">
                <img v-if="item.previewUrl && item.mediaType === 'photo'" :src="item.previewUrl" alt="" />
                <video v-else-if="item.previewUrl" :src="item.previewUrl" muted playsinline />
                <span v-else class="qi-fallback">{{ item.mediaType === 'video' ? 'VID' : 'IMG' }}</span>
              </div>

              <div class="qi-body">
                <div class="qi-top">
                  <strong class="qi-name" :title="item.file.name">{{ item.file.name }}</strong>
                  <span class="qi-status">{{ statusLabel(item) }}</span>
                </div>
                <div class="qi-meta">
                  <span>{{ formatBytes(item.file.size) }}</span>
                  <span>{{ item.mediaType === 'video' ? 'Video' : 'Foto' }}</span>
                  <span v-if="item.destinationLabel">{{ item.destinationLabel }}</span>
                </div>

                <div class="qi-progress">
                  <div class="qi-track">
                    <div
                      class="qi-fill"
                      :class="{ pulse: item.status === 'assembling' }"
                      :style="{ width: `${Math.round((item.ratio || 0) * 100)}%` }"
                    />
                  </div>
                  <div class="qi-stats">
                    <span class="pct">{{ Math.round((item.ratio || 0) * 100) }}%</span>
                    <span>
                      {{ formatBytes(item.loaded || 0) }} / {{ formatBytes(item.file.size) }}
                    </span>
                    <span v-if="item.speed > 0 && item.status === 'uploading'">
                      {{ formatSpeed(item.speed) }}
                    </span>
                    <span v-if="item.eta > 0 && item.status === 'uploading'">
                      ETA {{ formatEta(item.eta) }}
                    </span>
                  </div>
                </div>

                <p v-if="item.error" class="qi-error">{{ item.error }}</p>
              </div>

              <div class="qi-actions">
                <button
                  v-if="item.status === 'queued' || item.status === 'error'"
                  type="button"
                  class="icon-btn"
                  title="Subir"
                  :disabled="!canUpload"
                  @click="startItem(item)"
                >
                  ▶
                </button>
                <button
                  v-if="item.status === 'uploading' || item.status === 'assembling'"
                  type="button"
                  class="icon-btn warn"
                  title="Cancelar"
                  @click="cancelItem(item)"
                >
                  ■
                </button>
                <button
                  v-if="item.status === 'error'"
                  type="button"
                  class="icon-btn"
                  title="Reintentar"
                  :disabled="!canUpload"
                  @click="retryItem(item)"
                >
                  ↺
                </button>
                <button
                  v-if="item.status === 'queued' || item.status === 'done' || item.status === 'error' || item.status === 'cancelled'"
                  type="button"
                  class="icon-btn mute"
                  title="Quitar"
                  @click="removeItem(item)"
                >
                  ✕
                </button>
              </div>
            </li>
          </ul>
        </section>
      </template>

      <section v-else class="library card">
        <div class="section-head">
          <span class="step">LIB</span>
          <div>
            <h2>Tu biblioteca</h2>
            <p>Archivos guardados en calidad original</p>
          </div>
        </div>
        <div v-if="libraryLoading" class="empty">Cargando biblioteca…</div>
        <div v-else-if="!library.length" class="empty">Aún no has subido archivos.</div>
        <div v-else class="library-grid">
          <article v-for="item in library" :key="item.id" class="media-tile">
            <div class="thumb">
              <img
                v-if="item.media_type === 'photo'"
                :src="mediaPublicUrl(item.preview_url)"
                :alt="item.original_filename"
              />
              <div v-else class="video-thumb">
                <span>VIDEO</span>
                <small>{{ formatBytes(item.size_bytes) }}</small>
              </div>
            </div>
            <div class="meta">
              <strong>{{ item.original_filename }}</strong>
              <span v-if="item.is_general">General</span>
              <span v-else-if="item.rider">#{{ item.rider.plate_number }} · {{ item.rider.full_name }}</span>
              <span>{{ formatBytes(item.size_bytes) }} · original</span>
            </div>
          </article>
        </div>
      </section>
    </main>

    <p v-if="toast" class="toast" :class="toast.type">{{ toast.message }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  getPhotographerProfile,
  photographerLogout,
  photographerEnsureSession,
  searchRidersForMedia,
  uploadPhotographerFile,
  abortChunkSession,
  fetchMyMedia,
  mediaPublicUrl,
  MAX_VIDEO_BYTES,
  MAX_PHOTO_BYTES,
} from '../api/mediaApi';

const router = useRouter();
const profile = ref(getPhotographerProfile());
const activeTab = ref('upload');
const isGeneral = ref(false);
const riderQuery = ref('');
const riderResults = ref([]);
const ridersLoading = ref(false);
const selectedRider = ref(null);
const comboOpen = ref(false);
const comboRef = ref(null);
const comboInputRef = ref(null);
const fileInput = ref(null);
const isDragging = ref(false);
const queue = ref([]);
const library = ref([]);
const libraryLoading = ref(false);
const toast = ref(null);
let searchTimer = null;
let toastTimer = null;
let uid = 0;

const MAX_CONCURRENT = 2;

const canUpload = computed(() => isGeneral.value || !!selectedRider.value);

const queueActiveCount = computed(
  () => queue.value.filter((i) => i.status === 'uploading' || i.status === 'assembling').length
);
const queueDoneCount = computed(() => queue.value.filter((i) => i.status === 'done').length);
const queueIdleCount = computed(
  () => queue.value.filter((i) => i.status === 'queued' || i.status === 'error').length
);

const overallLoaded = computed(() =>
  queue.value.reduce((sum, i) => sum + (Number(i.loaded) || 0), 0)
);
const overallTotal = computed(() =>
  queue.value.reduce((sum, i) => sum + (Number(i.file?.size) || 0), 0)
);
const overallPercent = computed(() => {
  if (!overallTotal.value) return 0;
  return Math.min(100, Math.round((overallLoaded.value / overallTotal.value) * 100));
});
const overallSpeed = computed(() => {
  const speeds = queue.value.filter((i) => i.status === 'uploading' && i.speed > 0).map((i) => i.speed);
  if (!speeds.length) return 0;
  return speeds.reduce((a, b) => a + b, 0);
});
const overallEta = computed(() => {
  const remaining = Math.max(0, overallTotal.value - overallLoaded.value);
  if (!overallSpeed.value) return 0;
  return remaining / overallSpeed.value;
});

onMounted(async () => {
  const session = await photographerEnsureSession();
  if (!session) {
    router.replace({ name: 'photographer-auth' });
    return;
  }
  profile.value = session;
  document.addEventListener('mousedown', onDocClick);
  window.addEventListener('beforeunload', onBeforeUnload);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick);
  window.removeEventListener('beforeunload', onBeforeUnload);
  queue.value.forEach((item) => {
    item.controller?.abort();
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  });
});

function onBeforeUnload(e) {
  if (!queueActiveCount.value) return;
  e.preventDefault();
  e.returnValue = '';
}

function onDocClick(e) {
  if (!comboRef.value) return;
  if (!comboRef.value.contains(e.target)) comboOpen.value = false;
}

function showToast(message, type = 'ok') {
  toast.value = { message, type };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = null;
  }, 4200);
}

function formatBytes(n) {
  const v = Number(n) || 0;
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  if (v < 1024 * 1024 * 1024) return `${(v / (1024 * 1024)).toFixed(1)} MB`;
  return `${(v / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatSpeed(bps) {
  if (!bps || bps < 1) return '—';
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(0)} KB/s`;
  return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
}

function formatEta(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m > 59) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return m ? `${m}:${String(r).padStart(2, '0')}` : `${r}s`;
}

function statusLabel(item) {
  switch (item.status) {
    case 'queued':
      return 'En cola';
    case 'uploading':
      return 'Subiendo';
    case 'assembling':
      return 'Ensamblando';
    case 'done':
      return 'Listo';
    case 'error':
      return 'Error';
    case 'cancelled':
      return 'Cancelado';
    default:
      return item.status;
  }
}

function setGeneral() {
  isGeneral.value = true;
  selectedRider.value = null;
  comboOpen.value = false;
}

async function toggleCombo() {
  if (isGeneral.value) isGeneral.value = false;
  comboOpen.value = !comboOpen.value;
  if (comboOpen.value) {
    riderQuery.value = '';
    await fetchRiders('');
    await nextTick();
    comboInputRef.value?.focus();
  }
}

function onRiderSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchRiders(riderQuery.value.trim());
  }, 180);
}

async function fetchRiders(q) {
  ridersLoading.value = true;
  try {
    const res = await searchRidersForMedia(q);
    riderResults.value = res.data || [];
  } catch (e) {
    riderResults.value = [];
    const msg = e.message || 'No se pudo cargar competidores';
    showToast(msg, 'err');
    if (/sesión|expirad|no válida|401|unauthorized/i.test(msg)) {
      await photographerLogout();
      router.replace({ name: 'photographer-auth' });
    }
  } finally {
    ridersLoading.value = false;
  }
}

function selectRider(r) {
  selectedRider.value = r;
  isGeneral.value = false;
  comboOpen.value = false;
  riderQuery.value = '';
}

function openPicker() {
  if (!canUpload.value) {
    showToast('Elige destino primero', 'err');
    return;
  }
  fileInput.value?.click();
}

function onPicked(e) {
  const files = Array.from(e.target.files || []);
  if (fileInput.value) fileInput.value.value = '';
  enqueueFiles(files);
}

function onDrop(e) {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer?.files || []);
  enqueueFiles(files);
}

function detectMediaType(file) {
  if (file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v)$/i.test(file.name)) return 'video';
  if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) return 'photo';
  return null;
}

function destinationLabel() {
  if (isGeneral.value) return 'General';
  if (selectedRider.value) return `#${selectedRider.value.plate_number} · ${selectedRider.value.full_name}`;
  return '';
}

function enqueueFiles(files) {
  if (!canUpload.value) {
    showToast('Elige destino primero', 'err');
    return;
  }

  const rejected = [];
  const accepted = [];

  for (const file of files) {
    const mediaType = detectMediaType(file);
    if (!mediaType) {
      rejected.push(`${file.name} (formato)`);
      continue;
    }
    const max = mediaType === 'video' ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES;
    if (file.size > max) {
      rejected.push(`${file.name} (muy pesado)`);
      continue;
    }
    if (file.size <= 0) {
      rejected.push(`${file.name} (vacío)`);
      continue;
    }

    uid += 1;
    accepted.push({
      id: `up-${Date.now()}-${uid}`,
      file,
      mediaType,
      status: 'queued',
      loaded: 0,
      ratio: 0,
      speed: 0,
      eta: 0,
      error: '',
      previewUrl: URL.createObjectURL(file),
      destinationLabel: destinationLabel(),
      riderId: selectedRider.value?.id || null,
      isGeneral: isGeneral.value,
      controller: null,
      sessionUuid: null,
      _lastTick: null,
    });
  }

  if (accepted.length) {
    queue.value = [...accepted, ...queue.value];
    pumpQueue();
  }

  if (rejected.length) {
    showToast(`No se agregaron: ${rejected.join(', ')}`, 'err');
  }
}

function pumpQueue() {
  const active = queueActiveCount.value;
  const slots = Math.max(0, MAX_CONCURRENT - active);
  if (!slots || !canUpload.value) return;

  const pending = queue.value.filter((i) => i.status === 'queued').slice(0, slots);
  pending.forEach((item) => startItem(item));
}

async function startItem(item) {
  if (!canUpload.value) {
    showToast('Elige destino primero', 'err');
    return;
  }
  if (item.status === 'uploading' || item.status === 'assembling') return;

  // Refresh destination at start time
  item.riderId = selectedRider.value?.id || null;
  item.isGeneral = isGeneral.value;
  item.destinationLabel = destinationLabel();
  item.error = '';
  item.status = 'uploading';
  item.loaded = 0;
  item.ratio = 0;
  item.speed = 0;
  item.eta = 0;
  item._lastTick = { t: performance.now(), loaded: 0 };
  item.controller = new AbortController();

  try {
    const res = await uploadPhotographerFile({
      mediaType: item.mediaType,
      file: item.file,
      riderId: item.riderId,
      isGeneral: item.isGeneral,
      signal: item.controller.signal,
      onProgress: (p) => {
        item.loaded = p.loaded || 0;
        item.ratio = p.ratio || 0;
        if (p.uuid) item.sessionUuid = p.uuid;

        if (p.phase === 'assembling') {
          item.status = 'assembling';
          item.ratio = 1;
          item.loaded = item.file.size;
          item.speed = 0;
          item.eta = 0;
          return;
        }

        item.status = 'uploading';
        const now = performance.now();
        const last = item._lastTick;
        if (last && now - last.t > 250) {
          const dt = (now - last.t) / 1000;
          const dBytes = Math.max(0, item.loaded - last.loaded);
          const instant = dt > 0 ? dBytes / dt : 0;
          item.speed = item.speed ? item.speed * 0.7 + instant * 0.3 : instant;
          const remain = Math.max(0, item.file.size - item.loaded);
          item.eta = item.speed > 0 ? remain / item.speed : 0;
          item._lastTick = { t: now, loaded: item.loaded };
        }
      },
    });

    item.status = 'done';
    item.ratio = 1;
    item.loaded = item.file.size;
    item.speed = 0;
    item.eta = 0;
    item.error = '';
    showToast(res?.message || `${item.file.name} guardado`);
  } catch (e) {
    if (e?.aborted || item.controller?.signal?.aborted) {
      item.status = 'cancelled';
      item.error = '';
    } else {
      item.status = 'error';
      item.error = e.message || 'Error al subir';
      showToast(item.error, 'err');
    }
  } finally {
    item.controller = null;
    pumpQueue();
  }
}

function cancelItem(item) {
  item.controller?.abort();
  if (item.sessionUuid) abortChunkSession(item.sessionUuid);
  item.status = 'cancelled';
  item.speed = 0;
  item.eta = 0;
}

function retryItem(item) {
  item.status = 'queued';
  item.error = '';
  item.loaded = 0;
  item.ratio = 0;
  pumpQueue();
}

function removeItem(item) {
  if (item.status === 'uploading' || item.status === 'assembling') {
    cancelItem(item);
  }
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  queue.value = queue.value.filter((q) => q.id !== item.id);
}

function startAll() {
  queue.value.forEach((item) => {
    if (item.status === 'error' || item.status === 'cancelled') {
      item.status = 'queued';
      item.error = '';
      item.loaded = 0;
      item.ratio = 0;
    }
  });
  pumpQueue();
}

function clearFinished() {
  queue.value.forEach((item) => {
    if (item.status === 'done' || item.status === 'cancelled') {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    }
  });
  queue.value = queue.value.filter((i) => i.status !== 'done' && i.status !== 'cancelled');
}

async function loadLibrary() {
  activeTab.value = 'library';
  libraryLoading.value = true;
  try {
    const res = await fetchMyMedia(1);
    library.value = res.data || [];
  } catch (e) {
    showToast(e.message || 'No se pudo cargar la biblioteca', 'err');
  } finally {
    libraryLoading.value = false;
  }
}

async function logout() {
  if (queueActiveCount.value) {
    const ok = window.confirm('Hay subidas en curso. ¿Salir de todas formas?');
    if (!ok) return;
    queue.value.forEach((item) => {
      if (item.status === 'uploading' || item.status === 'assembling') cancelItem(item);
    });
  }
  await photographerLogout();
  router.replace({ name: 'photographer-auth' });
}
</script>

<style scoped>
.desk {
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(1200px 500px at 10% -10%, rgba(255, 94, 0, 0.16), transparent 55%),
    radial-gradient(900px 400px at 90% 0%, rgba(251, 191, 36, 0.08), transparent 50%),
    #050505;
  color: #fff;
  font-family: var(--font-main);
}

.desk-top {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(14px);
  background: rgba(5, 5, 5, 0.86);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.desk-top-inner {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 1.1rem var(--container-px);
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.kicker {
  margin: 0;
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.identity h1 {
  margin: 0.2rem 0 0;
  font-size: clamp(1.4rem, 3vw, 2rem);
  letter-spacing: -0.02em;
}

.ig {
  margin: 0.15rem 0 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.9rem;
}

.top-actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.tab-chip {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.78);
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.tab-chip.on {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #111;
}

.tab-chip.danger {
  border-color: rgba(248, 113, 113, 0.45);
  color: #fca5a5;
}

.badge {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 999px;
  padding: 0.05rem 0.4rem;
  font-size: 0.72rem;
}

.upload-strip {
  position: relative;
  height: 34px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.upload-strip-bar {
  position: absolute;
  inset: 0 auto 0 0;
  background: linear-gradient(90deg, rgba(255, 94, 0, 0.85), rgba(251, 191, 36, 0.7));
  transition: width 0.25s ease;
}

.upload-strip-meta {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0 var(--container-px);
  font-size: 0.78rem;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
  width: min(1100px, 100%);
  margin: 0 auto;
}

.desk-main {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 1.25rem var(--container-px) 3rem;
  display: grid;
  gap: 1rem;
}

.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 1.15rem 1.2rem 1.25rem;
}

.section-head {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.section-head.row {
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.section-head h2 {
  margin: 0;
  font-size: 1.15rem;
}

.section-head p {
  margin: 0.2rem 0 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.88rem;
}

.step {
  flex: 0 0 auto;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #111;
  background: linear-gradient(135deg, #ff5e00, #fbbf24);
}

.dest-modes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.mode-card {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  text-align: left;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  cursor: pointer;
}

.mode-card.active {
  border-color: rgba(255, 94, 0, 0.7);
  box-shadow: inset 0 0 0 1px rgba(255, 94, 0, 0.35);
  background: rgba(255, 94, 0, 0.08);
}

.mode-card strong {
  display: block;
  font-size: 0.95rem;
}

.mode-card small {
  color: rgba(255, 255, 255, 0.5);
}

.mode-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  font-weight: 800;
  color: var(--primary-color);
}

.combobox {
  margin-top: 1rem;
  position: relative;
}

.combo-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.combo-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0b0b0b;
  color: #fff;
  cursor: pointer;
  text-align: left;
}

.combo-trigger.filled {
  border-color: rgba(255, 94, 0, 0.45);
}

.combo-value {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: baseline;
}

.combo-value em {
  color: rgba(255, 255, 255, 0.45);
  font-style: normal;
  font-size: 0.85rem;
}

.combo-placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.combo-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 0.35rem);
  z-index: 30;
  background: #0f0f0f;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}

.combo-search-wrap {
  padding: 0.55rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.combo-search {
  width: 100%;
  border: 0;
  background: #181818;
  color: #fff;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  outline: none;
}

.combo-list {
  list-style: none;
  margin: 0;
  padding: 0.35rem;
  max-height: 260px;
  overflow: auto;
}

.combo-list li {
  display: grid;
  grid-template-columns: 3.2rem 1fr auto;
  gap: 0.55rem;
  align-items: center;
  padding: 0.65rem 0.7rem;
  border-radius: 8px;
  cursor: pointer;
}

.combo-list li:hover,
.combo-list li.selected {
  background: rgba(255, 94, 0, 0.12);
}

.combo-list .plate {
  color: var(--primary-color);
  font-weight: 800;
}

.combo-list .cat {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.78rem;
}

.combo-empty {
  padding: 1rem;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
}

.selected-note {
  margin: 0.7rem 0 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.88rem;
}

.general-note {
  margin-top: 1rem;
}

.drop.locked .dropzone {
  opacity: 0.45;
  pointer-events: none;
}

.dropzone {
  position: relative;
  border: 1.5px dashed rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  padding: 2.4rem 1.2rem;
  text-align: center;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.28);
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}

.drop.dragging .dropzone,
.dropzone:hover {
  border-color: rgba(255, 94, 0, 0.75);
  background: rgba(255, 94, 0, 0.06);
}

.dz-ring {
  width: 54px;
  height: 54px;
  margin: 0 auto 0.85rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 94, 0, 0.55);
  box-shadow: 0 0 0 8px rgba(255, 94, 0, 0.08);
}

.dropzone strong {
  display: block;
  font-size: 1.05rem;
}

.dropzone span {
  display: block;
  margin-top: 0.35rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.88rem;
}

.gate {
  margin: 0.75rem 0 0;
  color: #fbbf24;
  font-size: 0.88rem;
}

.queue-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  border-radius: 999px;
  padding: 0.55rem 1rem;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn.solid {
  background: var(--primary-color);
  color: #111;
}

.btn.solid:disabled,
.btn.ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn.ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.8);
}

.queue-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.queue-item {
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 0.85rem;
  align-items: start;
  padding: 0.85rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.28);
}

.queue-item[data-status='done'] {
  border-color: rgba(74, 222, 128, 0.35);
}

.queue-item[data-status='error'] {
  border-color: rgba(248, 113, 113, 0.4);
}

.queue-item[data-status='uploading'],
.queue-item[data-status='assembling'] {
  border-color: rgba(255, 94, 0, 0.45);
}

.qi-preview {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: #111;
  display: grid;
  place-items: center;
}

.qi-preview img,
.qi-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qi-fallback {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.qi-top {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: baseline;
}

.qi-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.qi-status {
  flex: 0 0 auto;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.queue-item[data-status='done'] .qi-status {
  color: #4ade80;
}

.queue-item[data-status='error'] .qi-status {
  color: #f87171;
}

.qi-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.25rem;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.78rem;
}

.qi-progress {
  margin-top: 0.65rem;
}

.qi-track {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.qi-fill {
  height: 100%;
  width: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff5e00, #fbbf24);
  transition: width 0.2s ease;
}

.qi-fill.pulse {
  animation: pulseFill 1.1s ease-in-out infinite;
}

@keyframes pulseFill {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.25);
  }
}

.qi-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}

.qi-stats .pct {
  color: #fff;
  font-weight: 800;
}

.qi-error {
  margin: 0.45rem 0 0;
  color: #fca5a5;
  font-size: 0.8rem;
}

.qi-actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.icon-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
}

.icon-btn.warn {
  border-color: rgba(251, 191, 36, 0.45);
  color: #fbbf24;
}

.icon-btn.mute {
  color: rgba(255, 255, 255, 0.45);
}

.icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.85rem;
}

.media-tile {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.28);
}

.thumb {
  aspect-ratio: 1;
  background: #111;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumb {
  width: 100%;
  height: 100%;
  display: grid;
  place-content: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 800;
  letter-spacing: 0.1em;
}

.meta {
  padding: 0.65rem 0.7rem 0.8rem;
  display: grid;
  gap: 0.15rem;
}

.meta strong {
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta span {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
}

.empty {
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 1.25rem;
  transform: translateX(-50%);
  z-index: 50;
  max-width: min(920px, calc(100% - 2rem));
  padding: 0.85rem 1.1rem;
  border-radius: 12px;
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  font-size: 0.9rem;
}

.toast.ok {
  border-color: rgba(74, 222, 128, 0.35);
}

.toast.err {
  border-color: rgba(248, 113, 113, 0.45);
  color: #fecaca;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 720px) {
  .dest-modes {
    grid-template-columns: 1fr;
  }

  .queue-item {
    grid-template-columns: 56px 1fr;
  }

  .qi-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: flex-end;
  }

  .qi-preview {
    width: 56px;
    height: 56px;
  }
}
</style>
