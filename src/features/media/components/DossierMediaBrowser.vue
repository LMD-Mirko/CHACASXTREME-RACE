<template>
  <section class="browse">
    <header class="browse__intro">
      <p class="browse__kicker">Galería de la edición</p>
      <h2 class="browse__title">Busca tu <span>media</span></h2>
      <p class="browse__lede">
        Videos y fotos — generales o con placa. Mira el preview web y descarga el original.
      </p>
    </header>

    <div class="browse__controls">
      <div class="seg" role="tablist" aria-label="Tipo de media">
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'video'"
          class="seg__btn"
          :class="{ on: tab === 'video' }"
          @click="setTab('video')"
        >
          <span class="seg__label">Videos</span>
          <span v-if="tab === 'video' && meta.total" class="seg__count">{{ meta.total }}</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'photo'"
          class="seg__btn"
          :class="{ on: tab === 'photo' }"
          @click="setTab('photo')"
        >
          <span class="seg__label">Fotos</span>
          <span v-if="tab === 'photo' && meta.total" class="seg__count">{{ meta.total }}</span>
        </button>
      </div>

      <div class="search">
        <span class="search__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" stroke-linecap="round" />
          </svg>
        </span>
        <input
          v-model="searchInput"
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          autocorrect="off"
          placeholder="Placa, piloto o camarógrafo"
          aria-label="Buscar media"
          @input="onSearchInput"
          @keydown.enter.prevent="applySearch"
        />
        <button
          v-if="searchInput"
          type="button"
          class="search__clear"
          aria-label="Limpiar búsqueda"
          @click="clearSearch"
        >
          ×
        </button>
      </div>
    </div>

    <div class="browse__hint" aria-live="polite">
      <template v-if="loading && !items.length">Buscando…</template>
      <template v-else-if="error">{{ error }}</template>
      <template v-else-if="!items.length">
        Sin resultados{{ query ? ` para “${query}”` : '' }}.
      </template>
      <template v-else>
        {{ rangeLabel }}
        <span v-if="query"> · “{{ query }}”</span>
      </template>
    </div>

    <div v-if="loading && !items.length" class="skel-grid" aria-hidden="true">
      <div v-for="n in 6" :key="n" class="skel" />
    </div>

    <div v-else-if="items.length" class="grid">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="tile"
        :class="{ 'tile--video': item.media_type === 'video' }"
        @click="openItem(item)"
      >
        <div class="tile__frame">
          <img
            v-if="tileSrc(item)"
            :src="tileSrc(item)"
            :alt="item.original_filename || 'media'"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="tile__fallback" />
          <div class="tile__shade" aria-hidden="true" />

          <span v-if="item.media_type === 'video'" class="tile__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M8 5.5v13l11-6.5L8 5.5z" />
            </svg>
          </span>

          <div class="tile__top">
            <span class="chip" :class="item.rider?.plate_number ? 'chip--plate' : 'chip--gen'">
              <template v-if="item.rider?.plate_number">#{{ item.rider.plate_number }}</template>
              <template v-else>General</template>
            </span>
            <span
              v-if="item.media_type === 'video' && !item.has_web_preview"
              class="chip chip--warn"
            >Procesando</span>
          </div>

          <div class="tile__bottom">
            <strong class="tile__name">
              {{ item.rider?.full_name || item.photographer?.full_name || 'Sin nombre' }}
            </strong>
            <span class="tile__sub">
              <template v-if="item.rider?.full_name && item.photographer?.full_name">
                {{ item.photographer.full_name }}
              </template>
              <template v-else-if="item.photographer?.instagram">
                @{{ item.photographer.instagram }}
              </template>
              <template v-else>
                {{ item.media_type === 'video' ? 'Video' : 'Foto' }}
              </template>
            </span>
          </div>
        </div>
      </button>
    </div>

    <nav v-if="meta.last_page > 1" class="pager" aria-label="Paginación">
      <button
        type="button"
        class="pager__btn"
        :disabled="page <= 1 || loading"
        @click="goPage(page - 1)"
      >
        ← Ant.
      </button>
      <div class="pager__mid">
        <span class="pager__page">{{ page }}</span>
        <span class="pager__of">/ {{ meta.last_page }}</span>
      </div>
      <button
        type="button"
        class="pager__btn"
        :disabled="page >= meta.last_page || loading"
        @click="goPage(page + 1)"
      >
        Sig. →
      </button>
    </nav>

    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="active"
          class="sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa"
          @click.self="closeItem"
        >
          <div class="sheet__panel">
            <div class="sheet__grab" aria-hidden="true" />
            <header class="sheet__head">
              <div class="sheet__who">
                <p class="sheet__plate">
                  <template v-if="active.rider?.plate_number">#{{ active.rider.plate_number }}</template>
                  <template v-else>General</template>
                </p>
                <h3>{{ active.rider?.full_name || active.original_filename || 'Media' }}</h3>
                <p class="sheet__meta">
                  {{ active.photographer?.full_name || 'Camarógrafo' }}
                  <template v-if="active.photographer?.instagram">
                    · @{{ active.photographer.instagram }}
                  </template>
                  · {{ formatBytes(active.size_bytes) }}
                </p>
              </div>
              <button type="button" class="sheet__close" aria-label="Cerrar" @click="closeItem">
                ×
              </button>
            </header>

            <div class="sheet__stage" :class="stageClass">
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

            <p
              v-if="active.media_type === 'video' && !active.has_web_preview"
              class="sheet__warn"
            >
              Aún sin versión web — puede no reproducir. La descarga sí es el original.
            </p>

            <div class="sheet__actions">
              <a
                v-if="downloadHref"
                class="sheet__dl"
                :href="downloadHref"
                download
              >
                Descargar original
              </a>
              <button type="button" class="sheet__sec" @click="closeItem">Cerrar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
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

