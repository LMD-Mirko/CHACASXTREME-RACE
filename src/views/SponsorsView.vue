<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from 'vue';
import { RouterLink } from 'vue-router';
import {
  Handshake,
  Target,
  Users,
  Globe,
  TrendingUp,
  ArrowLeft,
  Instagram,
  Facebook,
  Link2
} from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { fetchSponsors } from '@/composables/useBackendApi';
import {
  detectLogoBackgroundFromImage,
  detectShapeFromImage,
  resolveSponsorFrame,
  resolveSponsorSize,
} from '@/features/sponsors/sponsorLogoFrame.js';
import imagenaus from '@/assets/images/imagenaus.jpg';

const SCROLL_PX_PER_SEC = 36;

const { t } = useI18n();
const sponsors = ref([]);
const selectedSponsor = ref(null);
const showModal = ref(false);
const loadingSponsors = ref(true);
const logoListRef = ref(null);
/** id → detected shape when frame_shape=auto */
const logoShapes = ref({});
/** id → sampled edge background color */
const logoBackgrounds = ref({});

const carouselSponsors = computed(() => sponsors.value.filter((s) => s?.logo_url));
const loopCopies = computed(() => {
  const n = carouselSponsors.value.length;
  if (n <= 2) return 4;
  if (n <= 4) return 3;
  return 2;
});

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
  syncScrollSpeed();
}

function syncScrollSpeed() {
  const list = logoListRef.value;
  if (!list) return;
  const distance = list.scrollWidth / loopCopies.value;
  if (!distance) return;
  const seconds = Math.max(16, Math.min(70, distance / SCROLL_PX_PER_SEC));
  list.style.setProperty('--scroll-duration', `${seconds.toFixed(1)}s`);
}

let resizeObserver = null;

const loadSponsors = async () => {
  try {
    const data = await fetchSponsors();
    sponsors.value = data.length ? data : [];
  } catch (error) {
    console.warn('Sponsors API unavailable:', error.message);
    sponsors.value = [];
  } finally {
    loadingSponsors.value = false;
  }
};

const openSponsorModal = (sponsor) => {
  selectedSponsor.value = sponsor;
  showModal.value = true;
};

const closeSponsorModal = () => {
  selectedSponsor.value = null;
  showModal.value = false;
};

watch([carouselSponsors, loopCopies], async () => {
  await nextTick();
  syncScrollSpeed();
  attachResizeObserver();
});

function attachResizeObserver() {
  if (typeof ResizeObserver === 'undefined' || !logoListRef.value) return;
  if (resizeObserver) return;
  resizeObserver = new ResizeObserver(() => syncScrollSpeed());
  resizeObserver.observe(logoListRef.value);
}

