<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { fetchSponsorsNames } from '@/composables/useBackendApi';

import hero1 from '@/assets/images/hero1.webp';
import hero2 from '@/assets/images/hero2.webp';
import hero3 from '@/assets/images/hero3.webp';

const { t, locale } = useI18n();
const router = useRouter();

const bgImages = [hero1, hero2, hero3];

const localSponsorList = [
  'Nombre de Auspiciador',
  'Manka Riders Partner',
  'Auspiciador Oficial',
  'Nombre de Auspiciador',
  'Sponsor Destacado',
  'Nombre de Auspiciador'
];
const sponsorList = ref([...localSponsorList]);
const sponsorLoading = ref(true);

const slides = computed(() => [
  {
    title: t('hero.slides[0].title'),
    subtitle: t('hero.slides[0].subtitle'),
  },
  {
    title: t('hero.slides[1].title'),
    subtitle: t('hero.slides[1].subtitle'),
  },
  {
    title: t('hero.slides[2].title'),
    subtitle: t('hero.slides[2].subtitle'),
  },
]);

const currentIndex = ref(0);
let timer = null;

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.value.length;
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length;
};

const startTimer = () => {
  timer = setInterval(nextSlide, 7500);
};

const navigateToEdition4 = () => {
  router.push('/edicion-4');
};

const TICKER_MIN = 20;
const repeatToLength = (items = [], minLen = TICKER_MIN) => {
  const uniq = Array.from(new Set((items || []).map(i => String(i || '').trim()).filter(Boolean)));
  // If API returned nothing, fallback will be handled by caller
  if (!uniq.length) return [];

  // If we already have many items, return all (show "completo")
  if (uniq.length >= minLen) {
    return uniq;
  }

  // Otherwise repeat the unique remote items until we reach minLen
  const result = [];
  let i = 0;
  while (result.length < minLen) {
    result.push(uniq[i % uniq.length]);
    i++;
  }
  return result;
};

const loadSponsorNames = async () => {
  try {
    const names = await fetchSponsorsNames();
    if (Array.isArray(names) && names.length) {
      // Use only remote names, dedupe and repeat them to reach the baseline length
      sponsorList.value = repeatToLength(names, localSponsorList.length);
    } else {
      // No names returned — fallback to local defaults
      sponsorList.value = [...localSponsorList];
    }
  } catch (error) {
    console.warn('Sponsors API unavailable:', error.message);
    sponsorList.value = [...localSponsorList];
  } finally {
    sponsorLoading.value = false;
  }
};

