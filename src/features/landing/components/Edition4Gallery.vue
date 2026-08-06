<template>
  <section id="edicion-4-galeria" class="e4g" @contextmenu.prevent>
    <div class="e4g__head">
      <div class="e4g__titles">
        <p class="e4g__kicker">
          {{ competitionName || 'Live media · camarógrafos' }}
        </p>
        <h2 class="e4g__title">
          4ª <span class="accent">Edición</span>
        </h2>
        <p class="e4g__sub">
          Galería en vivo de la carrera. Vista web liviana —
          al abrir una, podés descargar el original HD.
        </p>
      </div>
      <div class="e4g__meta">
        <div class="e4g__tabs" role="tablist" aria-label="Tipo de media">
          <button
            type="button"
            role="tab"
            class="e4g__tab"
            :class="{ on: mediaTab === 'photo' }"
            :aria-selected="mediaTab === 'photo'"
            @click="setMediaTab('photo')"
          >
            Fotos
          </button>
          <button
            type="button"
            role="tab"
            class="e4g__tab"
            :class="{ on: mediaTab === 'video' }"
            :aria-selected="mediaTab === 'video'"
            @click="setMediaTab('video')"
          >
            Videos
          </button>
        </div>
        <span class="e4g__count">{{ totalLabel }}</span>
        <span class="e4g__lock">Descarga HD habilitada</span>
        <button
          v-if="mediaTab === 'photo'"
          type="button"
          class="e4g__upload"
          @click="openUpload"
        >
          Subir imagen
        </button>
      </div>
    </div>

    <div v-if="loading && !visibleItems.length" class="e4g__empty">Cargando galería…</div>
    <div v-else-if="error && !visibleItems.length" class="e4g__empty e4g__empty--err">{{ error }}</div>
    <div v-else-if="!visibleItems.length" class="e4g__empty">
      <template v-if="mediaTab === 'photo'">
        Aún no hay fotos públicas.
        <button type="button" class="e4g__empty-cta" @click="openUpload">Sé el primero en subir</button>
      </template>
      <template v-else>
        Aún no hay videos con versión web.
      </template>
    </div>

    <div v-else class="e4g__grid" @dragstart.prevent>
      <article
        v-for="(item, idx) in visibleItems"
        :key="item.id"
        class="cell"
        :class="[cellClass(idx), item.media_type === 'video' ? 'cell--video' : '']"
        @click="openViewer(idx)"
      >
        <img
          v-if="thumbSrc(item)"
          :src="thumbSrc(item)"
          :alt="caption(item)"
          class="cell__img"
          loading="lazy"
          decoding="async"
          draggable="false"
          @error="markBroken(item.id)"
        />
        <div v-if="item.media_type === 'video'" class="cell__play" aria-hidden="true">
          <span>▶</span>
        </div>
        <div class="cell__shield" aria-hidden="true" />
        <div class="cell__wm" aria-hidden="true">CHACAS · 4ª</div>
        <div class="cell__mark">
          <span v-if="item.media_type === 'video'" class="vid">Video</span>
          <span v-if="item.rider?.plate_number" class="plate">#{{ item.rider.plate_number }}</span>
          <span v-else class="gen">General</span>
        </div>
        <div class="cell__foot">
          <span v-if="creditIg(item)" class="cell__ig">
            <span class="cell__at">@</span><span class="cell__ig-handle">{{ creditIg(item) }}</span>
          </span>
          <strong v-else-if="creditName(item)" class="cell__name">{{ creditName(item) }}</strong>
        </div>
      </article>
    </div>

    <div v-if="visibleItems.length && mediaTab === 'photo'" class="e4g__pager">
      <p class="e4g__shown">Mostrando {{ visibleItems.length }} de {{ total }}</p>
      <button
        v-if="hasMore"
        ref="moreBtn"
        type="button"
        class="e4g__btn"
        :disabled="loading"
        @click="loadMore"
      >
        {{ loading ? 'Cargando…' : 'Ver más fotos' }}
      </button>
      <p v-else-if="total > perPage" class="e4g__end">Fin de la galería</p>
    </div>
    <p v-else-if="visibleItems.length && mediaTab === 'video'" class="e4g__end e4g__end--solo">
      Selección aleatoria de {{ visibleItems.length }} videos
    </p>

    <!-- Modal subir -->
    <Teleport to="body">
      <Transition name="up-fade">
        <div
          v-if="uploadOpen"
          class="up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="up-title"
          @click.self="closeUpload"
          @touchmove="onOverlayTouchMove"
        >
          <div class="up__atmosphere" aria-hidden="true">
            <div class="up__glow" />
            <div class="up__grain" />
          </div>

          <form
            class="up__card"
            @submit.prevent="submitUpload"
            @touchmove.stop
          >
            <div class="up__hazard" aria-hidden="true" />

            <header class="up__head">
              <div class="up__brand">
                <p class="up__edition">4ª edición · 2026</p>
                <h3 id="up-title">
                  Sube tu <span>toma</span>
                </h3>
                <p class="up__hint">
                  Fotos a <strong>General</strong>, para toda la comunidad.
                </p>
              </div>
              <button type="button" class="up__x" @click="closeUpload" aria-label="Cerrar">
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <div class="up__grid">
              <label class="up__field">
                <span>Tu nombre</span>
                <input
                  v-model.trim="form.name"
                  type="text"
                  required
                  minlength="2"
                  maxlength="255"
                  autocomplete="name"
                  placeholder="Tu nombre"
                  enterkeyhint="next"
                />
              </label>

              <label class="up__field">
                <span>Instagram <em>opcional</em></span>
                <div class="up__ig">
                  <span class="up__at" aria-hidden="true">@</span>
                  <input
                    v-model.trim="form.instagram"
                    type="text"
                    maxlength="100"
                    autocomplete="username"
                    placeholder="usuario"
                    enterkeyhint="done"
                  />
                </div>
              </label>
            </div>

            <label
              class="up__pick"
              :class="{ 'up__pick--filled': form.files.length }"
              @dragenter.prevent="dropActive = true"
              @dragover.prevent="dropActive = true"
              @dragleave.prevent="dropActive = false"
              @drop.prevent="onDrop"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp"
                multiple
                hidden
                @change="onFilesPicked"
              />
              <span class="up__pick-main">
                {{ form.files.length
                  ? `${form.files.length} foto${form.files.length === 1 ? '' : 's'}`
                  : 'Elegir fotos' }}
              </span>
              <span class="up__pick-sub">JPG, PNG o WebP · máx. 12</span>
            </label>

            <ul v-if="previews.length" class="up__previews">
              <li v-for="(p, i) in previews" :key="p.url">
                <img :src="p.url" :alt="p.name || 'Vista previa'" />
                <button
                  type="button"
                  class="up__rm"
                  :aria-label="`Quitar ${p.name || 'imagen'}`"
                  @click.prevent="removeFile(i)"
                >
                  ×
                </button>
              </li>
            </ul>

            <div v-if="uploading" class="up__progress" aria-live="polite">
              <div class="up__progress-bar" />
              <p>Subiendo a la galería…</p>
            </div>

            <p v-if="uploadError" class="up__err" role="alert">{{ uploadError }}</p>
            <p v-if="uploadOk" class="up__ok" role="status">{{ uploadOk }}</p>

            <div class="up__foot">
              <p class="up__legal">Se publica en General · descarga HD disponible</p>
              <button
                type="submit"
                class="up__submit"
                :disabled="uploading || !form.files.length || !form.name"
              >
                <span v-if="uploading">Publicando…</span>
                <span v-else>Publicar en General →</span>
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </Teleport>

    <!-- Viewer -->
    <Teleport to="body">
      <div
        v-if="viewerIndex != null && visibleItems[viewerIndex]"
        class="viewer"
        role="dialog"
        aria-modal="true"
        @click.self="closeViewer"
        @contextmenu.prevent
      >
        <button type="button" class="viewer__x" @click="closeViewer" aria-label="Cerrar">×</button>
        <button
          v-if="viewerIndex > 0"
          type="button"
          class="viewer__nav prev"
          @click="viewerIndex -= 1"
          aria-label="Anterior"
        >‹</button>
        <div class="viewer__stage" :class="{ 'viewer__stage--video': activeItem?.media_type === 'video' }" @dragstart.prevent>
          <video
            v-if="activeItem?.media_type === 'video'"
            :key="'vv-' + activeItem.id"
            class="viewer__video"
            :src="activeItem.view_url"
            :poster="thumbSrc(activeItem) || undefined"
            controls
            playsinline
            preload="metadata"
            controlslist="noplaybackrate"
          />
          <img
            v-else
            :src="activeItem?.view_url"
            :alt="caption(activeItem)"
            class="viewer__img"
            draggable="false"
          />
          <div class="viewer__shield" aria-hidden="true" />
          <div class="viewer__wm" aria-hidden="true">CHACAS XTREME · 4ª EDICIÓN</div>
        </div>
        <button
          v-if="viewerIndex < visibleItems.length - 1"
          type="button"
          class="viewer__nav next"
          @click="viewerIndex += 1"
          aria-label="Siguiente"
        >›</button>
        <div class="viewer__cap">
          <div>
            <strong v-if="activeItem?.rider">
              #{{ activeItem.rider.plate_number }}
              · {{ activeItem.rider.full_name }}
            </strong>
            <strong v-else-if="creditIg(activeItem)">
              <span class="viewer__at">@</span>{{ creditIg(activeItem) }}
            </strong>
            <strong v-else-if="creditName(activeItem)" class="viewer__name-sm">
              {{ creditName(activeItem) }}
            </strong>
            <strong v-else-if="activeItem?.media_type === 'video'">Video</strong>
            <strong v-else>Toma general</strong>
            <p v-if="activeItem?.photographer?.full_name && activeItem?.rider" class="viewer__tag">
              <template v-if="creditIg(activeItem)">
                <span class="viewer__at">@</span>{{ creditIg(activeItem) }}
              </template>
              <template v-else>{{ activeItem.photographer.full_name }}</template>
            </p>
            <p v-if="!activeItem?.rider && activeItem?.is_general" class="viewer__tag">General</p>
            <p v-if="activeItem?.media_type === 'video' && !activeItem.has_web_preview" class="viewer__warn">
              Sin versión web — puede no reproducir. Usá Descargar original HD.
            </p>
          </div>
          <div class="viewer__actions">
            <a
              v-if="downloadHref(activeItem)"
              class="viewer__dl"
              :href="downloadHref(activeItem)"
              target="_blank"
              rel="noopener noreferrer"
            >
              Descargar original HD
            </a>
            <p class="viewer__note">
              {{ viewerIndex + 1 }} / {{ visibleItems.length }}
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { fetchEdition4Gallery, uploadPublicGalleryPhotos } from '../api/editionGalleryApi';

