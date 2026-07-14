<template>
  <div class="cam-page">
    <header class="cam-header">
      <div class="cam-header-inner">
        <div class="identity">
          <p class="kicker">Panel camarógrafo · media day</p>
          <h1>{{ profile?.full_name || 'Panel' }}</h1>
          <p class="ig">@{{ profile?.instagram }}</p>
        </div>
        <div class="header-actions">
          <button type="button" class="chip" :class="{ on: activeTab === 'upload' }" @click="activeTab = 'upload'">
            Subir
          </button>
          <button type="button" class="chip" :class="{ on: activeTab === 'library' }" @click="loadLibrary">
            Mis archivos
          </button>
          <button type="button" class="chip chip-danger" @click="logout">Salir</button>
        </div>
      </div>
    </header>

    <main class="cam-main">
      <div class="quality-strip">
        <span class="dot"></span>
        Calidad original · videos: preferible máx. 2 min (se rechaza si supera 5 min)
      </div>

      <div class="mode-switch">
        <button type="button" :class="{ active: activeTab === 'upload' }" @click="activeTab = 'upload'">
          Subir media
        </button>
        <button type="button" :class="{ active: activeTab === 'library' }" @click="loadLibrary">
          Lo que subí
        </button>
      </div>

      <template v-if="activeTab === 'upload'">
        <!-- Destino + select buscador -->
        <section class="destination-panel">
          <div class="dest-head">
            <h2>1. Destino del material</h2>
            <p>Elige un competidor o marca la subida como general.</p>
          </div>

          <div class="dest-modes">
            <button
              type="button"
              class="mode-card"
              :class="{ active: !isGeneral }"
              @click="isGeneral = false"
            >
              <span class="mode-icon">#</span>
              <span>
                <strong>Por competidor</strong>
                <small>Asocia fotos/videos a una placa</small>
              </span>
            </button>
            <button
              type="button"
              class="mode-card"
              :class="{ active: isGeneral }"
              @click="setGeneral"
            >
              <span class="mode-icon">◎</span>
              <span>
                <strong>General</strong>
                <small>Ambiente, ruta, público…</small>
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
              Listo · subidas irán a <strong>#{{ selectedRider.plate_number }}</strong>
            </p>
          </div>
          <p v-else class="selected-note general-note">
            Modo general activo · no se asocia a ninguna placa
          </p>
        </section>

        <!-- Formularios notables -->
        <section class="forms-row">
          <form class="upload-hero photo-hero" @submit.prevent="submitPhotos">
            <div class="hero-badge">Formulario 1</div>
            <h2>Imágenes</h2>
            <p class="hero-sub">JPG · PNG · WEBP · HEIC · hasta 50 MB · máx. 20 archivos</p>

            <div
              class="dropzone"
              :class="{ drag: photoDrag, has: photoFiles.length }"
              @dragenter.prevent="photoDrag = true"
              @dragover.prevent="photoDrag = true"
              @dragleave.prevent="photoDrag = false"
              @drop.prevent="onPhotoDrop"
              @click="photoInput?.click()"
            >
              <input
                ref="photoInput"
                type="file"
                class="sr-only"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic"
                multiple
                @change="onPhotosPicked"
              />
              <div class="dz-icon">IMG</div>
              <strong>Arrastra fotos aquí</strong>
              <span>o haz clic para elegir archivos</span>
            </div>

            <ul v-if="photoFiles.length" class="file-chips">
              <li v-for="(f, i) in photoFiles" :key="`${f.name}-${f.size}-${i}`">
                <div class="file-chip-info">
                  <span class="file-chip-name">{{ f.name }}</span>
                  <small>{{ formatBytes(f.size) }}</small>
                </div>
                <button type="button" class="file-chip-remove" title="Descartar" @click.stop="removePhoto(i)">
                  ✕
                </button>
              </li>
            </ul>
            <button
              v-if="photoFiles.length"
              type="button"
              class="clear-all"
              @click="clearPhotos"
            >
              Descartar todas las imágenes
            </button>

            <button class="btn-hero" type="submit" :disabled="uploadingPhotos || !canUpload || !photoFiles.length">
              {{ uploadingPhotos ? 'Subiendo…' : photoUploadLabel }}
            </button>
            <p v-if="!canUpload" class="gate-hint">Selecciona destino arriba para habilitar la subida</p>
          </form>

          <form class="upload-hero video-hero" @submit.prevent="submitVideos">
            <div class="hero-badge">Formulario 2</div>
            <h2>Videos</h2>
            <p class="hero-sub">MP4 · MOV · WEBM · máximo 2 min recomendado · se rechaza si supera 5 min</p>

            <div
              class="dropzone"
              :class="{ drag: videoDrag, has: videoFiles.length }"
              @dragenter.prevent="videoDrag = true"
              @dragover.prevent="videoDrag = true"
              @dragleave.prevent="videoDrag = false"
              @drop.prevent="onVideoDrop"
              @click="videoInput?.click()"
            >
              <input
                ref="videoInput"
                type="file"
                class="sr-only"
                accept="video/mp4,video/quicktime,video/webm,.mov,.mp4"
                multiple
                @change="onVideosPicked"
              />
              <div class="dz-icon">VID</div>
              <strong>Arrastra videos aquí</strong>
              <span>o haz clic para elegir archivos</span>
            </div>

            <ul v-if="videoFiles.length" class="file-chips">
              <li v-for="(f, i) in videoFiles" :key="`${f.name}-${f.size}-${i}`">
                <div class="file-chip-info">
                  <span class="file-chip-name">{{ f.name }}</span>
                  <small>{{ formatBytes(f.size) }}</small>
                </div>
                <button type="button" class="file-chip-remove" title="Descartar" @click.stop="removeVideo(i)">
                  ✕
                </button>
              </li>
            </ul>
            <button
              v-if="videoFiles.length"
              type="button"
              class="clear-all"
              @click="clearVideos"
            >
              Descartar todos los videos
            </button>

            <button class="btn-hero" type="submit" :disabled="uploadingVideos || !canUpload || !videoFiles.length">
              {{ uploadingVideos ? 'Subiendo…' : videoUploadLabel }}
            </button>
            <p v-if="!canUpload" class="gate-hint">Selecciona destino arriba para habilitar la subida</p>
          </form>
        </section>
      </template>

      <section v-else class="library">
        <div v-if="libraryLoading" class="empty">Cargando tu biblioteca…</div>
        <div v-else-if="!library.length" class="empty">Aún no has subido archivos.</div>
        <div v-else class="library-grid">
          <article v-for="item in library" :key="item.id" class="media-tile">
            <div class="thumb">
              <img v-if="item.media_type === 'photo'" :src="item.preview_url" :alt="item.original_filename" />
              <div v-else class="video-thumb">VIDEO</div>
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
  getPhotographerToken,
  getPhotographerProfile,
  photographerLogout,
  searchRidersForMedia,
  uploadPhotographerMedia,
  fetchMyMedia,
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
const photoInput = ref(null);
const videoInput = ref(null);
const photoFiles = ref([]);
const videoFiles = ref([]);
const photoDrag = ref(false);
const videoDrag = ref(false);
const uploadingPhotos = ref(false);
const uploadingVideos = ref(false);
const library = ref([]);
const libraryLoading = ref(false);
const toast = ref(null);
let searchTimer = null;