onMounted(() => {
  startTimer();
  loadSponsorNames();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <section class="hero" id="inicio">
    <!-- Cinematic Background Slideshow (Ken Burns Effect linked to slide index) -->
    <div class="slideshow-container">
      <transition name="fade-bg">
        <div :key="currentIndex" class="slide-item">
          <div 
            class="slide-image" 
            :style="{ backgroundImage: `url(${bgImages[currentIndex]})` }"
          ></div>
        </div>
      </transition>
      <div class="video-overlay"></div>
      <div class="noise-bg"></div>
    </div>

    <div class="hero__slider">
      <transition-group name="slide-fade">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          v-show="currentIndex === index"
          class="hero__slide"
        >
          <div class="container hero__content">
            <div class="hero__text-box" :key="'slide-' + currentIndex">
              <span class="hero__tagline hero-enter hero-enter--1">{{ t('hero.tagline') }}</span>
              <h1 class="hero__title font-podium hero-enter hero-enter--2">
                {{ slide.title }}
              </h1>
              <p class="hero__description hero-enter hero-enter--3">
                {{ slide.subtitle }}
              </p>
              <div class="hero__actions hero-enter hero-enter--4">
                <button @click="navigateToEdition4" class="btn btn--primary group">
                  <span v-if="locale === 'es'">4TA EDICIÓN — 28 DE JULIO</span>
                  <span v-else-if="locale === 'it'">4ª EDIZIONE — 28 LUGLIO</span>
                  <span v-else>4TH EDITION — JULY 28</span>
                  <ArrowUpRight :size="16" class="arrow-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- Controls -->
      <div class="hero__controls hero-enter hero-enter--5">
        <button @click="prevSlide" class="control-btn" aria-label="Previous Slide">
          <ChevronLeft :size="28" />
        </button>
        <div class="hero__dots">
          <span 
            v-for="(_, index) in slides" 
            :key="index"
            :class="['dot', { active: currentIndex === index }]"
            @click="currentIndex = index"
          ></span>
        </div>
        <button @click="nextSlide" class="control-btn" aria-label="Next Slide">
          <ChevronRight :size="28" />
        </button>
      </div>
    </div>

    <!-- Double Caution Tape Sponsors Ticker -->
    <div class="sponsor-tape-container hero-tape-enter">
      <!-- Tape 1 (Orange, moves Left) -->
      <div class="sponsor-tape sponsor-tape--1">
        <div class="tape-track move-left">
          <div class="tape-segment" v-for="i in 2" :key="'t1-'+i">
            <div class="tape-item" v-for="(sponsor, idx) in sponsorList" :key="'s1-'+idx">
              <span class="hazard-stripes"></span>
              <span>{{ sponsor }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tape 2 (Black, moves Right) -->
      <div class="sponsor-tape sponsor-tape--2">
        <div class="tape-track move-right">
          <div class="tape-segment" v-for="i in 2" :key="'t2-'+i">
            <div class="tape-item" v-for="(sponsor, idx) in sponsorList" :key="'s2-'+idx">
              <span class="hazard-stripes"></span>
              <span>{{ sponsor }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto; /* Enable scroll fallback if zoomed or short screen */
  overflow-x: hidden; /* Prevent horizontal scroll on all viewports */
  background-color: #020202;
}

/* BACKGROUND SLIDESHOW (KEN BURNS EFFECT) */
.slideshow-container {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.slide-item {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.slide-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.78) contrast(1.08) saturate(0.95); /* Bright, visible, slightly polished */
  animation: kenburns 16s ease-in-out forwards;
  will-change: transform;
}

@keyframes kenburns {
  0% {
    transform: scale(1.15) translate(0%, 0%);
  }
  100% {
    transform: scale(1.02) translate(-1%, -0.5%);
  }
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.5) 90%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.95) 100%),
    linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.75) 100%);
  z-index: 1;
}

.noise-bg {
  position: absolute;
  inset: 0;
  background: url('https://grainy-gradients.vercel.app/noise.svg');
  opacity: 0.1;
  mix-blend-mode: overlay;
  z-index: 2;
}

/* Crossfade Transition */
.fade-bg-enter-active,
.fade-bg-leave-active {
  transition: opacity 1.8s ease-in-out;
}

.fade-bg-enter-from,
.fade-bg-leave-to {
  opacity: 0;
}