onMounted(async () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  await loadSponsors();
  await nextTick();
  syncScrollSpeed();
  attachResizeObserver();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div class="sponsors-page">
    <!-- BACKGROUND DECORATIONS -->
    <div class="light-leak leak-1"></div>
    <div class="light-leak leak-2"></div>

    <!-- 1. HERO SECTION -->
    <section class="sponsor-hero">
      <div class="hero-bg">
        <div class="overlay"></div>
        <img src="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=1200" alt="Montañas de la Cordillera Blanca en Chacas, Áncash - Auspiciadores Chacas Xtreme Race" class="parallax-img" />
      </div>

      <div class="container hero-content-wrapper relative z-10">
        <!-- Navigation Link Back -->
        <RouterLink to="/como-participar" class="btn-back reveal">
          <ArrowLeft :size="18" /> {{ t('sponsors.back') }}
        </RouterLink>
        <div class="badge-gold reveal shimmer-gold">{{ t('sponsors.badge') }}</div>
        <h1 class="sponsor-title reveal">{{ t('sponsors.title') }}</h1>
        <p class="sponsor-subtitle reveal">
          {{ t('sponsors.subtitle') }}
        </p>

      </div>
    </section>

    <!-- 2. CARRUSEL ADAPTATIVO DE LOGOS -->
    <section class="logo-carousel-section">
      <div class="carousel-track">
        <div v-if="loadingSponsors" class="sponsor-placeholder">Cargando auspiciadores...</div>
        <div
          v-else-if="carouselSponsors.length"
          ref="logoListRef"
          class="logo-list"
          :style="{ '--loop-copies': loopCopies }"
        >
          <div v-for="n in loopCopies" :key="'loop-' + n" class="logo-group">
            <button
              v-for="(sponsor, index) in carouselSponsors"
              :key="`${n}-${sponsor.id || sponsor.company_name}-${index}`"
              type="button"
              class="logo-tile float-anim"
              :class="[
                `logo-tile--${shapeForSponsor(sponsor)}`,
                `logo-tile--size-${sizeForSponsor(sponsor)}`,
              ]"
              :style="`--f-delay: ${index * 0.16}s; --logo-bg: ${bgForSponsor(sponsor)}`"
              :title="sponsor.company_name"
              :aria-label="`Ver detalle de ${sponsor.company_name}`"
              @click="openSponsorModal(sponsor)"
            >
              <img
                :src="sponsor.logo_url"
                :alt="sponsor.company_name + ' - Auspiciador Oficial de Chacas Xtreme Race'"
                class="logo-tile__img"
                loading="lazy"
                @load="onLogoLoad(sponsor, $event)"
              />
            </button>
          </div>
        </div>
        <div v-else class="sponsor-placeholder">
          No hay auspiciadores disponibles en este momento.
        </div>
      </div>
      <div class="carousel-glow-left"></div>
      <div class="carousel-glow-right"></div>
    </section>

    <!-- 2.5 SPONSOR DETAILS MODAL -->
    <div v-if="showModal" class="sponsor-modal-backdrop" @click.self="closeSponsorModal">
      <div class="sponsor-modal reveal reveal--visible">
        <button type="button" class="modal-close" aria-label="Cerrar" @click="closeSponsorModal">×</button>
        <div class="modal-hero">
          <div class="modal-logo-wrap">
            <img :src="selectedSponsor.logo_url" :alt="selectedSponsor.company_name" class="modal-logo" />
          </div>
          <div class="modal-copy">
            <h2>{{ selectedSponsor.company_name }}</h2>
            <p v-if="selectedSponsor.description">{{ selectedSponsor.description }}</p>
            <p v-else>Conoce más sobre este auspiciador y su apoyo a Chacas Xtreme Race.</p>
          </div>
        </div>

        <div class="modal-socials">
          <a v-if="selectedSponsor.website_url" :href="selectedSponsor.website_url" target="_blank" rel="noreferrer noopener" class="social-pill">
            <Link2 size="16" /> Sitio web
          </a>
          <a v-if="selectedSponsor.instagram_url" :href="selectedSponsor.instagram_url" target="_blank" rel="noreferrer noopener" class="social-pill">
            <Instagram size="16" /> Instagram
          </a>
          <a v-if="selectedSponsor.facebook_url" :href="selectedSponsor.facebook_url" target="_blank" rel="noreferrer noopener" class="social-pill">
            <Facebook size="16" /> Facebook
          </a>
          <a v-if="selectedSponsor.tiktok_url" :href="selectedSponsor.tiktok_url" target="_blank" rel="noreferrer noopener" class="social-pill">
            <span class="tiktok-icon">TikTok</span>
          </a>
        </div>
      </div>
    </div>

    <!-- 3. MISSION SECTION (EDITORIAL STYLE) -->
    <section class="mission-section container">
      <div class="mission-grid">
        <div class="mission-text reveal">
          <div class="text-block">
            <div class="line-accent"></div>
            <h2 class="editorial-title font-podium">{{ t('sponsors.editorial_title') }} <span class="gradient-text">{{ t('sponsors.editorial_title_highlight') }}</span></h2>
            <p class="font-inter">
              {{ t('sponsors.editorial_p1') }}
            </p>
          </div>
          
          <div class="text-block secondary">
            <p class="font-inter">
              {{ t('sponsors.editorial_p2') }}
            </p>
          </div>

          <div class="final-quote">
            <h3 class="font-podium">{{ t('sponsors.final_quote') }}</h3>
          </div>
        </div>

        <div class="mission-visual reveal">
           <div class="visual-card-premium">
              <img :src="imagenaus" alt="Apoyo social infantil y comunidad de ciclistas en Chacas - Manka Riders" class="visual-card-bg" />
              <div class="visual-card-overlay"></div>


              <div class="card-decor-bracket top-left"></div>
              <div class="card-decor-bracket top-right"></div>
              <div class="card-decor-bracket bottom-left"></div>
              <div class="card-decor-bracket bottom-right"></div>
           </div>
        </div>
      </div>
    </section>

    <!-- 4. VALUES GRID -->
    <section class="values-grid container">
      <div class="value-card reveal">
        <div class="card-decor-corner top-left"></div>
        <div class="card-decor-corner bottom-right"></div>
        <Target :size="40" class="primary-text value-icon" />
        <h3 class="font-podium">{{ t('sponsors.values[0].title') }}</h3>
        <p class="font-inter">{{ t('sponsors.values[0].desc') }}</p>
      </div>
      <div class="value-card reveal">
        <div class="card-decor-corner top-left"></div>
        <div class="card-decor-corner bottom-right"></div>
        <TrendingUp :size="40" class="primary-text" />
        <h3 class="font-podium">{{ t('sponsors.values[1].title') }}</h3>
        <p class="font-inter">{{ t('sponsors.values[1].desc') }}</p>
      </div>
      <div class="value-card reveal">
        <div class="card-decor-corner top-left"></div>
        <div class="card-decor-corner bottom-right"></div>
        <Users :size="40" class="primary-text" />
        <h3 class="font-podium">{{ t('sponsors.values[2].title') }}</h3>
        <p class="font-inter">{{ t('sponsors.values[2].desc') }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sponsors-page {
  background: #020202;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 10rem;
  overflow-x: hidden;
}

/* REVEAL SYSTEM */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

/* 1. HERO SECTION */
.sponsor-hero {
  position: relative;
  height: 70vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
}

.parallax-img {
  width: 100%;
  height: 120%;
  object-fit: cover;
  opacity: 0.4;
  animation: parallaxHero linear both;
  animation-timeline: scroll();
  will-change: transform;
}

@keyframes parallaxHero {
  from { transform: translateY(0); }
  to { transform: translateY(15%); }
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #020202, transparent 50%, rgba(0,0,0,0.6));
  z-index: 1;
}

.badge-gold {
  position: relative;
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background: rgba(255, 184, 0, 0.1);
  border: 1px solid #ffb800;
  color: #ffb800;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.75rem;
  letter-spacing: 3px;
  border-radius: 4px;
  overflow: hidden;
}

.shimmer-gold::after {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(45deg, transparent, rgba(255, 184, 0, 0.2), transparent);
  transform: rotate(45deg);
  animation: shimmer 4s infinite;
}

@keyframes shimmer {
  0% { transform: translate(-100%, -100%) rotate(45deg); }
  20% { transform: translate(100%, 100%) rotate(45deg); }
  100% { transform: translate(100%, 100%) rotate(45deg); }
}

.sponsor-title {
  font-family: var(--font-accent);
  font-size: clamp(3.5rem, 10vw, 8rem);
  font-weight: 950;
  letter-spacing: -4px;
  line-height: 1;
  margin: 2rem 0;
  background: linear-gradient(to right, #fff, rgba(255,255,255,0.4));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sponsor-subtitle {
  font-size: 1.5rem;
  max-width: 800px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  margin-bottom: 3rem;
}

.btn-gold-glow {
  background: #ffb800;
  color: #000;
  padding: 1.5rem 2.8rem;
  border-radius: 100px;
  text-decoration: none;
  font-family: var(--font-accent);
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 0 30px rgba(255, 184, 0, 0.3);
  transition: all 0.3s ease;
}

.btn-gold-glow:hover {
  transform: scale(1.05);
  box-shadow: 0 0 50px rgba(255, 184, 0, 0.5);
}

/* 2. LOGO CAROUSEL SECTION */
.logo-carousel-section {
  position: relative;
  padding: 6rem 0;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.carousel-track {
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.logo-list {
  display: flex;
  width: max-content;
  animation: scrollLogos var(--scroll-duration, 28s) linear infinite;
  will-change: transform;
}

@media (hover: hover) and (pointer: fine) {
  .logo-list:hover {
    animation-play-state: paused;
  }
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 0.85rem 2rem;
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
  cursor: pointer;
  box-sizing: border-box;
  font: inherit;
  color: inherit;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 0.45s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.45s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.45s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
  backface-visibility: hidden;
}

.logo-tile--circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  padding: 12px;
}

.logo-tile--wide {
  width: 220px;
  height: 96px;
  border-radius: 16px;
  padding: 12px 16px;
}

.logo-tile--tall {
  width: 104px;
  height: 140px;
  border-radius: 16px;
  padding: 14px;
}

.logo-tile--square {
  width: 128px;
  height: 128px;
  border-radius: 18px;
  padding: 14px;
}

.logo-tile--circle.logo-tile--size-sm { width: 92px; height: 92px; padding: 10px; }
.logo-tile--wide.logo-tile--size-sm { width: 168px; height: 76px; padding: 10px 12px; }
.logo-tile--tall.logo-tile--size-sm { width: 80px; height: 112px; padding: 10px; }
.logo-tile--square.logo-tile--size-sm { width: 100px; height: 100px; padding: 12px; }

.logo-tile--circle.logo-tile--size-lg { width: 148px; height: 148px; padding: 14px; }
.logo-tile--wide.logo-tile--size-lg { width: 260px; height: 112px; padding: 14px 18px; }
.logo-tile--tall.logo-tile--size-lg { width: 120px; height: 164px; padding: 16px; }
.logo-tile--square.logo-tile--size-lg { width: 156px; height: 156px; padding: 16px; }

.logo-tile__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  filter: grayscale(0.1) contrast(1.05) brightness(0.98);
  transition: all 0.45s cubic-bezier(0.25, 1, 0.5, 1);
}

@media (hover: hover) and (pointer: fine) {
  .float-anim {
    animation: floatTile 6s ease-in-out infinite;
    animation-delay: var(--f-delay);
  }

  .logo-tile:hover {
    border-color: var(--primary-color);
    transform: translateY(-12px) scale(1.05);
    z-index: 10;
    box-shadow: 0 15px 30px rgba(255, 94, 0, 0.2);
    animation-play-state: paused;
  }

  .logo-tile:hover .logo-tile__img {
    filter: grayscale(0) contrast(1.05) brightness(1.08);
    transform: scale(1.04);
  }
}

@keyframes floatTile {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.sponsor-placeholder {
  width: 100%;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  text-align: center;
  padding: 5rem 0;
}

.sponsor-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 999;
}

.sponsor-modal {
  width: min(720px, 100%);
  max-height: min(90vh, 900px);
  overflow-y: auto;
  background: rgba(10, 10, 10, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.45);
  padding: 2.5rem;
  position: relative;
}

.modal-close {
  position: absolute;
  right: 1.2rem;
  top: 1.2rem;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.16);
}

.modal-hero {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1.8rem;
  align-items: center;
}

.modal-logo-wrap {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.modal-copy h2 {
  font-size: clamp(2rem, 4vw, 2.4rem);
  margin-bottom: 1rem;
}

.modal-copy p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
}

.modal-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}