const canUpload = computed(() => isGeneral.value || !!selectedRider.value);

const photoUploadLabel = computed(() => {
  const n = photoFiles.value.length;
  if (!n) return 'Subir imágenes';
  return n === 1 ? 'Subir 1 imagen' : `Subir ${n} imágenes`;
});

const videoUploadLabel = computed(() => {
  const n = videoFiles.value.length;
  if (!n) return 'Subir videos';
  return n === 1 ? 'Subir 1 video' : `Subir ${n} videos`;
});

onMounted(() => {
  if (!getPhotographerToken()) {
    router.replace({ name: 'photographer-auth' });
    return;
  }
  document.addEventListener('mousedown', onDocClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick);
});

function onDocClick(e) {
  if (!comboRef.value) return;
  if (!comboRef.value.contains(e.target)) comboOpen.value = false;
}

function showToast(message, type = 'ok') {
  toast.value = { message, type };
  setTimeout(() => {
    toast.value = null;
  }, 3800);
}

function formatBytes(n) {
  const v = Number(n) || 0;
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
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
    showToast(e.message || 'No se pudo cargar competidores', 'err');
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

function onPhotosPicked(e) {
  photoFiles.value = Array.from(e.target.files || []);
}

async function onVideosPicked(e) {
  const picked = Array.from(e.target.files || []);
  if (videoInput.value) videoInput.value.value = '';
  await addVideos(picked);
}

function removePhoto(index) {
  photoFiles.value = photoFiles.value.filter((_, i) => i !== index);
  if (photoInput.value) photoInput.value.value = '';
}

function removeVideo(index) {
  videoFiles.value = videoFiles.value.filter((_, i) => i !== index);
  if (videoInput.value) videoInput.value.value = '';
}

function clearPhotos() {
  photoFiles.value = [];
  if (photoInput.value) photoInput.value.value = '';
}

function clearVideos() {
  videoFiles.value = [];
  if (videoInput.value) videoInput.value.value = '';
}

function onPhotoDrop(e) {
  photoDrag.value = false;
  const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
  if (files.length) photoFiles.value = [...photoFiles.value, ...files];
}

async function onVideoDrop(e) {
  videoDrag.value = false;
  const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('video/'));
  if (files.length) await addVideos(files);
}

