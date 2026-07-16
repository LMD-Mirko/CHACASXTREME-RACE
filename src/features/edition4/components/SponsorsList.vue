<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchSponsors } from '@/composables/useBackendApi';
import {
  detectLogoBackgroundFromImage,
  detectShapeFromImage,
  resolveSponsorFrame,
  resolveSponsorSize,
} from '@/features/sponsors/sponsorLogoFrame.js';
import principalLogo from '@/assets/images/logoSponsorprincipal.png';

const MAIN_SPONSOR = {
  name: 'INIZIA inmobiliaria',
  tagline: 'Auspiciador oficial · 4ª Edición',
  logo: principalLogo,
};

const sponsorsList = ref([]);
const isLoading = ref(true);
/** id → detected shape when frame_shape=auto */
const logoShapes = ref({});
/** id → sampled edge background color */
const logoBackgrounds = ref({});

const carouselSponsors = computed(() => sponsorsList.value.filter((s) => s?.logo_url));

function shapeForSponsor(sponsor) {
  const key = sponsor.id ?? sponsor.logo_url;
  return resolveSponsorFrame(sponsor, logoShapes.value[key] || 'square');
}

function sizeForSponsor(sponsor) {
  return resolveSponsorSize(sponsor);
}

function bgForSponsor(sponsor) {
  const key = sponsor.id ?? sponsor.logo_url;
  return sponsor.logo_background_color || sponsor.logoBackgroundColor || logoBackgrounds.value[key] || '#ffffff';
}

function onLogoLoad(sponsor, e) {
  const key = sponsor.id ?? sponsor.logo_url;
  const img = e?.target;
  logoShapes.value = {
    ...logoShapes.value,
    [key]: detectShapeFromImage(img),
  };
  logoBackgrounds.value = {
    ...logoBackgrounds.value,
    [key]: detectLogoBackgroundFromImage(img),
  };
}

const loadSponsorsData = async () => {
  try {
    const data = await fetchSponsors();
    sponsorsList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('[edition4] sponsors API:', error.message);
    sponsorsList.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadSponsorsData);
</script>

<template>
  <div class="sponsors-tab-wrapper">
    <div class="sponsors-header">
      <div class="section-header-mini font-accent">
        <span>OFFICIAL_SPONSORS // IV EDICIÓN</span>
        <span class="tech-tag">PARTNERS</span>
      </div>
      <h2 class="sponsors-title font-podium">
        NUESTROS <span class="highlight-text">AUSPICIADORES</span>
      </h2>
      <p class="sponsors-subtitle font-inter">
        La alianza que hace posible la carrera más extrema de la Cordillera.
      </p>
    </div>

    <section class="main-sponsor" aria-label="Auspiciador oficial INIZIA inmobiliaria">
      <p class="main-sponsor__kicker font-accent">Auspiciador oficial</p>
      <img
        :src="MAIN_SPONSOR.logo"
        :alt="MAIN_SPONSOR.name"
        class="main-sponsor__logo"
        width="553"
        height="451"
        decoding="async"
      />
      <p class="main-sponsor__tagline font-symbols">{{ MAIN_SPONSOR.tagline }}</p>
    </section>

    <section class="logo-carousel-section" aria-label="Carrusel de auspiciadores">
      <div class="carousel-label font-accent">También nos acompañan</div>

      <div v-if="isLoading" class="sponsors-loading font-accent">
        <div class="spinner"></div>
        <span>CARGANDO ALIANZAS…</span>
      </div>

      <div v-else-if="!carouselSponsors.length" class="sponsors-empty font-inter">
        Los logos de auspiciadores aparecerán aquí.
      </div>

      <div v-else class="carousel-track">
        <div class="logo-list">
          <div v-for="n in 2" :key="'loop-' + n" class="logo-group">
            <div
              v-for="(sponsor, index) in carouselSponsors"
              :key="`${n}-${sponsor.id || sponsor.company_name}-${index}`"
              class="logo-tile"
              :class="[
                `logo-tile--${shapeForSponsor(sponsor)}`,
                `logo-tile--size-${sizeForSponsor(sponsor)}`,
              ]"
              :style="`--f-delay: ${index * 0.12}s; --logo-bg: ${bgForSponsor(sponsor)}`"
              :title="sponsor.company_name"
            >
              <img
                :src="sponsor.logo_url"
                :alt="sponsor.company_name"
                class="logo-tile__img"
                loading="lazy"
                @load="onLogoLoad(sponsor, $event)"
              />
            </div>
          </div>
        </div>
        <div class="carousel-glow-left"></div>
        <div class="carousel-glow-right"></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sponsors-tab-wrapper {
  margin-top: 5rem;
  padding-top: 3.5rem;
  border-top: 1px solid rgba(255, 94, 0, 0.18);
  margin-bottom: 4rem;
}