.social-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1.2rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.social-pill:hover {
  transform: translateY(-1px);
  background: rgba(255, 184, 0, 0.16);
  border-color: rgba(255, 184, 0, 0.3);
}

.tiktok-icon {
  font-size: 0.92rem;
  font-weight: 700;
}

@media (max-width: 768px) {
  .modal-hero {
    grid-template-columns: 1fr;
  }

  .modal-logo-wrap {
    width: 100%;
    height: 200px;
  }
}

@keyframes scrollLogos {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(calc(-100% / var(--loop-copies, 2)), 0, 0); }
}

.carousel-glow-left {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  background: linear-gradient(to right, #020202, transparent);
  z-index: 5;
}

.carousel-glow-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  background: linear-gradient(to left, #020202, transparent);
  z-index: 5;
}

/* 3. MISSION SECTION */
.mission-section {
  padding: 12rem 2rem;
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rem;
  align-items: center;
}

.text-block h2 {
  font-size: clamp(2rem, 5vw, 3.8rem);
  font-weight: 950;
  margin-bottom: 2rem;
  line-height: 0.95;
  letter-spacing: -2px;
}

.text-block p {
  font-size: 1.15rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.75);
}

.text-block.secondary {
  margin-top: 3rem;
  padding-left: 2rem;
  border-left: 2px solid var(--primary-color);
}