/** Lee duración real del video en el navegador. */
function readVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Number(video.duration);
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(duration) ? duration : 0);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`No se pudo leer “${file.name}”.`));
    };
    video.src = url;
  });
}

const MAX_VIDEO_SECONDS = 5 * 60; // rechazo duro


async function addVideos(files) {
  const accepted = [];
  const rejected = [];

  for (const file of files) {
    try {
      const seconds = await readVideoDuration(file);
      if (seconds > MAX_VIDEO_SECONDS) {
        rejected.push(`${file.name} (${Math.ceil(seconds / 60)} min)`);
        continue;
      }
      accepted.push(file);
    } catch (err) {
      rejected.push(file.name);
    }
  }

  if (accepted.length) {
    videoFiles.value = [...videoFiles.value, ...accepted];
  }

  if (rejected.length) {
    showToast(
      `Máximo 5 min por clip. Preferible ≤ 2 min. Rechazados: ${rejected.join(', ')}`,
      'err'
    );
  }
}

async function submitPhotos() {
  if (!canUpload.value || !photoFiles.value.length) {
    showToast('Elige destino y al menos una imagen', 'err');
    return;
  }
  uploadingPhotos.value = true;
  try {
    const res = await uploadPhotographerMedia({
      mediaType: 'photo',
      files: photoFiles.value,
      riderId: selectedRider.value?.id,
      isGeneral: isGeneral.value,
    });
    photoFiles.value = [];
    if (photoInput.value) photoInput.value.value = '';
    showToast(res.message || 'Fotos guardadas en calidad original');
  } catch (e) {
    showToast(e.message || 'Error al subir fotos', 'err');
  } finally {
    uploadingPhotos.value = false;
  }
}

async function submitVideos() {
  if (!canUpload.value || !videoFiles.value.length) {
    showToast('Elige destino y al menos un video', 'err');
    return;
  }
  uploadingVideos.value = true;
  try {
    const res = await uploadPhotographerMedia({
      mediaType: 'video',
      files: videoFiles.value,
      riderId: selectedRider.value?.id,
      isGeneral: isGeneral.value,
    });
    videoFiles.value = [];
    if (videoInput.value) videoInput.value.value = '';
    showToast(res.message || 'Videos guardados en calidad original');
  } catch (e) {
    showToast(e.message || 'Error al subir videos', 'err');
  } finally {
    uploadingVideos.value = false;
  }
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
  await photographerLogout();
  router.replace({ name: 'photographer-auth' });
}
</script>

<style scoped>
.cam-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: #000000;
  color: var(--text-primary);
  overflow-x: hidden;
  font-family: var(--font-main);
}