.hero__slider {
  flex: 1 0 auto;
  min-height: 520px; /* Strong baseline height to contain text and action buttons */
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.hero__slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero__content {
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 5%;
}

.hero__text-box {
  max-width: 850px;
}

/* Hero entrance — runs on load and on each slide change */
.hero-enter {
  opacity: 0;
  animation: hero-fade-up 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.hero-enter--1 { animation-delay: 0.15s; }
.hero-enter--2 { animation-delay: 0.3s; }
.hero-enter--3 { animation-delay: 0.45s; }
.hero-enter--4 { animation-delay: 0.6s; }
.hero-enter--5 { animation-delay: 0.75s; }

@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-tape-enter {
  animation: tape-slide-up 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.9s both;
}

@keyframes tape-slide-up {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-enter,
  .hero-tape-enter {
    opacity: 1;
    animation: none;
    transform: none;
  }
}

.hero__tagline {
  display: inline-block;
  font-family: var(--font-main);
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.hero__title {
  font-size: clamp(2.4rem, 5.5vw, 6.2rem);
  font-weight: 900;
  line-height: 0.92;
  margin-bottom: 1.8rem;
  letter-spacing: -2px;
  color: #ffffff;
  text-transform: uppercase;
  word-break: break-word;
  hyphens: auto;
}

.hero__description {
  font-family: var(--font-main);
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--text-secondary);
  margin-bottom: 2.8rem;
  max-width: 550px;
  line-height: 1.6;
}

.hero__actions {
  display: flex;
  gap: 1.5rem;
}

/* BUTTONS */
.btn {
  font-family: var(--font-accent);
  padding: 1.1rem 2.8rem;
  border-radius: 4px;
  font-weight: 950;
  font-size: 0.85rem;
  transition: var(--transition-smooth);
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  outline: none;
}

.btn--primary {
  background: var(--primary-color);
  color: #000;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 10px 25px rgba(255, 94, 0, 0.25);
}

.btn--primary:hover {
  background: #ffffff;
  color: #000;
  transform: translateY(-4px) skew(-3deg);
  box-shadow: 0 15px 35px rgba(255, 94, 0, 0.4);
}

.arrow-icon {
  transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.btn--primary:hover .arrow-icon {
  transform: translate(3px, -3px);
}

.btn--outline {
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  background: transparent;
}

.btn--outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(255, 94, 0, 0.05);
}

/* Controls */
.hero__controls {
  position: absolute;
  bottom: 8.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2.5rem;
  z-index: 30;
}

.control-btn {
  color: rgba(255, 255, 255, 0.45);
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.control-btn:hover {
  color: var(--primary-color);
  transform: scale(1.15);
}

.hero__dots {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.dot {
  width: 35px;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.dot.active {
  background: var(--primary-color);
  width: 55px;
}

/* Transitions */
.slide-fade-enter-active {
  transition: opacity 0.8s ease, transform 1s cubic-bezier(0.19, 1, 0.22, 1);
}

.slide-fade-leave-active {
  transition: opacity 0.6s ease, transform 0.8s cubic-bezier(0.19, 1, 0.22, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

@media (max-width: 1024px) {
  .hero__content {
    align-items: flex-start;
    padding-top: calc(var(--navbar-h) + 1.5rem);
    padding-bottom: 9rem;
    min-height: 100%;
  }

  .hero__controls {
    bottom: calc(6.75rem + env(safe-area-inset-bottom, 0px));
    gap: 1.25rem;
  }

  .sponsor-tape-container {
    bottom: env(safe-area-inset-bottom, 0px);
    padding-bottom: 0.75rem;
  }
}

@media (max-width: 1024px) and (display-mode: standalone) {
  .hero {
    padding-bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px));
  }

  .hero__controls {
    bottom: calc(6.75rem + var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px));
  }

  .sponsor-tape-container {
    bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 768px) {
  .hero__content {
    align-items: center;
    padding-left: 0;
    padding-top: calc(var(--navbar-h) + 1rem);
    padding-bottom: 9rem;
  }

  .hero__text-box {
    text-align: center;
    margin: 0 auto;
    padding: 0 0.25rem;
    width: 100%;
  }

  .hero__tagline {
    font-size: 0.72rem;
    letter-spacing: 2.5px;
    margin-bottom: 1rem;
  }

  .hero__title {
    font-size: clamp(1.85rem, 9vw, 2.75rem);
    letter-spacing: -1px;
    margin-bottom: 1rem;
    line-height: 0.95;
  }
  
  .hero__description {
    font-size: clamp(0.92rem, 3.5vw, 1rem);
    margin-bottom: 1.75rem;
    line-height: 1.55;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .hero__actions {
    flex-direction: column;
    gap: 0.85rem;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
  }

  .btn {
    padding: 0.95rem 1.25rem;
    font-size: 0.78rem;
    letter-spacing: 1.5px;
    width: 100%;
    justify-content: center;
  }

  .hero__controls {
    bottom: calc(6.25rem + env(safe-area-inset-bottom, 0px));
    gap: 1rem;
    width: calc(100% - 2rem);
    left: 50%;
    transform: translateX(-50%);
    justify-content: center;
  }

  .control-btn {
    padding: 0.25rem;
  }

  .dot {
    width: 18px;
    height: 2px;
  }

  .dot.active {
    width: 30px;
  }

  .hero__dots {
    gap: 0.75rem;
  }

  .sponsor-tape-container {
    padding-bottom: 0.5rem;
  }

  .sponsor-tape {
    padding: 0.5rem 0;
    font-size: clamp(0.72rem, 2.8vw, 0.85rem);
    letter-spacing: 1.5px;
    width: 112%;
    margin-left: -6%;
  }

  .sponsor-tape--1 {
    transform: rotate(-1.5deg) scale(1.02);
  }

  .sponsor-tape--2 {
    transform: rotate(1deg) scale(1.02);
    margin-top: -0.9rem;
  }

  .hazard-stripes {
    width: 16px;
    height: 9px;
    margin: 0 0.75rem;
  }

  .slide-fade-enter-from {
    transform: translateX(16px);
  }

  .slide-fade-leave-to {
    transform: translateX(-16px);
  }
}

@media (max-width: 380px) {
  .hero__title {
    font-size: 1.65rem;
  }

  .hero__controls {
    bottom: calc(5.75rem + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 768px) and (display-mode: standalone) {
  .hero__controls {
    bottom: calc(6.25rem + var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 380px) and (display-mode: standalone) {
  .hero__controls {
    bottom: calc(5.75rem + var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px));
  }
}

/* SPONSOR TICKER TAPE SYSTEM */
.sponsor-tape-container {
  position: relative; /* Changed to relative to sit naturally below slide content */
  margin-top: auto; /* Push to the bottom in flex flow */
  width: 100%;
  z-index: 25;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  padding-bottom: 2rem;
  padding-top: 1rem;
}

.sponsor-tape {
  width: 110%; /* Bleed past screen edges to prevent rotation clipping */
  margin-left: -5%;
  padding: 0.75rem 0; /* Slightly thinner */
  font-family: var(--font-podium);
  font-weight: 900;
  font-size: clamp(0.95rem, 2vw, 1.25rem); /* Slightly smaller text */
  letter-spacing: 2.5px;
  text-transform: uppercase;
  white-space: nowrap;
  display: flex;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.55);
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
}

.sponsor-tape--1 {
  transform: rotate(-2.2deg) scale(1.05); /* Slightly lower angle */
  background: var(--primary-color);
  color: #000000;
  z-index: 2;
}

.sponsor-tape--2 {
  transform: rotate(1.4deg) scale(1.05); /* Slightly lower angle */
  background: #0d0d0d;
  color: var(--primary-color);
  border-color: var(--primary-color);
  margin-top: -1.3rem; /* Perfect overlap for new height */
  z-index: 1;
}

.tape-track {
  display: flex;
  width: max-content;
  will-change: transform;      /* GPU layer → animación sin layout thrashing */
  contain: layout style;       /* Aísla el layout del resto de la página */
}

.move-left {
  animation: scroll-left-tape 14s linear infinite;
}

.move-right {
  animation: scroll-right-tape 14s linear infinite;
}

.tape-segment {
  display: flex;
  align-items: center;
}

.tape-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Caution Hazard Stripes */
.hazard-stripes {
  width: 26px; /* Proportionate size */
  height: 14px;
  background: repeating-linear-gradient(
    -45deg,
    #000,
    #000 4px,
    var(--primary-color) 4px,
    var(--primary-color) 8px
  );
  display: inline-block;
  margin: 0 1.6rem;
  border-radius: 1px;
}

.sponsor-tape--2 .hazard-stripes {
  background: repeating-linear-gradient(
    -45deg,
    var(--primary-color),
    var(--primary-color) 4px,
    #000 4px,
    #000 8px
  );
}

@keyframes scroll-left-tape {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-60%, 0, 0); }
}

@keyframes scroll-right-tape {
  0% { transform: translate3d(-60%, 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
</style>