.final-quote h3 {
  font-size: 1.6rem;
  font-weight: 900;
  margin-top: 4.5rem;
  color: var(--primary-color);
  letter-spacing: -1px;
}

.gradient-text {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.mission-visual {
  position: relative;
  padding: 0 2rem;
}

.visual-card-premium {
  position: relative;
  aspect-ratio: 4/5;
  border-radius: 24px;
  overflow: visible; /* Allow floating stats to overflow slightly */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7);
  background: #050505;
}

.visual-card-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
  opacity: 0.75;
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease;
}

.visual-card-premium:hover .visual-card-bg {
  transform: scale(1.06);
  opacity: 0.9;
}

.visual-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(2, 2, 2, 0.85) 0%, rgba(2, 2, 2, 0.1) 50%, rgba(2, 2, 2, 0.4) 100%);
  z-index: 1;
  border-radius: 24px;
  pointer-events: none;
}

.floating-stat {
  position: absolute;
  z-index: 2;
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.4rem 2.2rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.floating-stat:hover {
  border-color: var(--primary-color);
  background: rgba(255, 94, 0, 0.1);
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 25px 50px rgba(255, 94, 0, 0.15);
}

.stat-top {
  top: 15%;
  left: -12%;
}

.stat-bottom {
  bottom: 18%;
  right: -12%;
}

.visual-card-premium .stat-number {
  font-size: 3.5rem;
  font-weight: 950;
  color: white;
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.visual-card-premium .stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.7;
  color: var(--text-secondary);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 0.3rem;
}

.card-decor-bracket {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 94, 0, 0.4);
  pointer-events: none;
  z-index: 2;
}