const route = useRoute();
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
/** Fotos paginadas. Videos: muestra fija aleatoria. */
const PHOTO_PER_PAGE = 18;
const VIDEO_SAMPLE = 40;

const mediaTab = ref('photo'); // photo | video
const items = ref([]);
/** IDs cuyo thumb falló al cargar — no se muestran en grilla. */
const brokenIds = ref(/** @type {Record<number, true>} */ ({}));
const page = ref(1);
const lastPage = ref(1);
const total = ref(0);
const loading = ref(false);
const error = ref('');
const viewerIndex = ref(null);
const competitionName = ref('');
const moreBtn = ref(null);

const uploadOpen = ref(false);
const uploading = ref(false);
const uploadError = ref('');
const uploadOk = ref('');
const fileInput = ref(null);
const dropActive = ref(false);
const form = ref({ name: '', instagram: '', files: [] });
/** @type {import('vue').Ref<Array<{ url: string, name: string }>>} */
const previews = ref([]);
let lockedScrollY = 0;

const perPage = computed(() => PHOTO_PER_PAGE);
const hasMore = computed(() => mediaTab.value === 'photo' && page.value < lastPage.value);
const visibleItems = computed(() => items.value.filter((item) => {
  if (brokenIds.value[item.id]) return false;
  return Boolean(thumbSrc(item));
}));
const activeItem = computed(() => (
  viewerIndex.value != null ? visibleItems.value[viewerIndex.value] : null
));
const totalLabel = computed(() => {
  if (!total.value) return mediaTab.value === 'video' ? '0 videos' : '0 tomas';
  if (mediaTab.value === 'video') {
    return `${total.value} video${total.value === 1 ? '' : 's'}`;
  }
  return `${total.value} toma${total.value === 1 ? '' : 's'}`;
});

