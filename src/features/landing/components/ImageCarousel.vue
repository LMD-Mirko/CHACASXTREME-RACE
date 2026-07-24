<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { fetchGalleryAll } from '@/composables/useBackendApi';

const mainImgsEager = import.meta.glob(
  '@/assets/images/chacas/*[0-9]*.webp',
  { eager: true, query: '?url', import: 'default' }
);
const chacasImgEager = import.meta.glob(
  '@/assets/images/chacas/chacas.webp',
  { eager: true, query: '?url', import: 'default' }
);
const folder3ImgsEager = import.meta.glob(
  '@/assets/images/chacas/3/*.webp',
  { eager: true, query: '?url', import: 'default' }
);

const sortedMain = Object.entries(mainImgsEager)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const chacasUrl = Object.values(chacasImgEager)[0];

const sortedFolder3 = Object.entries(folder3ImgsEager)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const defaultImages = computed(() => [...sortedMain, chacasUrl, ...sortedFolder3.slice(0, 6), ...sortedFolder3.slice(6)]);
const remoteGalleryImages = ref([]);
const sourceImages = computed(() => {
  const merged = [...(remoteGalleryImages.value || []), ...defaultImages.value];
  const seen = new Set();
  return merged.filter((u) => {
    if (!u) return false;
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
});

const imagesRow1 = computed(() => sourceImages.value.slice(0, Math.ceil(sourceImages.value.length / 2)));
const imagesRow2 = computed(() => sourceImages.value.slice(Math.ceil(sourceImages.value.length / 2)));

const selectedImage = ref(null);
const allImages = computed(() => sourceImages.value);

const activeIndex = computed(() => {
  if (!selectedImage.value) return -1;
  return allImages.value.indexOf(selectedImage.value);
});

const openLightbox = (img) => {
  if (suppressClick.value) return;
  selectedImage.value = img;
};
const closeLightbox = () => { selectedImage.value = null; };

const prevImage = () => {
  if (activeIndex.value === -1) return;
  const newIndex = (activeIndex.value - 1 + allImages.value.length) % allImages.value.length;
  selectedImage.value = allImages.value[newIndex];
};

const nextImage = () => {
  if (activeIndex.value === -1) return;
  const newIndex = (activeIndex.value + 1) % allImages.value.length;
  selectedImage.value = allImages.value[newIndex];
};

const loadGalleryImages = async () => {
  try {
    const galleryImages = await fetchGalleryAll(30);
    if (galleryImages.length) {
      remoteGalleryImages.value = galleryImages;
    }
  } catch (error) {
    console.warn('Gallery API unavailable:', error.message);
  }
};

/* ─── Touch / drag control ─────────────────────────────────────────────── */
const DRAG_THRESHOLD = 8;
const dragOffsets = ref({ row1: 0, row2: 0 });
const pausedRows = ref({ row1: false, row2: false });
const suppressClick = ref(false);

let activeRow = null;
let pointerId = null;
let startX = 0;
let startOffset = 0;
let moved = false;
let resumeTimer = null;

function onPointerDown(rowKey, e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  activeRow = rowKey;
  pointerId = e.pointerId;
  startX = e.clientX;
  startOffset = dragOffsets.value[rowKey] || 0;
  moved = false;
  pausedRows.value = { ...pausedRows.value, [rowKey]: true };
  if (resumeTimer) {
    clearTimeout(resumeTimer);
    resumeTimer = null;
  }
  e.currentTarget.setPointerCapture?.(e.pointerId);
}

function onPointerMove(e) {
  if (activeRow == null || e.pointerId !== pointerId) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > DRAG_THRESHOLD) moved = true;
  dragOffsets.value = {
    ...dragOffsets.value,
    [activeRow]: startOffset + dx,
  };
}

function endDrag(e) {
  if (activeRow == null || (e && e.pointerId !== pointerId)) return;
  const rowKey = activeRow;
  activeRow = null;
  pointerId = null;

  if (moved) {
    suppressClick.value = true;
    setTimeout(() => {
      suppressClick.value = false;
    }, 60);
  }

  // Reanuda el auto-scroll tras soltar (mantiene el offset de arrastre)
  resumeTimer = setTimeout(() => {
    pausedRows.value = { ...pausedRows.value, [rowKey]: false };
    resumeTimer = null;
  }, 220);
}

function onPointerUp(e) {
  endDrag(e);
}

function onPointerCancel(e) {
  endDrag(e);
}

onMounted(() => {
  loadGalleryImages();
});

onBeforeUnmount(() => {
  if (resumeTimer) clearTimeout(resumeTimer);
});
</script>


<template>
  <section class="gallery">
    <div class="gallery__header container">
      <h2 class="section-title font-inter entry-anim entry-anim--up" style="--stagger: 0s">NUESTRA VIBRA</h2>
      <h3 class="gallery__headline font-podium entry-anim entry-anim--up" style="--stagger: 0.12s">EXPEDICIÓN EN CHACAS</h3>
    </div>

    <!-- Row 1: Left to Right -->
    <div
      class="gallery__row entry-anim entry-anim--scale"
      :style="{ '--stagger': '0.24s', '--drag-x': `${dragOffsets.row1}px` }"
      @pointerdown="onPointerDown('row1', $event)"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <div
        class="gallery__drag"
      >
        <div
          class="gallery__track move-right"
          :class="{ 'is-paused': pausedRows.row1 }"
        >
          <div class="gallery__set">
            <div
              v-for="(img, index) in imagesRow1"
              :key="'r1-s1-'+index"
              class="gallery__item"
              @click="openLightbox(img)"
            >
              <img :src="img" :alt="'Ciclismo de montaña extrema en Chacas Ancash - Galería ' + (index + 1) + ' - Chacas Xtreme Race'" loading="lazy" decoding="async" />
              <div class="gallery__overlay">
                <span class="gallery__label font-inter">AMPLIAR</span>
              </div>
            </div>
          </div>
          <div class="gallery__set">
            <div
              v-for="(img, index) in imagesRow1"
              :key="'r1-s2-'+index"
              class="gallery__item"
              @click="openLightbox(img)"
            >
              <img :src="img" :alt="'Ciclismo de montaña extrema en Chacas Ancash - Galería ' + (index + 1) + ' - Chacas Xtreme Race'" loading="lazy" decoding="async" />
              <div class="gallery__overlay">
                <span class="gallery__label font-inter">AMPLIAR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: Right to Left -->
    <div
      class="gallery__row mt-4 entry-anim entry-anim--scale"
      :style="{ '--stagger': '0.36s', '--drag-x': `${dragOffsets.row2}px` }"
      @pointerdown="onPointerDown('row2', $event)"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <div class="gallery__drag">
        <div
          class="gallery__track move-left"
          :class="{ 'is-paused': pausedRows.row2 }"
        >
          <div class="gallery__set">
            <div
              v-for="(img, index) in imagesRow2"
              :key="'r2-s1-'+index"
              class="gallery__item"
              @click="openLightbox(img)"
            >
              <img :src="img" :alt="'Competencia de MTB en los Andes de Perú - Galería ' + (index + 1) + ' - Chacas Xtreme Race'" loading="lazy" decoding="async" />
              <div class="gallery__overlay">
                <span class="gallery__label font-inter">AMPLIAR</span>
              </div>
            </div>
          </div>
          <div class="gallery__set">
            <div
              v-for="(img, index) in imagesRow2"
              :key="'r2-s2-'+index"
              class="gallery__item"
              @click="openLightbox(img)"
            >
              <img :src="img" :alt="'Competencia de MTB en los Andes de Perú - Galería ' + (index + 1) + ' - Chacas Xtreme Race'" loading="lazy" decoding="async" />
              <div class="gallery__overlay">
                <span class="gallery__label font-inter">AMPLIAR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div v-if="selectedImage" class="lightbox" @click="closeLightbox">
          <button class="lightbox__close" @click="closeLightbox" aria-label="Cerrar galería">
            <X :size="24" />
          </button>

          <button class="lightbox__nav prev" @click.stop="prevImage" aria-label="Imagen anterior">
            <ChevronLeft :size="28" />
          </button>

          <div class="lightbox__content" @click.stop>
            <div class="lightbox__frame">
              <img :src="selectedImage" alt="Zoomed image" class="lightbox__img" />
              <div class="corner-mark top-left"></div>
              <div class="corner-mark top-right"></div>
              <div class="corner-mark bottom-left"></div>
              <div class="corner-mark bottom-right"></div>
            </div>
            <div class="lightbox__meta font-inter">
              <span class="meta-location">CHACAS // PUEBLO CON ENCANTOS</span>
              <span class="meta-counter">CAPTURA {{ activeIndex + 1 }} DE {{ allImages.length }}</span>
            </div>
          </div>

          <button class="lightbox__nav next" @click.stop="nextImage" aria-label="Siguiente imagen">
            <ChevronRight :size="28" />
          </button>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.gallery {
  padding: var(--section-py) 0;
  background: var(--bg-color);
  overflow: hidden;
  position: relative;
}

.gallery__header {
  margin-bottom: 3rem;
  text-align: center;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.gallery__headline {
  font-size: clamp(1.65rem, 5vw, 3.2rem);
  font-weight: 900;
  color: white;
  letter-spacing: -2px;
  line-height: 1.05;
}

.gallery__row {
  display: flex;
  width: 100%;
  overflow: hidden;
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.gallery__row:active {
  cursor: grabbing;
}

.gallery__drag {
  transform: translate3d(var(--drag-x, 0px), 0, 0);
  will-change: transform;
}

.mt-4 { margin-top: 2rem; }

.gallery__track {
  display: flex;
  width: max-content;
  will-change: transform;
}

.gallery__set {
  display: flex;
  gap: clamp(1rem, 3vw, 2rem);
  padding-right: clamp(1rem, 3vw, 2rem);
}

.move-right {
  animation: scroll-right 45s linear infinite;
}

.move-left {
  animation: scroll-left 45s linear infinite;
}

.gallery__track.is-paused {
  animation-play-state: paused;
}

@media (hover: hover) and (pointer: fine) {
  .gallery__track:hover {
    animation-play-state: paused;
  }
}

.gallery__item {
  position: relative;
  flex: 0 0 clamp(220px, 42vw, 450px);
  height: clamp(150px, 28vw, 300px);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #0d0d0d;
  -webkit-user-drag: none;
}

.gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.2) brightness(0.95);
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
  -webkit-user-drag: none;
}

.gallery__overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 94, 0, 0.15) 0%, rgba(0, 0, 0, 0.75) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.gallery__label {
  color: white;
  font-weight: 800;
  letter-spacing: 4px;
  font-size: 0.9rem;
  transform: translateY(15px);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (hover: hover) and (pointer: fine) {
  .gallery__item:hover img {
    transform: scale(1.06);
    filter: grayscale(0) brightness(1.05);
  }

  .gallery__item:hover .gallery__overlay {
    opacity: 1;
  }

  .gallery__item:hover .gallery__label {
    transform: translateY(0);
  }
}

@keyframes scroll-right {
  0% { transform: translate3d(-50%, 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
}

@keyframes scroll-left {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(5, 5, 5, 0.92);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox__close {
  position: absolute;
  top: 2.5rem;
  right: 2.5rem;
  color: white;
  z-index: 100;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-smooth);
}

.lightbox__close:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: black;
  transform: rotate(90deg);
}

.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-smooth);
  z-index: 90;
}