.card-decor-bracket.top-left { top: 20px; left: 20px; border-right: none; border-bottom: none; }
.card-decor-bracket.top-right { top: 20px; right: 20px; border-left: none; border-bottom: none; }
.card-decor-bracket.bottom-left { bottom: 20px; left: 20px; border-right: none; border-top: none; }
.card-decor-bracket.bottom-right { bottom: 20px; right: 20px; border-left: none; border-top: none; }

/* 4. VALUES GRID */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}

.value-card {
  position: relative;
  background: rgba(255, 255, 255, 0.01);
  padding: 5rem 3rem 4rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  transition: all 0.45s cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;
}

.value-card:hover {
  background: rgba(255, 94, 0, 0.03);
  border-color: rgba(255, 94, 0, 0.35);
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 
              0 0 20px rgba(255, 94, 0, 0.05);
}

.value-card h3 {
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  letter-spacing: -1px;
}

.value-card p {
  opacity: 0.55;
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-decor-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  transition: border-color 0.4s ease;
}

.value-card:hover .card-decor-corner {
  border-color: var(--primary-color);
}

.card-decor-corner.top-left { top: 15px; left: 15px; border-right: none; border-bottom: none; }
.card-decor-corner.bottom-right { bottom: 15px; right: 15px; border-left: none; border-top: none; }

