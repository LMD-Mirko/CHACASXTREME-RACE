<template>
  <section class="browse">
    <div class="browse__head">
      <div>
        <h2>Busca tu media</h2>
        <p>Todos los videos y fotos de la edición — generales y asignados. Preview web; descarga = original.</p>
      </div>
    </div>

    <div class="browse__toolbar">
      <div class="browse__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'video'"
          :class="{ on: tab === 'video' }"
          @click="setTab('video')"
        >
          Videos
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'photo'"
          :class="{ on: tab === 'photo' }"
          @click="setTab('photo')"
        >
          Fotos
        </button>
      </div>

      <label class="browse__search">
        <span class="sr-only">Buscar</span>
        <input
          v-model.trim="searchInput"
          type="search"
          placeholder="Placa, nombre o camarógrafo…"
          @keydown.enter.prevent="applySearch"
        />
        <button type="button" class="browse__go" @click="applySearch">Buscar</button>
      </label>
    </div>

    <p v-if="loading && !items.length" class="browse__status">Cargando…</p>
    <p v-else-if="error" class="browse__status browse__status--err">{{ error }}</p>
    <p v-else-if="!items.length" class="browse__status">No hay resultados en esta página.</p>

    <div v-else class="browse__grid">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="tile"
        @click="openItem(item)"
      >
        <div class="tile__media">
          <img
            v-if="tileSrc(item)"
            :src="tileSrc(item)"
            :alt="item.original_filename || 'media'"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="tile__fallback">
            <span>{{ item.media_type === 'video' ? '▶' : '◻' }}</span>
          </div>
          <span class="tile__type">{{ item.media_type === 'video' ? 'Video' : 'Foto' }}</span>
          <span v-if="item.media_type === 'video' && !item.has_web_preview" class="tile__badge">Procesando</span>
        </div>
        <div class="tile__meta">
          <strong>
            <template v-if="item.rider?.plate_number">#{{ item.rider.plate_number }}</template>
            <template v-else>General</template>
          </strong>
          <span>{{ item.rider?.full_name || item.photographer?.full_name || '—' }}</span>
        </div>
      </button>
    </div>

    <div v-if="meta.total > 0" class="browse__pager">
      <button type="button" class="browse__nav" :disabled="page <= 1 || loading" @click="goPage(page - 1)">
        Anterior
      </button>
      <span>{{ page }} / {{ meta.last_page || 1 }} · {{ meta.total }}</span>
      <button
        type="button"
        class="browse__nav"
        :disabled="page >= (meta.last_page || 1) || loading"
        @click="goPage(page + 1)"
      >
        Siguiente
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="active"
        class="viewer"
        role="dialog"
        aria-modal="true"
        @click.self="closeItem"
      >
        <button type="button" class="viewer__x" aria-label="Cerrar" @click="closeItem">×</button>
        <div class="viewer__stage" :class="stageClass">
          <video
            v-if="active.media_type === 'video'"
            :key="'bv-' + active.id"
            :src="active.view_url"
            :poster="active.thumb_url || undefined"
            controls
            playsinline
            preload="metadata"
            @loadedmetadata="onViewerMeta"
          />
          <img
            v-else
            :src="active.view_url"
            :alt="active.original_filename || 'foto'"
            @load="onViewerImg"
          />
        </div>
        <div class="viewer__bar">
          <div>
            <strong>
              <template v-if="active.rider?.plate_number">#{{ active.rider.plate_number }} · </template>
              {{ active.rider?.full_name || active.original_filename || 'Media' }}
            </strong>
            <span>
              <template v-if="active.is_general && !active.rider">General · </template>
              {{ active.photographer?.full_name || 'Camarógrafo' }}
              <template v-if="active.photographer?.instagram">
                · @{{ active.photographer.instagram }}
              </template>
              · {{ formatBytes(active.size_bytes) }}
            </span>
            <span v-if="active.media_type === 'video' && !active.has_web_preview" class="viewer__warn">
              Sin versión web aún — la reproducción puede fallar; la descarga sí es el original.
            </span>
          </div>
          <a
            v-if="downloadHref"
            class="viewer__dl"
            :href="downloadHref"
            download
          >
            Descargar original
          </a>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
  fetchRaceMediaGallery,
  raceMediaDownloadUrl,
} from '../api/mediaApi';

const props = defineProps({
  dossierToken: {
    type: String,
    default: '',
  },
});

const PAGE_SIZE = 12;

const tab = ref('video');
const page = ref(1);
const searchInput = ref('');
const query = ref('');
const loading = ref(false);
const error = ref('');
const items = ref([]);
const meta = ref({ current_page: 1, last_page: 1, total: 0, per_page: PAGE_SIZE });
const active = ref(null);
const viewerOrient = ref('landscape');

const downloadHref = computed(() => {
  if (!active.value?.id || !props.dossierToken) return '';
  return raceMediaDownloadUrl(active.value.id, props.dossierToken);
});