let searchTimer = null;

const downloadHref = computed(() => {
  if (!active.value?.id || !props.dossierToken) return '';
  return raceMediaDownloadUrl(active.value.id, props.dossierToken);
});

const stageClass = computed(() => (
  viewerOrient.value === 'portrait' ? 'is-portrait' : 'is-landscape'
));

const rangeLabel = computed(() => {
  const total = Number(meta.value.total) || 0;
  if (!total) return '0 resultados';
  const per = Number(meta.value.per_page) || PAGE_SIZE;
  const cur = Number(meta.value.current_page) || page.value;
  const from = (cur - 1) * per + 1;
  const to = Math.min(cur * per, total);
  return `${from}–${to} de ${total}`;
});

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

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    applySearch();
  }, 380);
}

function applySearch() {
  if (searchTimer) clearTimeout(searchTimer);
  const next = String(searchInput.value || '').trim();
  if (next === query.value) return;
  query.value = next;
  page.value = 1;
  load();
}

function clearSearch() {
  searchInput.value = '';
  if (query.value) {
    query.value = '';
    page.value = 1;
    load();
  }
}

function goPage(p) {
  page.value = Math.max(1, p);
  load();
  try {
    document.querySelector('.browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {
    /* ignore */
  }
}

function openItem(item) {
  active.value = item;
  // Web preview: wait for loadedmetadata/pixels. Original: API hint OK.
  viewerOrient.value = item.has_web_preview
    ? 'landscape'
    : (item.orientation === 'portrait' ? 'portrait' : 'landscape');
  document.body.style.overflow = 'hidden';
}

function closeItem() {
  active.value = null;
  document.body.style.overflow = '';
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

function onKey(e) {
  if (e.key === 'Escape' && active.value) closeItem();
}

watch(
  () => props.dossierToken,
  (tok) => {
    if (tok) load();
  },
);

onMounted(() => {
  load();
  window.addEventListener('keydown', onKey);
});

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer);
  window.removeEventListener('keydown', onKey);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.browse {
  --browse-orange: var(--primary-color, #ff5e00);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.25rem 0 0.5rem;
}

.browse__intro {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.browse__kicker {
  margin: 0;
  font-family: var(--font-accent);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--browse-orange);
}

.browse__title {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(1.85rem, 7.5vw, 2.6rem);
  letter-spacing: 0.03em;
  line-height: 0.95;
  color: #fff;
}

.browse__title span {
  color: var(--browse-orange);
}

.browse__lede {
  margin: 0.15rem 0 0;
  max-width: 34rem;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.95rem;
  line-height: 1.45;
}

.browse__controls {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 0.55rem 0 0.35rem;
  background: linear-gradient(180deg, #050505 70%, rgba(5, 5, 5, 0));
}

.seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 3px;
  border-radius: 10px;
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.seg__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 44px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
  -webkit-tap-highlight-color: transparent;
}

.seg__btn.on {
  background: linear-gradient(135deg, rgba(255, 94, 0, 0.95), rgba(255, 140, 0, 0.85));
  color: #111;
}

.seg__count {
  min-width: 1.4rem;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.22);
  font-size: 0.68rem;
}

.seg__btn.on .seg__count {
  background: rgba(0, 0, 0, 0.18);
  color: #111;
}

.search {
  position: relative;
  display: flex;
  align-items: center;
}

.search__icon {
  position: absolute;
  left: 0.85rem;
  color: rgba(255, 255, 255, 0.35);
  display: grid;
  place-items: center;
  pointer-events: none;
}

.search input {
  width: 100%;
  min-height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: #0a0a0a;
  color: #fff;
  padding: 0.75rem 2.6rem 0.75rem 2.55rem;
  font-family: var(--font-accent);
  font-size: 1rem;
  -webkit-appearance: none;
  appearance: none;
}

.search input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.search input:focus {
  outline: none;
  border-color: rgba(255, 94, 0, 0.65);
  box-shadow: 0 0 0 3px rgba(255, 94, 0, 0.15);
}

.search__clear {
  position: absolute;
  right: 0.45rem;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.browse__hint {
  margin: 0;
  min-height: 1.2em;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.45);
}

.skel-grid,
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

@media (min-width: 640px) {
  .skel-grid,
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
  }
}