.lightbox__nav:hover {
  background: white;
  color: black;
  border-color: white;
}

.lightbox__nav.prev {
  left: 3rem;
}

.lightbox__nav.next {
  right: 3rem;
}

.lightbox__content {
  position: relative;
  max-width: 75vw;
  max-height: 80vh;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.lightbox__frame {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 8px;
  background: rgba(10, 10, 10, 0.4);
  border-radius: 4px;
}

.lightbox__img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
  border-radius: 2px;
}

.corner-mark {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid var(--primary-color);
  z-index: 20;
  pointer-events: none;
}
.corner-mark.top-left { top: 15px; left: 15px; border-right: none; border-bottom: none; }
.corner-mark.top-right { top: 15px; right: 15px; border-left: none; border-bottom: none; }
.corner-mark.bottom-left { bottom: 15px; left: 15px; border-right: none; border-top: none; }
.corner-mark.bottom-right { bottom: 15px; right: 15px; border-left: none; border-top: none; }

.lightbox__meta {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 2px;
  padding: 0 8px;
}

.meta-location {
  color: var(--primary-color);
}

.lightbox-fade-enter-active, .lightbox-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.lightbox-fade-enter-active .lightbox__content,
.lightbox-fade-leave-active .lightbox__content {
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.lightbox-fade-enter-from, .lightbox-fade-leave-to {
  opacity: 0;
}

.lightbox-fade-enter-from .lightbox__content,
.lightbox-fade-leave-to .lightbox__content {
  transform: scale(0.95);
}

@media (max-width: 992px) {
  .gallery__header {
    margin-bottom: 2rem;
    padding: 0 var(--container-px);
  }

  .move-right,
  .move-left {
    animation-duration: 28s;
  }
}

@media (max-width: 768px) {
  .section-title {
    letter-spacing: 2.5px;
    font-size: 0.72rem;
  }

  .move-right,
  .move-left {
    animation-duration: 22s;
  }

  .gallery__item {
    flex: 0 0 clamp(160px, 58vw, 280px);
    height: clamp(120px, 38vw, 200px);
  }

  .gallery__set {
    gap: 0.75rem;
    padding-right: 0.75rem;
  }

  .mt-4 {
    margin-top: 0.75rem;
  }

  .gallery__label {
    font-size: 0.75rem;
    letter-spacing: 2.5px;
  }

  .lightbox__nav.prev { left: 0.75rem; }
  .lightbox__nav.next { right: 0.75rem; }
  .lightbox__close { top: 1rem; right: 1rem; }
  .lightbox__content { max-width: 92vw; }
  .lightbox__meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    text-align: center;
    font-size: 0.62rem;
  }
}

@media (max-width: 480px) {
  .move-right,
  .move-left {
    animation-duration: 18s;
  }

  .gallery__item {
    flex: 0 0 70vw;
    height: 46vw;
    max-height: 180px;
  }

  .lightbox__nav {
    width: 40px;
    height: 40px;
  }

  .lightbox__close {
    width: 40px;
    height: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gallery__track {
    animation: none !important;
  }
}
</style>