const stageClass = computed(() => (
  viewerOrient.value === 'portrait' ? 'is-portrait' : 'is-landscape'
));

function tileSrc(item) {
  if (item.media_type === 'photo') return item.thumb_url || item.view_url;
  return item.thumb_url || '';
}

function formatBytes(n) {
  const v = Number(n) || 0;
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(0)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

function setTab(next) {
  if (tab.value === next) return;
  tab.value = next;
  page.value = 1;
  load();
}

function applySearch() {
  query.value = searchInput.value;
  page.value = 1;
  load();
}

function goPage(p) {
  page.value = Math.max(1, p);
  load();
}

function openItem(item) {
  active.value = item;
  viewerOrient.value = item.orientation === 'portrait' ? 'portrait' : 'landscape';
}

function closeItem() {
  active.value = null;
}

function onViewerMeta(e) {
  const el = e?.target;
  const w = Number(el?.videoWidth) || 0;
  const h = Number(el?.videoHeight) || 0;
  if (active.value?.has_web_preview || (w && h)) {
    viewerOrient.value = h > w ? 'portrait' : 'landscape';
  } else if (active.value?.orientation) {
    viewerOrient.value = active.value.orientation;
  }
}

function onViewerImg(e) {
  const el = e?.target;
  const w = Number(el?.naturalWidth) || 0;
  const h = Number(el?.naturalHeight) || 0;
  viewerOrient.value = h > w ? 'portrait' : 'landscape';
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetchRaceMediaGallery({
      page: page.value,
      perPage: PAGE_SIZE,
      mediaType: tab.value,
      q: query.value,
    });
    items.value = res.data || [];
    meta.value = res.meta || meta.value;
    page.value = res.meta?.current_page || page.value;
  } catch (e) {
    error.value = e?.message || 'No se pudo cargar la galería.';
    items.value = [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.dossierToken,
  (tok) => {
    if (tok) load();
  },
);

onMounted(() => {
  load();
});
</script>

<style scoped>
.browse {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
}

.browse__head h2 {
  margin: 0 0 0.35rem;
  font-family: var(--font-accent);
  font-size: clamp(1.35rem, 3vw, 1.85rem);
  letter-spacing: 0.02em;
}

.browse__head p {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.92rem;
  max-width: 42rem;
  line-height: 1.45;
}

.browse__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: center;
  justify-content: space-between;
}

.browse__tabs {
  display: inline-flex;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 4px;
  overflow: hidden;
}

.browse__tabs button {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.65);
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.65rem 1rem;
  cursor: pointer;
}

.browse__tabs button.on {
  background: rgba(255, 94, 0, 0.18);
  color: #fff;
}

.browse__search {
  display: flex;
  gap: 0.4rem;
  flex: 1 1 220px;
  max-width: 420px;
}

.browse__search input {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: #080808;
  color: #fff;
  border-radius: 4px;
  padding: 0.65rem 0.8rem;
  font-family: var(--font-accent);
  font-size: 0.92rem;
}

.browse__go,
.browse__nav {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: transparent;
  color: #fff;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  border-radius: 4px;
}

.browse__go:hover,
.browse__nav:hover:not(:disabled) {
  border-color: var(--primary-color, #ff5e00);
  color: var(--primary-color, #ff5e00);
}

.browse__nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.browse__status {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
}

.browse__status--err {
  color: #fca5a5;
}

.browse__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

@media (min-width: 720px) {
  .browse__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.tile {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  color: inherit;
  cursor: pointer;
}

.tile__media {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 6px;
  background: #111;
}

.tile__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tile__fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 94, 0, 0.35), transparent 45%),
    #151515;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.6rem;
}

.tile__type,
.tile__badge {
  position: absolute;
  z-index: 1;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.65);
}

.tile__type {
  top: 6px;
  left: 6px;
}

.tile__badge {
  bottom: 6px;
  left: 6px;
  color: #fde68a;
}

.tile__meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.tile__meta strong,
.tile__meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
}

.tile__meta span {
  color: rgba(255, 255, 255, 0.5);
}

.browse__pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.viewer {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.92);
  padding: 1rem;
  gap: 0.75rem;
}

.viewer__x {
  align-self: flex-end;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.viewer__stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
}

.viewer__stage video,
.viewer__stage img {
  max-width: 100%;
  max-height: min(72vh, 820px);
  object-fit: contain;
  border-radius: 8px;
  background: #000;
}

.viewer__stage.is-portrait video,
.viewer__stage.is-portrait img {
  max-width: min(420px, 92vw);
}

.viewer__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  align-items: flex-end;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.85);
}

.viewer__bar strong {
  display: block;
  font-size: 1rem;
}

.viewer__bar span {
  display: block;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 0.2rem;
}

.viewer__warn {
  color: #fde68a !important;
}

.viewer__dl {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 94, 0, 0.55);
  color: #ffb48a;
  text-decoration: none;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.7rem 1rem;
  border-radius: 4px;
}

.viewer__dl:hover {
  background: rgba(255, 94, 0, 0.12);
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
</style>
