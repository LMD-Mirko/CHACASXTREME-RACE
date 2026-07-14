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
          Galería en vivo de lo que se captura en carrera. Solo visualización —
          el original queda con el camarógrafo y el competidor.
        </p>
      </div>
      <div class="e4g__meta">
        <span class="e4g__count">{{ totalLabel }}</span>
        <span class="e4g__lock">Sin descarga</span>
        <button type="button" class="e4g__upload" @click="openUpload">
          Subir imagen
        </button>
      </div>
    </div>

    <div v-if="loading && !items.length" class="e4g__empty">Cargando galería…</div>
    <div v-else-if="error && !items.length" class="e4g__empty e4g__empty--err">{{ error }}</div>
    <div v-else-if="!items.length" class="e4g__empty">
      Aún no hay fotos. Sé el primero:
      <button type="button" class="e4g__link" @click="openUpload">Subir imagen</button>
    </div>

    <div v-else class="e4g__grid" @dragstart.prevent>
      <article
        v-for="(item, idx) in items"
        :key="item.id"
        class="cell"
        :class="cellClass(idx)"
        @click="openViewer(idx)"
      >
        <img
          :src="item.view_url"
          :alt="caption(item)"
          class="cell__img"
          loading="lazy"
          decoding="async"
          draggable="false"
        />
        <div class="cell__shield" aria-hidden="true" />
        <div class="cell__wm" aria-hidden="true">CHACAS · 4ª</div>
        <div class="cell__mark">
          <span v-if="item.rider?.plate_number" class="plate">#{{ item.rider.plate_number }}</span>
          <span v-else class="gen">General</span>
        </div>
        <div class="cell__foot">
          <strong v-if="item.rider?.full_name">{{ item.rider.full_name }}</strong>
          <strong v-else-if="item.photographer?.full_name">{{ item.photographer.full_name }}</strong>
          <span v-if="item.photographer?.instagram">@{{ item.photographer.instagram }}</span>
        </div>
      </article>
    </div>

    <div v-if="items.length" class="e4g__pager">
      <p class="e4g__shown">Mostrando {{ items.length }} de {{ total }}</p>
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

    <!-- Modal subir -->
    <Teleport to="body">
      <div
        v-if="uploadOpen"
        class="up"
        role="dialog"
        aria-modal="true"
        @click.self="closeUpload"
      >
        <form class="up__card" @submit.prevent="submitUpload">
          <header class="up__head">
            <div>
              <p class="up__kicker">Categoría General</p>
              <h3>Subir imagen</h3>
            </div>
            <button type="button" class="up__x" @click="closeUpload" aria-label="Cerrar">×</button>
          </header>

          <p class="up__hint">
            Cualquiera puede aportar. Las fotos van a <strong>General</strong>
            (sin placa de competidor).
          </p>

          <label class="up__field">
            <span>Tu nombre</span>
            <input v-model.trim="form.name" type="text" required minlength="2" maxlength="255" autocomplete="name" />
          </label>

          <label class="up__field">
            <span>Instagram <em>(opcional)</em></span>
            <div class="up__ig">
              <span class="up__at" aria-hidden="true">@</span>
              <input v-model.trim="form.instagram" type="text" maxlength="100" autocomplete="username" />
            </div>
          </label>

          <label class="up__drop">
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp"
              multiple
              hidden
              @change="onFilesPicked"
            />
            <span v-if="!form.files.length" class="up__drop-label">
              Elegir imágenes
              <small>JPG, PNG o WebP · hasta 12</small>
            </span>
            <span v-else class="up__drop-label">
              {{ form.files.length }} archivo{{ form.files.length === 1 ? '' : 's' }} listo{{ form.files.length === 1 ? '' : 's' }}
              <small>Toca para cambiar</small>
            </span>
          </label>

          <ul v-if="previews.length" class="up__previews">
            <li v-for="(p, i) in previews" :key="p + i">
              <img :src="p" alt="" />
            </li>
          </ul>

          <p v-if="uploadError" class="up__err">{{ uploadError }}</p>
          <p v-if="uploadOk" class="up__ok">{{ uploadOk }}</p>

          <button type="submit" class="up__submit" :disabled="uploading || !form.files.length">
            {{ uploading ? 'Subiendo…' : 'Publicar en General' }}
          </button>
        </form>
      </div>
    </Teleport>

    <!-- Viewer -->
    <Teleport to="body">
      <div
        v-if="viewerIndex != null && items[viewerIndex]"
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
        <div class="viewer__stage" @dragstart.prevent>
          <img
            :src="items[viewerIndex].view_url"
            :alt="caption(items[viewerIndex])"
            class="viewer__img"
            draggable="false"
          />
          <div class="viewer__shield" aria-hidden="true" />
          <div class="viewer__wm" aria-hidden="true">CHACAS XTREME · 4ª EDICIÓN · SOLO VISTA</div>
        </div>
        <button
          v-if="viewerIndex < items.length - 1"
          type="button"
          class="viewer__nav next"
          @click="viewerIndex += 1"
          aria-label="Siguiente"
        >›</button>
        <div class="viewer__cap">
          <div>
            <strong v-if="items[viewerIndex].rider">
              #{{ items[viewerIndex].rider.plate_number }}
              · {{ items[viewerIndex].rider.full_name }}
            </strong>
            <strong v-else>Toma general</strong>
            <p v-if="items[viewerIndex].photographer">
              {{ items[viewerIndex].photographer.full_name }}
              <template v-if="items[viewerIndex].photographer.instagram">
                · @{{ items[viewerIndex].photographer.instagram }}
              </template>
            </p>
          </div>
          <p class="viewer__note">
            {{ viewerIndex + 1 }} / {{ items.length }} · descarga deshabilitada
          </p>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { fetchEdition4Gallery, uploadPublicGalleryPhotos } from '../api/editionGalleryApi';