.sponsors-header {
  margin-bottom: 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.section-header-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.8rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.tech-tag {
  color: var(--secondary-color);
}

.sponsors-title {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 950;
  line-height: 1;
  margin: 0.6rem 0 0.85rem;
  letter-spacing: -1.5px;
  text-transform: uppercase;
}

.highlight-text {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.sponsors-subtitle {
  font-size: 0.98rem;
  color: rgba(255, 255, 255, 0.48);
  max-width: 560px;
  line-height: 1.55;
  margin: 0;
}

.main-sponsor {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0 auto 3rem;
  max-width: 520px;
  width: 100%;
}

.main-sponsor__kicker {
  margin: 0 0 1.25rem;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.main-sponsor__logo {
  display: block;
  width: min(100%, 380px);
  height: auto;
  animation: logoGlow 3.2s ease-in-out infinite;
  will-change: filter, transform;
}

@keyframes logoGlow {
  0%, 100% {
    filter: drop-shadow(0 0 18px rgba(255, 94, 0, 0.18));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 42px rgba(255, 94, 0, 0.48));
    transform: scale(1.015);
  }
}

.main-sponsor__tagline {
  margin: 1.1rem 0 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Carrusel adaptativo */
.logo-carousel-section {
  position: relative;
  padding: 1.5rem 0 0.5rem;
  overflow: hidden;
}

.carousel-label {
  text-align: center;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 1.5rem;
}

.carousel-track {
  position: relative;
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.logo-list {
  display: flex;
  width: max-content;
  animation: scrollLogos 42s linear infinite;
  will-change: transform;
}

.logo-list:hover {
  animation-play-state: paused;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 0.85rem 1.5rem;
}

.logo-tile {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  /* Color tomado de los bordes del propio logo; blanco si no se puede leer. */
  background: var(--logo-bg, #ffffff);
  border: 1px solid rgba(255, 255, 255, 0.14);
  overflow: hidden;
  box-sizing: border-box;
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  animation: floatTile 6s ease-in-out infinite;
  animation-delay: var(--f-delay, 0s);
}

/* Circular solo si admin lo fuerza */
.logo-tile--circle {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  padding: 10px;
}

/* Horizontal: más ancho para logos tipo TREK / LA CLETA */
.logo-tile--wide {
  width: 200px;
  height: 88px;
  border-radius: 14px;
  padding: 10px 14px;
}

.logo-tile--tall {
  width: 96px;
  height: 128px;
  border-radius: 14px;
  padding: 12px;
}

.logo-tile--square {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  padding: 12px;
}

.logo-tile--circle.logo-tile--size-sm { width: 84px; height: 84px; padding: 8px; }
.logo-tile--wide.logo-tile--size-sm { width: 156px; height: 72px; padding: 8px 12px; }
.logo-tile--tall.logo-tile--size-sm { width: 76px; height: 104px; padding: 10px; }
.logo-tile--square.logo-tile--size-sm { width: 96px; height: 96px; padding: 10px; }

.logo-tile--circle.logo-tile--size-lg { width: 128px; height: 128px; padding: 12px; }
.logo-tile--wide.logo-tile--size-lg { width: 240px; height: 104px; padding: 12px 16px; }
.logo-tile--tall.logo-tile--size-lg { width: 112px; height: 148px; padding: 14px; }
.logo-tile--square.logo-tile--size-lg { width: 140px; height: 140px; padding: 14px; }

/* contain = logo completo, sin recortes */
.logo-tile__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  filter: brightness(0.98) contrast(1.02);
  transition: filter 0.3s ease, transform 0.3s ease;
}

.logo-tile:hover {
  border-color: rgba(255, 94, 0, 0.75);
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(255, 94, 0, 0.18);
  z-index: 5;
  animation-play-state: paused;
}

.logo-tile:hover .logo-tile__img {
  filter: brightness(1.05) contrast(1.04);
  transform: scale(1.04);
}

.carousel-glow-left,
.carousel-glow-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  pointer-events: none;
  z-index: 4;
}

.carousel-glow-left {
  left: 0;
  background: linear-gradient(90deg, #020202, transparent);
}

.carousel-glow-right {
  right: 0;
  background: linear-gradient(270deg, #020202, transparent);
}

@keyframes scrollLogos {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}

@keyframes floatTile {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.sponsors-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding: 2.5rem 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  letter-spacing: 2px;
}

.sponsors-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.9rem;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 94, 0, 0.12);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .main-sponsor__logo {
    width: min(100%, 280px);
  }

  .logo-tile--circle {
    width: 88px;
    height: 88px;
    padding: 8px;
  }

  .logo-tile--wide {
    width: 168px;
    height: 76px;
    padding: 8px 12px;
  }

  .logo-tile--tall {
    width: 80px;
    height: 108px;
    padding: 10px;
  }

  .logo-tile--square {
    width: 100px;
    height: 100px;
    padding: 10px;
  }

  .logo-group {
    gap: 1.15rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .logo-list,
  .logo-tile,
  .main-sponsor__logo {
    animation: none !important;
  }
}
</style>