/** Ritmo tipo Instagram Explore: unas grandes (2×2), otras chicas */
function cellClass(idx) {
  const i = idx % 10;
  if (i === 0 || i === 6) return 'cell--hero';
  if (i === 3 || i === 8) return 'cell--tall';
  return 'cell--sm';
}

function caption(item) {
  if (item?.rider) return `#${item.rider.plate_number} ${item.rider.full_name}`;
  if (item?.media_type === 'video') return 'Video · 4ª edición';
  return 'Toma general · 4ª edición';
}

/** IG real; oculta placeholders __public_ / __admin_ */
function creditIg(item) {
  const ig = String(item?.photographer?.instagram || '').trim();
  if (!ig || ig.startsWith('__')) return '';
  return ig.replace(/^@+/, '');
}

/** Nombre corto si no hay IG */
function creditName(item) {
  if (creditIg(item)) return '';
  const name = String(item?.rider?.full_name || item?.photographer?.full_name || '').trim();
  if (!name) return '';
  if (name.length <= 18) return name;
  return `${name.slice(0, 16)}…`;
}

/** En grilla: solo JPEG liviano. Nunca el mp4. */
function thumbSrc(item) {
  if (!item) return '';
  return item.thumb_url || (item.media_type === 'photo' ? item.view_url : '') || '';
}