.cam-header {
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: #000000;
}

.cam-header-inner {
  width: 100%;
  padding: 1.25rem var(--container-px);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.kicker {
  margin: 0;
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.identity h1 {
  margin: 0.2rem 0 0;
  font-family: var(--font-podium);
  font-size: clamp(2rem, 5vw, 3rem);
  letter-spacing: 0.04em;
  line-height: 1;
}

.ig {
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.chip {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.chip.on {
  border-color: rgba(255, 94, 0, 0.55);
  background: rgba(255, 94, 0, 0.16);
  color: var(--text-primary);
}

.chip-danger {
  border-color: rgba(225, 29, 72, 0.45);
  color: #fda4af;
  background: rgba(225, 29, 72, 0.1);
}

.cam-main {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 1.25rem var(--container-px) 3.5rem;
}

.quality-strip {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: rgba(255, 94, 0, 0.08);
  border: 1px solid rgba(255, 94, 0, 0.28);
  color: var(--secondary-color);
  font-size: 0.86rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  box-shadow: 0 0 10px rgba(255, 94, 0, 0.7);
}

.mode-switch {
  display: inline-flex;
  gap: 0.35rem;
  padding: 0.3rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 1.25rem;
}

.mode-switch button {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.55rem 1.1rem;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.mode-switch button.active {
  background: var(--accent-gradient);
  color: #111;
}

.destination-panel {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #000000;
  border-radius: 20px;
  padding: clamp(1rem, 2vw, 1.5rem);
  margin-bottom: 1.25rem;
}

.dest-head h2 {
  margin: 0;
  font-family: var(--font-accent);
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dest-head p {
  margin: 0.35rem 0 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.dest-modes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (min-width: 720px) {
  .dest-modes {
    grid-template-columns: 1fr 1fr;
  }
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 1rem 1.1rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.mode-card:hover {
  border-color: rgba(255, 94, 0, 0.35);
}

.mode-card.active {
  border-color: rgba(255, 94, 0, 0.7);
  background: rgba(255, 94, 0, 0.12);
  transform: translateY(-1px);
}

.mode-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 94, 0, 0.15);
  color: var(--primary-color);
  font-weight: 900;
  flex-shrink: 0;
}

.mode-card strong {
  display: block;
  font-size: 0.95rem;
  font-family: var(--font-accent);
}

.mode-card small {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.combobox {
  position: relative;
  max-width: 720px;
}

.combo-label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
  font-family: var(--font-accent);
}

.combo-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  background: var(--bg-color);
  color: var(--text-primary);
  border-radius: 14px;
  padding: 0.95rem 1rem;
  cursor: pointer;
  text-align: left;
  min-height: 56px;
}

.combo-trigger.open,
.combo-trigger.filled {
  border-color: rgba(255, 94, 0, 0.55);
}

.combo-placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.combo-value {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: baseline;
}

.combo-value strong {
  color: var(--primary-color);
}

.combo-value em {
  color: var(--text-secondary);
  font-style: normal;
  font-size: 0.8rem;
}

.combo-caret {
  color: rgba(255, 255, 255, 0.45);
}

.combo-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  z-index: 30;
  background: var(--surface-color);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.55);
}

.combo-search-wrap {
  padding: 0.65rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.combo-search {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: var(--bg-color);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 0.7rem 0.85rem;
  font-size: 0.95rem;
  outline: none;
}

.combo-search:focus {
  border-color: rgba(255, 94, 0, 0.5);
}

.combo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 280px;
  overflow-y: auto;
}

.combo-list li {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 0.65rem;
  align-items: center;
  padding: 0.75rem 0.9rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.combo-list li:hover,
.combo-list li.selected {
  background: rgba(255, 94, 0, 0.12);
}

.combo-list .plate {
  color: var(--primary-color);
  font-weight: 900;
}

.combo-list .name {
  font-weight: 700;
  font-size: 0.9rem;
}

.combo-list .cat {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.combo-empty {
  padding: 1.1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.selected-note {
  margin: 0.75rem 0 0;
  color: var(--secondary-color);
  font-size: 0.88rem;
}

.general-note {
  color: var(--secondary-color);
}

.forms-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.1rem;
}

@media (min-width: 960px) {
  .forms-row {
    grid-template-columns: 1fr 1fr;
  }
}

.upload-hero {
  position: relative;
  border-radius: 22px;
  padding: clamp(1.1rem, 2vw, 1.6rem);
  border: 1px solid rgba(255, 94, 0, 0.28);
  overflow: hidden;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  background: #000000;
}

.video-hero {
  border-color: rgba(251, 191, 36, 0.32);
  background: #000000;
}

.hero-badge {
  display: inline-flex;
  width: fit-content;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: rgba(255, 94, 0, 0.14);
  color: var(--primary-color);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: var(--font-accent);
}

.video-hero .hero-badge {
  background: rgba(251, 191, 36, 0.14);
  color: var(--secondary-color);
}

.upload-hero h2 {
  margin: 0.65rem 0 0.25rem;
  font-family: var(--font-podium);
  font-size: clamp(2rem, 4vw, 2.6rem);
  letter-spacing: 0.04em;
}

.hero-sub {
  margin: 0 0 1rem;
  color: var(--text-secondary);
  font-size: 0.86rem;
}

.dropzone {
  flex: 1;
  min-height: 180px;
  border: 2px dashed rgba(255, 94, 0, 0.35);
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  cursor: pointer;
  padding: 1.25rem;
  text-align: center;
  transition: var(--transition-smooth);
}

.dropzone:hover,
.dropzone.drag {
  border-color: var(--primary-color);
  background: rgba(255, 94, 0, 0.1);
  transform: scale(1.01);
}

.video-hero .dropzone {
  border-color: rgba(251, 191, 36, 0.35);
}

.video-hero .dropzone:hover,
.video-hero .dropzone.drag {
  border-color: var(--secondary-color);
  background: rgba(251, 191, 36, 0.1);
}

.dropzone.has {
  border-style: solid;
  border-color: rgba(255, 94, 0, 0.55);
}

.dz-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 94, 0, 0.18);
  color: var(--primary-color);
  font-weight: 900;
  letter-spacing: 0.08em;
  margin-bottom: 0.35rem;
  font-family: var(--font-accent);
}

.video-hero .dz-icon {
  background: rgba(251, 191, 36, 0.18);
  color: var(--secondary-color);
}

.dropzone strong {
  font-size: 1.05rem;
  font-family: var(--font-accent);
}

.dropzone span {
  color: var(--text-secondary);
  font-size: 0.85rem;
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

.file-chips {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  max-height: 160px;
  overflow: auto;
}

.file-chips li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  padding: 0.55rem 0.65rem 0.55rem 0.75rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.8rem;
}

.file-chip-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.file-chip-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 42vw;
}

.file-chips small {
  color: var(--text-secondary);
}

.file-chip-remove {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(225, 29, 72, 0.4);
  background: rgba(225, 29, 72, 0.12);
  color: #fda4af;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.file-chip-remove:hover {
  background: rgba(225, 29, 72, 0.28);
  color: #fff;
}

.clear-all {
  margin-top: 0.55rem;
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.clear-all:hover {
  color: var(--primary-color);
}

.btn-hero {
  margin-top: 1rem;
  width: 100%;
  border: none;
  border-radius: 14px;
  background: var(--accent-gradient);
  color: #111;
  font-family: var(--font-accent);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 1rem 1.1rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-hero:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.gate-hint {
  margin: 0.55rem 0 0;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.9rem;
}

.media-tile {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
}

.thumb {
  aspect-ratio: 1;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumb {
  font-weight: 900;
  letter-spacing: 0.12em;
  color: var(--secondary-color);
  font-family: var(--font-accent);
}

.meta {
  padding: 0.65rem 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.meta strong {
  color: var(--text-primary);
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.toast {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  padding: 0.9rem 1.15rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.88rem;
  z-index: 80;
  max-width: min(92vw, 380px);
}

.toast.ok {
  background: rgba(255, 94, 0, 0.92);
  color: #111;
}

.toast.err {
  background: var(--accent-red);
  color: #fff;
}
</style>