@media (min-width: 900px) {
  .browse__controls {
    flex-direction: row;
    align-items: stretch;
    gap: 0.85rem;
  }

  .seg {
    flex: 0 0 280px;
  }

  .search {
    flex: 1;
  }

  .skel-grid,
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.skel {
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  background: linear-gradient(110deg, #141414 25%, #1d1d1d 40%, #141414 55%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}

.tile {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.tile__frame {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 12px;
  background: #121212;
  isolation: isolate;
}

.tile__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.01);
  transition: transform 280ms cubic-bezier(0.23, 1, 0.32, 1);
}

.tile:active .tile__frame img,
.tile:hover .tile__frame img {
  transform: scale(1.05);
}

.tile__fallback {
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 94, 0, 0.28), transparent 50%),
    #151515;
}

.tile__shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, transparent 28%, transparent 48%, rgba(0, 0, 0, 0.82) 100%);
  pointer-events: none;
}

.tile__play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.tile__top {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  right: 0.55rem;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.45rem;
  border-radius: 6px;
  font-family: var(--font-accent);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  backdrop-filter: blur(8px);
}

.chip--plate {
  background: rgba(255, 94, 0, 0.9);
  color: #111;
}

.chip--gen {
  color: rgba(255, 255, 255, 0.9);
}

.chip--warn {
  margin-left: auto;
  background: rgba(250, 204, 21, 0.9);
  color: #111;
}

.tile__bottom {
  position: absolute;
  left: 0.65rem;
  right: 0.65rem;
  bottom: 0.65rem;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.tile__name,
.tile__sub {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile__name {
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.65);
}

.tile__sub {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
}

.pager {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.35rem;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.pager__btn {
  min-height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  background: #0c0c0c;
  color: #fff;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.pager__btn:first-child {
  justify-self: start;
  padding-inline: 0.9rem;
}

.pager__btn:last-child {
  justify-self: end;
  padding-inline: 0.9rem;
}

.pager__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pager__mid {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  font-family: var(--font-podium);
  color: #fff;
}

.pager__page {
  font-size: 1.35rem;
  letter-spacing: 0.04em;
}

.pager__of {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.45);
}

/* —— Viewer sheet —— */
.sheet {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  padding: 0;
}

.sheet__panel {
  width: min(100%, 640px);
  max-height: min(94vh, 920px);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.45rem 1rem calc(1rem + env(safe-area-inset-bottom, 0));
  border-radius: 18px 18px 0 0;
  background: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.55);
}

.sheet__grab {
  width: 42px;
  height: 4px;
  margin: 0.2rem auto 0.15rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
}

.sheet__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.sheet__plate {
  margin: 0 0 0.15rem;
  font-family: var(--font-accent);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--browse-orange);
}

.sheet__who h3 {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(1.15rem, 4.5vw, 1.45rem);
  letter-spacing: 0.03em;
  line-height: 1.1;
  color: #fff;
}

.sheet__meta {
  margin: 0.3rem 0 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.35;
}

.sheet__close {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  background: #141414;
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.sheet__stage {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  max-height: min(58vh, 560px);
  overflow: hidden;
  border-radius: 12px;
  background: #000;
}

.sheet__stage video,
.sheet__stage img {
  width: 100%;
  height: 100%;
  max-height: min(58vh, 560px);
  object-fit: contain;
  background: #000;
}

.sheet__stage.is-portrait video,
.sheet__stage.is-portrait img {
  max-width: min(380px, 100%);
  margin: 0 auto;
}

.sheet__warn {
  margin: 0;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  background: rgba(250, 204, 21, 0.1);
  color: #fde68a;
  font-size: 0.8rem;
  line-height: 1.4;
}

.sheet__actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.55rem;
}

.sheet__dl,
.sheet__sec {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: 12px;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
}

.sheet__dl {
  border: none;
  background: linear-gradient(135deg, #ff5e00, #ff8c00);
  color: #111;
}

.sheet__sec {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
}

@media (min-width: 720px) {
  .sheet {
    align-items: center;
    padding: 1.5rem;
  }

  .sheet__panel {
    border-radius: 16px;
    max-height: min(90vh, 860px);
    padding: 1rem 1.15rem 1.15rem;
  }

  .sheet__grab {
    display: none;
  }

  .sheet__actions {
    grid-template-columns: 1.4fr 0.8fr;
  }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 200ms ease;
}

.sheet-enter-active .sheet__panel,
.sheet-leave-active .sheet__panel {
  transition: transform 260ms cubic-bezier(0.23, 1, 0.32, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet__panel,
.sheet-leave-to .sheet__panel {
  transform: translateY(18%);
}

@media (prefers-reduced-motion: reduce) {
  .tile__frame img,
  .skel,
  .sheet-enter-active,
  .sheet-leave-active,
  .sheet-enter-active .sheet__panel,
  .sheet-leave-active .sheet__panel {
    transition: none !important;
    animation: none !important;
  }
}
</style>