const perPage = 18;
const items = ref([]);
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
const form = ref({ name: '', instagram: '', files: [] });
const previews = ref([]);

const hasMore = computed(() => page.value < lastPage.value);
const totalLabel = computed(() => {
  if (!total.value) return '0 tomas';
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
  return 'Toma general · 4ª edición';
}

async function loadPage(p, { append = false } = {}) {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetchEdition4Gallery({ page: p, perPage, mediaType: 'photo' });
    competitionName.value = res.competition?.name || '';
    const rows = res.data || [];
    items.value = append ? [...items.value, ...rows] : rows;
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

function openViewer(idx) {
  viewerIndex.value = idx;
  document.body.style.overflow = 'hidden';
}

function closeViewer() {
  viewerIndex.value = null;
  if (!uploadOpen.value) document.body.style.overflow = '';
}

function revokePreviews() {
  previews.value.forEach((u) => URL.revokeObjectURL(u));
  previews.value = [];
}

function openUpload() {
  uploadOpen.value = true;
  uploadError.value = '';
  uploadOk.value = '';
  document.body.style.overflow = 'hidden';
}

function closeUpload() {
  uploadOpen.value = false;
  uploading.value = false;
  uploadError.value = '';
  uploadOk.value = '';
  form.value = { name: form.value.name, instagram: form.value.instagram, files: [] };
  revokePreviews();
  if (viewerIndex.value == null) document.body.style.overflow = '';
}

function onFilesPicked(e) {
  const list = Array.from(e.target.files || []).slice(0, 12);
  revokePreviews();
  form.value.files = list;
  previews.value = list.map((f) => URL.createObjectURL(f));
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
    uploadOk.value = res.message || 'Publicado.';
    form.value.files = [];
    revokePreviews();
    if (fileInput.value) fileInput.value.value = '';
    await loadPage(1);
    setTimeout(() => closeUpload(), 900);
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
  if (e.key === 'ArrowRight' && viewerIndex.value < items.value.length - 1) {
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
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  document.body.style.overflow = '';
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
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
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

.plate,
.gen {
  display: inline-block;
  padding: 0.2rem 0.45rem;
  font-family: var(--font-accent);
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--primary-color);
  color: #111;
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

.cell__foot strong {
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
}

.e4g__pager {
  max-width: 1400px;
  margin: 1.75rem auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
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

/* Upload modal */
.up {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.88);
}

.up__card {
  width: min(420px, 100%);
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 1.35rem 1.25rem 1.25rem;
  color: #fff;
}

.up__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.up__kicker {
  margin: 0 0 0.25rem;
  color: var(--primary-color);
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.up__head h3 {
  margin: 0;
  font-family: var(--font-podium);
  font-size: 1.55rem;
  letter-spacing: 0.03em;
}

.up__x {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #fff;
  font-size: 1.35rem;
  cursor: pointer;
}

.up__hint {
  margin: 0 0 1.1rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.86rem;
  line-height: 1.45;
}

.up__hint strong {
  color: var(--primary-color);
  font-weight: 800;
}

.up__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}

.up__field span {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.up__field em {
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  color: rgba(255, 255, 255, 0.35);
}

.up__field input {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: #000;
  color: #fff;
  padding: 0.7rem 0.75rem;
  font-size: 0.95rem;
  outline: none;
}

.up__field input:focus {
  border-color: rgba(255, 94, 0, 0.7);
}

.up__ig {
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: #000;
}

.up__ig:focus-within {
  border-color: rgba(255, 94, 0, 0.7);
}

.up__at {
  display: flex;
  align-items: center;
  padding: 0 0.15rem 0 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 700;
  user-select: none;
}

.up__ig input {
  flex: 1;
  border: 0;
  padding-left: 0.2rem;
}

.up__ig input:focus {
  border-color: transparent;
}

.up__drop {
  display: block;
  margin: 0.4rem 0 0.85rem;
  border: 1px dashed rgba(255, 94, 0, 0.45);
  background: rgba(255, 94, 0, 0.06);
  padding: 1.15rem 0.85rem;
  text-align: center;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
}

.up__drop:hover {
  background: rgba(255, 94, 0, 0.12);
  border-color: var(--primary-color);
}

.up__drop-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.up__drop-label small {
  font-family: inherit;
  font-weight: 600;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-transform: none;
  color: rgba(255, 255, 255, 0.4);
}

.up__previews {
  list-style: none;
  margin: 0 0 0.85rem;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
}

.up__previews li {
  aspect-ratio: 1;
  overflow: hidden;
  background: #111;
}

.up__previews img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.up__err {
  margin: 0 0 0.65rem;
  color: #fca5a5;
  font-size: 0.85rem;
}

.up__ok {
  margin: 0 0 0.65rem;
  color: #86efac;
  font-size: 0.85rem;
}

.up__submit {
  width: 100%;
  border: 0;
  background: var(--primary-color);
  color: #111;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.95rem 1rem;
  cursor: pointer;
}

.up__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.viewer__cap p {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.82rem;
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