/* LIGHT LEAKS */
.light-leak {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(150px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.15;
}

.leak-1 {
  top: -10%;
  right: -10%;
  background: var(--primary-color);
}

.leak-2 {
  bottom: 10%;
  left: -5%;
  background: #ffb800;
}
.hero-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: #fff;
  text-decoration: none;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 2px;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem 1.5rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  z-index: 100;
}

.btn-back:hover {
  background: var(--accent-gradient);
  color: #000;
  border-color: var(--primary-color);
  transform: translateX(-5px);
}

/* RESPONSIVE DESIGN - MOBILE FIRST REFINEMENTS */
@media (max-width: 1200px) {
  .mission-grid { gap: 4rem; }
}

@media (max-width: 1024px) {
  .mission-grid { grid-template-columns: 1fr; gap: 4rem; }
  .values-grid { grid-template-columns: 1fr; }
  .sponsor-hero { height: auto; min-width: 100%; padding: 180px 0 100px; }
  .visual-card-premium { aspect-ratio: 16/10; }

  .logo-group { gap: 1.25rem; padding: 0.75rem 1.25rem; }

  .logo-tile--circle,
  .logo-tile--circle.logo-tile--size-sm,
  .logo-tile--circle.logo-tile--size-lg {
    width: 88px;
    height: 88px;
    padding: 8px;
  }
  .logo-tile--wide,
  .logo-tile--wide.logo-tile--size-sm,
  .logo-tile--wide.logo-tile--size-lg {
    width: 150px;
    height: 70px;
    padding: 8px 12px;
    border-radius: 12px;
  }
  .logo-tile--tall,
  .logo-tile--tall.logo-tile--size-sm,
  .logo-tile--tall.logo-tile--size-lg {
    width: 76px;
    height: 104px;
    padding: 10px;
    border-radius: 12px;
  }
  .logo-tile--square,
  .logo-tile--square.logo-tile--size-sm,
  .logo-tile--square.logo-tile--size-lg {
    width: 96px;
    height: 96px;
    padding: 10px;
    border-radius: 14px;
  }

  .carousel-glow-left,
  .carousel-glow-right {
    width: 100px;
  }
}