/** Original HD: API download_url o fallback por id. */
function downloadHref(item) {
  if (!item?.id) return '';
  if (item.download_url) return item.download_url;
  return `${API_BASE}/api/race-media/${item.id}/download-public`;
}

function markBroken(id) {
  if (!id || brokenIds.value[id]) return;
  brokenIds.value = { ...brokenIds.value, [id]: true };
  if (viewerIndex.value != null && viewerIndex.value >= visibleItems.value.length) {
    viewerIndex.value = visibleItems.value.length ? visibleItems.value.length - 1 : null;
  }
}

function setMediaTab(tab) {
  if (mediaTab.value === tab) return;
  mediaTab.value = tab;
  viewerIndex.value = null;
  items.value = [];
  brokenIds.value = {};
  page.value = 1;
  lastPage.value = 1;
  total.value = 0;
  loadPage(1);
}

async function loadPage(p, { append = false } = {}) {
  loading.value = true;
  error.value = '';
  try {
    const isVideo = mediaTab.value === 'video';
    const res = await fetchEdition4Gallery({
      page: p,
      perPage: PHOTO_PER_PAGE,
      mediaType: mediaTab.value,
      random: isVideo,
      limit: VIDEO_SAMPLE,
    });
    competitionName.value = res.competition?.name || '';
    const rows = (res.data || []).filter((item) => Boolean(thumbSrc(item)));
    items.value = append && !isVideo ? [...items.value, ...rows] : rows;
    if (!append) brokenIds.value = {};
    page.value = res.meta?.current_page || p;
    lastPage.value = res.meta?.last_page || 1;
    total.value = res.meta?.total || rows.length;
  } catch (e) {
    if (!append) {
      items.value = [];
      error.value = e.message || 'No se pudo cargar la galería.';
    }
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  loadPage(page.value + 1, { append: true });
}

function lockBodyScroll() {
  lockedScrollY = window.scrollY || window.pageYOffset || 0;
  const body = document.body;
  body.style.position = 'fixed';
  body.style.top = `-${lockedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  body.style.touchAction = 'none';
}

function unlockBodyScroll() {
  const body = document.body;
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  body.style.overflow = '';
  body.style.touchAction = '';
  window.scrollTo(0, lockedScrollY);
}

/** Evita que el fondo se mueva al tocar fuera de la card. */
function onOverlayTouchMove(e) {
  const card = e.target?.closest?.('.up__card');
  if (!card) e.preventDefault();
}

function openViewer(idx) {
  viewerIndex.value = idx;
  if (!uploadOpen.value) lockBodyScroll();
}

function closeViewer() {
  viewerIndex.value = null;
  if (!uploadOpen.value) unlockBodyScroll();
}

function revokePreviews() {
  previews.value.forEach((p) => URL.revokeObjectURL(p.url));
  previews.value = [];
}

function openUpload() {
  if (!uploadOpen.value) lockBodyScroll();
  uploadOpen.value = true;
  uploadError.value = '';
  uploadOk.value = '';
  dropActive.value = false;
}

function closeUpload() {
  uploadOpen.value = false;
  uploading.value = false;
  uploadError.value = '';
  uploadOk.value = '';
  dropActive.value = false;
  form.value = { name: form.value.name, instagram: form.value.instagram, files: [] };
  revokePreviews();
  if (viewerIndex.value == null) unlockBodyScroll();
}

function isImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || '');
}

function setFiles(fileList) {
  const list = Array.from(fileList || []).filter(isImageFile).slice(0, 12);
  revokePreviews();
  form.value.files = list;
  previews.value = list.map((f) => ({
    url: URL.createObjectURL(f),
    name: f.name || 'foto',
  }));
  uploadError.value = '';
  uploadOk.value = '';
  if (fileInput.value) fileInput.value.value = '';
}

function onFilesPicked(e) {
  setFiles(e.target.files);
}

function onDrop(e) {
  dropActive.value = false;
  setFiles(e.dataTransfer?.files);
}

function removeFile(index) {
  const doomed = previews.value[index];
  if (doomed?.url) URL.revokeObjectURL(doomed.url);
  form.value.files = form.value.files.filter((_, i) => i !== index);
  previews.value = previews.value.filter((_, i) => i !== index);
}

async function submitUpload() {
  uploadError.value = '';
  uploadOk.value = '';
  if (!form.value.name || form.value.files.length === 0) {
    uploadError.value = 'Nombre e imágenes son obligatorios.';
    return;
  }
  uploading.value = true;
  try {
    const res = await uploadPublicGalleryPhotos({
      fullName: form.value.name,
      instagram: form.value.instagram.replace(/^@+/, ''),
      files: form.value.files,
    });
    uploadOk.value = res.message || '¡Publicado en la galería!';
    form.value.files = [];
    revokePreviews();
    if (fileInput.value) fileInput.value.value = '';
    await loadPage(1);
    setTimeout(() => closeUpload(), 1100);
  } catch (e) {
    uploadError.value = e.message || 'No se pudo subir.';
  } finally {
    uploading.value = false;
  }
}

function onKey(e) {
  if (uploadOpen.value && e.key === 'Escape') {
    closeUpload();
    return;
  }
  if (viewerIndex.value == null) return;
  if (e.key === 'Escape') closeViewer();
  if (e.key === 'ArrowRight' && viewerIndex.value < visibleItems.value.length - 1) {
    viewerIndex.value += 1;
  }
  if (e.key === 'ArrowLeft' && viewerIndex.value > 0) {
    viewerIndex.value -= 1;
  }
}

let pollTimer = null;
let io = null;

watch(moreBtn, (el, _, onCleanup) => {
  if (!el || !io) return;
  io.observe(el);
  onCleanup(() => io?.unobserve(el));
});

function shouldOpenPublicUpload() {
  if (route.meta?.openPublicUpload) return true;
  const q = route.query?.upload ?? route.query?.subir;
  if (q == null) return false;
  const v = String(q).toLowerCase();
  return v === '1' || v === 'true' || v === 'si' || v === 'sí' || v === '';
}

async function openPublicUploadFromUrl() {
  if (!shouldOpenPublicUpload()) return;
  // No scrollIntoView: en móvil mueve el fondo y el modal “baila”.
  openUpload();
}

onMounted(() => {
  loadPage(1);
  window.addEventListener('keydown', onKey);

  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) loadMore();
    },
    { rootMargin: '280px' }
  );
  if (moreBtn.value) io.observe(moreBtn.value);

  pollTimer = setInterval(() => {
    if (document.hidden || viewerIndex.value != null || uploadOpen.value || page.value > 1) return;
    loadPage(1);
  }, 60000);

  if (shouldOpenPublicUpload()) {
    nextTick(() => openPublicUploadFromUrl());
  }
});

watch(
  () => [route.fullPath, route.name, route.meta?.openPublicUpload],
  () => {
    if (shouldOpenPublicUpload() && !uploadOpen.value) {
      nextTick(() => openPublicUploadFromUrl());
    }
  },
);

onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  if (uploadOpen.value || viewerIndex.value != null) unlockBodyScroll();
  if (pollTimer) clearInterval(pollTimer);
  io?.disconnect();
  revokePreviews();
});
</script>

<style scoped>
.e4g {
  position: relative;
  padding: clamp(3.5rem, 8vw, 6rem) var(--container-px);
  background: #000;
  color: #fff;
  overflow: hidden;
}

.e4g::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--primary-color);
}

.e4g__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  margin: 0 auto clamp(1.75rem, 4vw, 2.75rem);
  flex-wrap: wrap;
  max-width: 1400px;
}

.e4g__kicker {
  margin: 0 0 0.4rem;
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.e4g__title {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(2.8rem, 10vw, 5.5rem);
  letter-spacing: 0.04em;
  line-height: 0.9;
}

.e4g__title .accent {
  color: var(--primary-color);
}

.e4g__sub {
  margin: 0.85rem 0 0;
  max-width: 28rem;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.98rem;
  line-height: 1.5;
}

.e4g__meta {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
}

.e4g__tabs {
  display: inline-flex;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.e4g__tab {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-accent);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.55rem 0.95rem;
  cursor: pointer;
}

.e4g__tab.on {
  background: var(--primary-color);
  color: #111;
}

.e4g__count {
  font-family: var(--font-podium);
  font-size: 1.4rem;
  letter-spacing: 0.04em;
}

.e4g__lock {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--primary-color);
  border: 1px solid rgba(255, 94, 0, 0.45);
  padding: 0.3rem 0.55rem;
}

.e4g__upload {
  margin-top: 0.35rem;
  border: 0;
  background: var(--primary-color);
  color: #111;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.75rem 1.1rem;
  cursor: pointer;
  transition: filter 160ms ease, transform 160ms ease;
}

.e4g__upload:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.e4g__empty-cta {
  display: inline-flex;
  margin-top: 0.85rem;
  border: 0;
  background: var(--primary-color);
  color: #111;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.75rem 1.15rem;
  cursor: pointer;
}

.e4g__empty {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 0;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.95rem;
}

.e4g__empty--err {
  color: #fca5a5;
}

.e4g__link {
  display: inline;
  margin-left: 0.35rem;
  border: 0;
  background: none;
  color: var(--primary-color);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* —— Grid estilo Instagram Explore —— */
.e4g__grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(110px, 14vw);
  grid-auto-flow: dense;
  gap: 0.45rem;
}

@media (max-width: 720px) {
  .e4g__grid {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(100px, 28vw);
    gap: 0.35rem;
  }
}

.cell {
  position: relative;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: zoom-in;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: border-color 200ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cell--sm {
  grid-column: span 2;
  grid-row: span 2;
}

.cell--tall {
  grid-column: span 2;
  grid-row: span 3;
}

.cell--hero {
  grid-column: span 4;
  grid-row: span 4;
}

@media (max-width: 720px) {
  .cell--sm {
    grid-column: span 1;
    grid-row: span 1;
  }
  .cell--tall {
    grid-column: span 1;
    grid-row: span 2;
  }
  .cell--hero {
    grid-column: span 2;
    grid-row: span 2;
  }
}

@media (hover: hover) and (pointer: fine) {
  .cell:hover {
    border-color: rgba(255, 94, 0, 0.65);
  }
}

.cell__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  background: #111;
}

.cell--video {
  cursor: pointer;
}

.cell__play {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.cell__play span {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  font-size: 0.85rem;
  padding-left: 3px;
}

.cell__shield,
.viewer__shield {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: transparent;
}

.cell__wm {
  position: absolute;
  right: 0.55rem;
  bottom: 2.4rem;
  z-index: 3;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  color: rgba(255, 94, 0, 0.45);
  pointer-events: none;
  transform: rotate(-8deg);
}

.cell__mark {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  z-index: 3;
  pointer-events: none;
}

/* En teléfono: sin placa / General (sí se ven en el detalle). */
@media (max-width: 768px) {
  .cell__mark .plate,
  .cell__mark .gen {
    display: none;
  }
}

.plate,
.gen,
.vid {
  display: inline-block;
  margin-right: 0.25rem;
  padding: 0.2rem 0.45rem;
  font-family: var(--font-accent);
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--primary-color);
  color: #111;
}

.vid {
  background: rgba(255, 94, 0, 0.9);
}

.gen {
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.cell__foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  padding: 1.6rem 0.65rem 0.55rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.92));
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

.cell__ig {
  display: inline-flex;
  align-items: baseline;
  gap: 0.05em;
  max-width: 100%;
  color: #fff;
  line-height: 1.05;
  overflow: hidden;
}

.cell__at {
  flex-shrink: 0;
  font-family: var(--font-podium);
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #fff;
}

.cell__ig-handle {
  font-family: var(--font-accent);
  font-weight: 800;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tamaño del IG según tamaño de celda */
.cell--sm .cell__ig {
  font-size: clamp(0.55rem, 2.4vw, 0.72rem);
}

.cell--tall .cell__ig {
  font-size: clamp(0.68rem, 2.8vw, 0.9rem);
}

.cell--hero .cell__ig {
  font-size: clamp(0.85rem, 3.2vw, 1.2rem);
}

.cell__name {
  font-size: 0.65rem !important;
  font-weight: 600 !important;
  color: rgba(255, 255, 255, 0.85) !important;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell--hero .cell__name {
  font-size: 0.85rem !important;
}

.e4g__pager {
  max-width: 1400px;
  margin: 1.75rem auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.e4g__end--solo {
  max-width: 1400px;
  margin: 1.25rem auto 0;
  text-align: center;
}

.e4g__shown,
.e4g__end {
  margin: 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.82rem;
}

.e4g__btn {
  border: 1px solid rgba(255, 94, 0, 0.55);
  background: transparent;
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.85rem 1.4rem;
  cursor: pointer;
}

.e4g__btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: #111;
}

.e4g__btn:disabled {
  opacity: 0.55;
  cursor: wait;
}

/* Upload modal — fijo en móvil (sin bounce del fondo) */
.up {
  position: fixed;
  inset: 0;
  z-index: 110000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: none;
  height: 100%;
  height: 100dvh;
  max-height: 100dvh;
}

@media (min-width: 720px) {
  .up {
    align-items: center;
    padding: 1.25rem;
    touch-action: auto;
  }
}

.up__atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.82);
}

.up__glow {
  display: none;
}

.up__grain {
  display: none;
}

.up__card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-height: min(88svh, 720px);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  margin: 0;
  padding: 0 1rem calc(1rem + env(safe-area-inset-bottom, 0px));
  color: #fff;
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 0;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.55);
  transform: translateZ(0);
  will-change: transform;
  animation: up-rise 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@media (min-width: 720px) {
  .up__card {
    width: min(440px, 100%);
    max-height: min(86vh, 760px);
    border-radius: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0 1.25rem 1.25rem;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  }
}

.up__hazard {
  height: 6px;
  margin: 0 -1rem 1rem;
  background: repeating-linear-gradient(
    -45deg,
    #ff5e00,
    #ff5e00 8px,
    #111 8px,
    #111 16px
  );
}

@media (min-width: 720px) {
  .up__hazard {
    margin: 0 -1.25rem 1.1rem;
    border-radius: 16px 16px 0 0;
  }
}

.up__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.up__edition {
  margin: 0 0 0.3rem;
  color: #ff8c00;
  font-family: var(--font-accent);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.up__brand h3 {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(1.6rem, 7vw, 2rem);
  line-height: 0.98;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.up__brand h3 span {
  color: var(--primary-color);
}

.up__hint {
  margin: 0.5rem 0 0;
  max-width: 36ch;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.84rem;
  line-height: 1.4;
}

.up__hint strong {
  color: #fdba74;
  font-weight: 800;
}

.up__x {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.up__grid {
  display: grid;
  gap: 0.7rem;
  margin-bottom: 0.85rem;
}

.up__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.up__field span {
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.up__field em {
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  color: rgba(255, 255, 255, 0.3);
}

.up__field input {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: #000;
  color: #fff;
  padding: 0.85rem 0.9rem;
  font-size: 16px; /* evita zoom iOS */
  outline: none;
}

.up__field input::placeholder {
  color: rgba(255, 255, 255, 0.28);
}

.up__field input:focus {
  border-color: rgba(255, 94, 0, 0.7);
}

.up__ig {
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: #000;
}

.up__ig:focus-within {
  border-color: rgba(255, 94, 0, 0.7);
}

.up__at {
  display: flex;
  align-items: center;
  padding: 0 0.1rem 0 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 700;
  user-select: none;
}

.up__ig input {
  flex: 1;
  border: 0;
  border-radius: 12px;
  background: transparent;
  padding-left: 0.25rem;
}

.up__ig input:focus {
  border-color: transparent;
}

/* Selector de fotos — minimal */
.up__pick {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 88px;
  margin: 0 0 0.85rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  text-align: center;
  transition: border-color 150ms ease, background 150ms ease;
}

.up__pick:hover,
.up__pick:focus-within {
  border-color: rgba(255, 94, 0, 0.65);
  background: rgba(255, 94, 0, 0.06);
}

.up__pick--filled {
  border-color: rgba(255, 94, 0, 0.45);
}

.up__pick-main {
  font-family: var(--font-accent);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
}

.up__pick-sub {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.up__previews {
  list-style: none;
  margin: 0 0 0.85rem;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}

.up__previews li {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  background: #111;
}

.up__previews img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.up__rm {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}

.up__progress {
  margin: 0 0 0.75rem;
}

.up__progress-bar {
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff5e00, #ffb347, #ff5e00);
  background-size: 200% 100%;
  animation: up-shine 1.1s linear infinite;
}

.up__progress p {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.up__err {
  margin: 0 0 0.6rem;
  padding: 0.6rem 0.7rem;
  border-radius: 10px;
  background: rgba(248, 113, 113, 0.12);
  color: #fca5a5;
  font-size: 0.84rem;
}

.up__ok {
  margin: 0 0 0.6rem;
  padding: 0.6rem 0.7rem;
  border-radius: 10px;
  background: rgba(52, 211, 153, 0.12);
  color: #86efac;
  font-size: 0.84rem;
  font-weight: 700;
}

.up__foot {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding-top: 0.5rem;
  padding-bottom: 0.15rem;
  background: #0b0b0b;
}

.up__legal {
  margin: 0;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.32);
}

.up__submit {
  width: 100%;
  min-height: 52px;
  border: 0;
  border-radius: 12px;
  background: #ff5e00;
  color: #111;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.95rem 1rem;
  cursor: pointer;
}

.up__submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.up-fade-enter-active,
.up-fade-leave-active {
  transition: opacity 180ms ease;
}

.up-fade-enter-active .up__card,
.up-fade-leave-active .up__card {
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.up-fade-enter-from,
.up-fade-leave-to {
  opacity: 0;
}

.up-fade-enter-from .up__card,
.up-fade-leave-to .up__card {
  transform: translate3d(0, 18px, 0);
}

@keyframes up-rise {
  from {
    transform: translate3d(0, 16px, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes up-shine {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

.viewer {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.94);
  user-select: none;
}

.viewer__stage {
  position: relative;
  width: min(960px, 100%);
  max-height: min(72vh, 780px);
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer__img {
  display: block;
  max-width: 100%;
  max-height: min(72vh, 780px);
  width: auto;
  height: auto;
  pointer-events: none;
}

.viewer__stage--video .viewer__shield {
  pointer-events: none;
}

.viewer__video {
  display: block;
  position: relative;
  z-index: 4;
  width: min(960px, 100%);
  max-height: min(68vh, 720px);
  background: #000;
  outline: none;
}

.viewer__warn {
  margin-top: 0.35rem !important;
  color: #fde68a !important;
}

.viewer__wm {
  position: absolute;
  left: 50%;
  bottom: 10%;
  z-index: 3;
  transform: translateX(-50%) rotate(-6deg);
  font-family: var(--font-accent);
  font-size: clamp(0.7rem, 2.5vw, 1rem);
  font-weight: 900;
  letter-spacing: 0.18em;
  color: rgba(255, 94, 0, 0.45);
  white-space: nowrap;
  pointer-events: none;
}

.viewer__cap {
  width: min(960px, 100%);
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.viewer__cap strong {
  display: block;
  font-family: var(--font-podium);
  font-size: 1.25rem;
  letter-spacing: 0.03em;
}

.viewer__at {
  font-family: var(--font-podium);
  font-weight: 900;
}

.viewer__tag {
  margin: 0.35rem 0 0 !important;
  color: rgba(255, 255, 255, 0.55) !important;
  font-size: 0.72rem !important;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.viewer__cap p {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.82rem;
}

.viewer__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.55rem;
}

.viewer__dl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1rem;
  border: 1px solid rgba(255, 94, 0, 0.85);
  background: rgba(255, 94, 0, 0.95);
  color: #111;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
}

.viewer__dl:hover {
  background: #fff;
  border-color: #fff;
}

.viewer__name-sm {
  font-size: 0.95rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em !important;
}

.viewer__note {
  margin: 0 !important;
  color: var(--primary-color) !important;
  font-size: 0.65rem !important;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.viewer__x {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: #000;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
}

.viewer__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 56px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 1.75rem;
  cursor: pointer;
  z-index: 5;
}

.viewer__nav.prev { left: 0.75rem; }
.viewer__nav.next { right: 0.75rem; }

@media (max-width: 640px) {
  .viewer__nav { display: none; }
}
</style>