@media (max-width: 768px) {
  .hero-content-wrapper {
    align-items: center;
  }
  
  .btn-back { 
    font-size: 0.65rem; 
    padding: 0.6rem 1.2rem; 
    margin-bottom: 1.5rem;
    align-self: flex-start;
  }
  
  .badge-gold { 
    font-size: 0.6rem; 
    letter-spacing: 2px;
    padding: 0.4rem 0.8rem;
  }

  .sponsor-title { 
    font-size: clamp(2.5rem, 12vw, 4rem); 
    margin: 1.5rem 0 1rem;
    letter-spacing: -2px;
    line-height: 1;
  }

  .sponsor-subtitle { 
    font-size: 1rem; 
    line-height: 1.5;
    margin-bottom: 2.5rem;
    max-width: 100%;
  }

  .btn-gold-glow { 
    width: 100%; 
    max-width: 320px;
    padding: 1.2rem; 
    font-size: 0.8rem;
    justify-content: center;
  }

  .logo-carousel-section { padding: 4rem 0; }
  .logo-group { gap: 1.1rem; padding: 0.7rem 1.1rem; }

  .logo-tile--circle,
  .logo-tile--circle.logo-tile--size-sm,
  .logo-tile--circle.logo-tile--size-lg {
    width: 78px;
    height: 78px;
    padding: 7px;
  }
  .logo-tile--wide,
  .logo-tile--wide.logo-tile--size-sm,
  .logo-tile--wide.logo-tile--size-lg {
    width: 132px;
    height: 62px;
    padding: 7px 10px;
    border-radius: 12px;
  }
  .logo-tile--tall,
  .logo-tile--tall.logo-tile--size-sm,
  .logo-tile--tall.logo-tile--size-lg {
    width: 68px;
    height: 92px;
    padding: 8px;
    border-radius: 12px;
  }
  .logo-tile--square,
  .logo-tile--square.logo-tile--size-sm,
  .logo-tile--square.logo-tile--size-lg {
    width: 84px;
    height: 84px;
    padding: 8px;
    border-radius: 12px;
  }

  .carousel-glow-left,
  .carousel-glow-right {
    width: 72px;
  }
  
  .mission-section { 
    padding: 5rem 1.5rem; 
  }
  .text-block h2 { font-size: 2.2rem; line-height: 1.1; }
  .text-block p { font-size: 1rem; }
  .text-block.secondary { margin-top: 2rem; padding-left: 1.5rem; padding-top: 0.5rem; }
  
  .final-quote h3 { 
    font-size: 1.25rem; 
    margin-top: 3.5rem; 
    line-height: 1.4;
  }

  .stat-number { font-size: 3rem; }
  .stat-label { font-size: 0.8rem; }
  .visual-card-premium {
    border-radius: 20px;
    aspect-ratio: 1/1; /* Square on mobile to show the cyclists better */
  }
  .visual-card-bg {
    opacity: 0.95 !important;
    filter: brightness(1.15) contrast(1.05) !important;
  }
  .visual-card-overlay {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.1) 60%, rgba(0, 0, 0, 0.3) 100%) !important;
  }
  .stat-top {
    top: 10%;
    left: -4%;
  }
  .stat-bottom {
    bottom: 12%;
    right: -4%;
  }
}

@media (max-width: 480px) {
  .sponsor-hero { padding: 160px 0 80px; }
  .sponsor-title { font-size: 2.8rem; }

  .logo-group { gap: 0.75rem; padding: 0.55rem 0.75rem; }

  .logo-tile--circle,
  .logo-tile--circle.logo-tile--size-sm,
  .logo-tile--circle.logo-tile--size-lg {
    width: 64px;
    height: 64px;
    padding: 6px;
  }
  .logo-tile--wide,
  .logo-tile--wide.logo-tile--size-sm,
  .logo-tile--wide.logo-tile--size-lg {
    width: 108px;
    height: 52px;
    padding: 6px 8px;
    border-radius: 10px;
  }
  .logo-tile--tall,
  .logo-tile--tall.logo-tile--size-sm,
  .logo-tile--tall.logo-tile--size-lg {
    width: 56px;
    height: 76px;
    padding: 6px;
    border-radius: 10px;
  }
  .logo-tile--square,
  .logo-tile--square.logo-tile--size-sm,
  .logo-tile--square.logo-tile--size-lg {
    width: 68px;
    height: 68px;
    padding: 6px;
    border-radius: 10px;
  }

  .carousel-glow-left,
  .carousel-glow-right {
    width: 40px;
  }

  .value-card { padding: 3rem 1.5rem; }
  
  .stat-top {
    top: 8%;
    left: -2%;
  }
  .stat-bottom {
    bottom: 10%;
    right: -2%;
  }
  .floating-stat {
    padding: 0.8rem 1.2rem;
    border-radius: 10px;
  }
  .visual-card-premium .stat-number {
    font-size: 2.2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .logo-list,
  .float-anim {
    animation: none !important;
  }
}
</style>
