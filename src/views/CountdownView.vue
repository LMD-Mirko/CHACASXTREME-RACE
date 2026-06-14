<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Instagram, Facebook, ArrowRight } from 'lucide-vue-next';
import { gsap } from 'gsap';
import { useI18n } from 'vue-i18n';
import LanguageSelector from '@/components/common/LanguageSelector.vue';

import logo from '@/assets/images/logo1.png';
import huellas from '@/assets/images/huellas.png';
import raider from '@/assets/images/raider.png';

const router = useRouter();
const { t } = useI18n();
const targetDate = new Date('2026-07-28T00:00:00').getTime();
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });

let timerInterval = null;
const mouseX = ref(0);
const mouseY = ref(0);
const isExiting = ref(false);

const updateCountdown = () => {
  const now = new Date().getTime();
  const distance = targetDate - now;
  if (distance < 0) return;
  timeLeft.value.days = Math.floor(distance / (1000 * 60 * 60 * 24));
  timeLeft.value.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  timeLeft.value.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  timeLeft.value.seconds = Math.floor((distance % (1000 * 60)) / 1000);
};

const handleMouseMove = (e) => {
  if (isExiting.value) return;
  mouseX.value = (e.clientX / window.innerWidth - 0.5) * 40;
  mouseY.value = (e.clientY / window.innerHeight - 0.5) * 40;
  gsap.to('.parallax-layer', { x: mouseX.value, y: mouseY.value, duration: 1.5, ease: "power2.out" });
};

const handleStartExit = () => {
  isExiting.value = true;
  const exitTl = gsap.timeline({
    onComplete: () => router.push('/inicio')
  });

  // Blast out animation
  exitTl.to('.impact-overlay', { opacity: 1, duration: 0.5, backgroundColor: '#ff5e00', ease: "power4.in" })
        .to('.content', { scale: 1.5, opacity: 0, duration: 0.5, filter: 'blur(10px)', ease: "power4.in" }, 0)
        .to('.background-overlay', { scale: 1.2, opacity: 0, duration: 0.6, ease: "power4.in" }, 0);
};

onMounted(() => {
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
  window.addEventListener('mousemove', handleMouseMove);
  animateEntrance();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  window.removeEventListener('mousemove', handleMouseMove);
});

const animateEntrance = () => {
  const tl = gsap.timeline();

  // Reset states
  gsap.set('.content', { scale: 0.8, opacity: 0 });
  gsap.set(['.main-logo', '.title-char', '.subtitle', '.timer-item', '.nav-section', '.social-footer', '.raider-bg'], {
    opacity: 0, y: 100, filter: 'blur(20px)'
  });

  tl.to('.impact-overlay', { opacity: 0, duration: 1, ease: "power4.out" })
    .to('.content', { scale: 1, opacity: 1, duration: 1.5, ease: "expo.out" }, 0)
    .to('.main-logo', { duration: 1.2, opacity: 1, y: 0, filter: 'blur(0px)', ease: "elastic.out(1, 0.4)" }, 0.3)
    .to('.raider-bg', { duration: 2, opacity: 0.25, y: 0, filter: 'blur(0px)', ease: "expo.out" }, 0.5)
    .to('.title-char', { duration: 0.8, opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.02, ease: "back.out(2)", onComplete: () => {
        const titleEl = document.querySelector('.title');
        if (titleEl) titleEl.classList.add('glitch-active');
    }}, 0.6)
    .to('.subtitle', { duration: 0.8, opacity: 1, y: 0, filter: 'blur(0px)', ease: "power2.out" }, "-=0.3")
    .to('.timer-item', { duration: 0.8, opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', stagger: 0.1, ease: "expo.out" }, "-=0.5")
    .to(['.nav-section', '.social-footer'], { duration: 0.8, opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.2, ease: "power3.out" }, "-=0.4");

  // Cyclical tracks
  const tracksTl = gsap.timeline({ repeat: -1, repeatDelay: 6 });
  tracksTl.fromTo('.bike-track', { clipPath: 'inset(0 100% 0 0)', opacity: 0.5 }, { clipPath: 'inset(0 0% 0 0)', opacity: 0.5, duration: 1, stagger: 3, ease: "power4.inOut" })
          .to('.bike-track', { opacity: 0.02, duration: 3, ease: "power1.in" }, "+=0.5");
};
</script>

<template>
  <div class="countdown-view">
    <!-- Overlay for Transitions -->
    <div class="impact-overlay transition-layer"></div>

    <div class="background-overlay parallax-layer">
      <div class="vignette"></div>
      <div class="noise-bg"></div>
      <div class="scanlines"></div>
      <div class="huellas-bg" :style="{ maskImage: `url(${huellas})`, webkitMaskImage: `url(${huellas})` }"></div>
      <div class="raider-bg" :style="{ backgroundImage: `url(${raider})` }"></div>
      <div class="bike-track track--tl" :style="{ maskImage: `url(${huellas})`, webkitMaskImage: `url(${huellas})` }"></div>
      <div class="bike-track track--br" :style="{ maskImage: `url(${huellas})`, webkitMaskImage: `url(${huellas})` }"></div>
    </div>

    <!-- Header Actions (Language) -->
    <div class="header-actions-top">
      <LanguageSelector />
    </div>

    <div class="content main-layout">
      <!-- Logo Section -->
      <div class="hero-logo">
        <div class="logo-wrapper">
          <img :src="logo" alt="Chacas Xtreme Race" class="main-logo" />
          <div class="edition-badge">{{ t('teaser.badge') }}</div>
        </div>
      </div>

      <!-- Aggressive Headline -->
      <div class="headline">
        <h1 class="title">
          <div class="title-row">
            <span v-for="(char, i) in t('teaser.title_prep').split('')" :key="i" class="title-char">{{ char === ' ' ? '&nbsp;' : char }}</span>
          </div>
          <div class="title-row title-bottom">
            <span class="lo-text title-char">{{ t('teaser.title_lo') }}</span>
            <span class="extreme-text">
               <span v-for="(char, i) in t('teaser.title_ext').split('')" :key="i" class="title-char">{{ char }}</span>
            </span>
          </div>
        </h1>
        <p class="subtitle">{{ t('teaser.subtext') }}</p>
      </div>

      <!-- Aggressive Countdown -->
      <div class="timer-container">
        <div class="timer-item" v-for="(val, unit) in { 
          [t('teaser.time.days')]: timeLeft.days, 
          [t('teaser.time.hours')]: timeLeft.hours, 
          [t('teaser.time.minutes')]: timeLeft.minutes, 
          [t('teaser.time.seconds')]: timeLeft.seconds 
        }" :key="unit">
          <div class="timer-value">{{ val.toString().padStart(2, '0') }}</div>
          <div class="timer-label">{{ unit }}</div>
        </div>
      </div>

      <!-- Navigation Section -->
      <div class="nav-section">
        <button @click="handleStartExit" class="btn-extreme">
          <span>{{ t('teaser.cta_enter') }}</span>
          <ArrowRight :size="20" />
        </button>
      </div>

      <!-- Social Links -->
      <div class="social-footer">
        <a href="https://instagram.com" target="_blank" class="social-link"><Instagram :size="32" /></a>
        <a href="https://facebook.com" target="_blank" class="social-link"><Facebook :size="32" /></a>
        <a href="https://tiktok.com" target="_blank" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.6 8.6 0 0 1-1.87-1.39v9.23c.03 2.05-.62 4.13-1.95 5.7a7.6 7.6 0 0 1-5.69 2.76 7.6 7.6 0 0 1-6.19-2.9 8.3 8.3 0 0 1-1.63-5.36 8.1 8.1 0 0 1 2.39-5.74 7.64 7.64 0 0 1 5.37-2.33V12.1a3.25 3.25 0 0 0-2.6 1.86c-.51.81-.66 1.79-.47 2.72.2 1.1.84 2.1 1.76 2.73.93.63 2.1.83 3.19.55 1.1-.3 1.99-1.12 2.4-2.16.29-.82.35-1.7.35-2.56V.02z"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.countdown-view {
  min-height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  font-family: 'Bebas Neue', sans-serif;
}

/* OVERLAYS */
.impact-overlay {
  position: absolute;
  inset: 0;
  background: white;
  opacity: 0;
  z-index: 1000;
  pointer-events: none;
}

/* BACKGROUND & PARALLAX */
.background-overlay {
  position: absolute;
  inset: -100px;
  background: radial-gradient(circle at center, #1b0c03 0%, #000 100%);
  z-index: 0;
}

.noise-bg {
  position: absolute;
  inset: 0;
  background: url('https://grainy-gradients.vercel.app/noise.svg');
  opacity: 0.15;
  mix-blend-mode: overlay;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 51%);
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 5;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
  z-index: 2;
}

.raider-bg {
  position: absolute;
  bottom: -5%;
  right: -2%;
  width: 80%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: right bottom;
  opacity: 0.25;
  filter: sepia(1) saturate(10) hue-rotate(-20deg) brightness(0.7);
  mix-blend-mode: screen;
  z-index: 1;
  pointer-events: none;
}

.huellas-bg {
  position: absolute;
  inset: -20%;
  mask-repeat: repeat;
  -webkit-mask-repeat: repeat;
  mask-size: 500px auto;
  -webkit-mask-size: 500px auto;
  background-color: #ff5e00;
  opacity: 0.04;
  transform: rotate(-25deg);
  mix-blend-mode: plus-lighter;
  filter: blur(1px);
  pointer-events: none;
  z-index: 0;
}

/* BIKE TRACKS */
.bike-track {
  position: absolute;
  width: 600px;
  height: 150px;
  background-color: #ff5e00;
  mask-size: contain;
  mask-repeat: repeat-x;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: repeat-x;
  z-index: 4;
  opacity: 0;
  pointer-events: none;
}

.track--tl { top: 10%; left: -5%; transform: rotate(20deg); }
.track--br { bottom: 15%; right: -5%; transform: rotate(-20deg); }

/* HEADER ACTIONS */
.header-actions-top {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 50;
}

/* CONTENT */
.content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2.5rem;
  width: 100%;
  padding: 2rem;
}

.main-logo {
  max-width: 220px;
  filter: drop-shadow(0 0 30px rgba(255, 94, 0, 0.4));
}

.edition-badge {
  background: #ff5e00;
  color: #000;
  font-weight: 900;
  padding: 0.3rem 2rem;
  font-size: 1.4rem;
  letter-spacing: 5px;
  margin-top: -1rem;
  transform: skew(-15deg);
}

/* TITLES */
.title {
  display: flex;
  flex-direction: column;
  font-size: clamp(2.5rem, 10vw, 7rem);
  line-height: 0.85;
  margin-bottom: 1rem;
}

.title-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.title-char {
  display: inline-block;
  white-space: pre;
}

.title-bottom {
  gap: 1.5rem;
  align-items: baseline;
  justify-content: center;
}

.lo-text { font-size: 0.4em; opacity: 0.8; }
.extreme-text {
  font-family: 'Rubik Glitch', system-ui;
  color: #ff5e00;
  font-size: 1.25em;
  text-shadow: 0 0 40px rgba(255, 94, 0, 0.6);
}

.subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 6px;
  max-width: 800px;
  margin: 0 auto;
  text-transform: uppercase;
}

/* TIMER */
.timer-container {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.timer-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.03) 100%);
  border-left: 4px solid #ff5e00;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  min-width: 140px;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

.timer-value {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 900;
  line-height: 1;
  color: white;
}

.timer-label {
  font-size: 0.8rem;
  letter-spacing: 3px;
  color: #ff5e00;
}

/* BUTTON */
.btn-extreme {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 1rem 3.5rem;
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: 4px;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10;
}

.btn-extreme::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: white;
  transition: all 0.4s ease;
  z-index: -1;
}

.btn-extreme:hover {
  color: #000;
  transform: translateY(-5px) skew(-5deg);
  border-color: white;
  box-shadow: 0 20px 50px rgba(255, 94, 0, 0.4);
}
.btn-extreme:hover::before { left: 0; }

/* SOCIAL */
.social-footer {
  display: flex;
  gap: 3rem;
  margin-top: 1rem;
}

.social-link {
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.social-link:hover {
  color: #ff5e00;
  transform: scale(1.4) rotate(10deg);
}

/* GLITCH */
.glitch-active { animation: glitch 0.3s infinite; }
@keyframes glitch {
  0% { transform: translate(0); }
  25% { transform: translate(-2px, 2px); }
  50% { transform: translate(2px, -2px); }
  75% { transform: translate(-2px, -2px); }
  100% { transform: translate(0); }
}

/* MOBILE RESPONSIVE */
@media (max-width: 768px) {
  .title { font-size: clamp(2rem, 12vw, 4rem); }
  .timer-item { min-width: calc(50% - 1rem); padding: 1rem; }
  .main-logo { max-width: 160px; }
  .raider-bg { width: 100%; opacity: 0.15; }
  .header-actions-top { top: 1rem; right: 1rem; }
}

@media (max-width: 480px) {
  .timer-container { gap: 0.8rem; }
  .timer-item { min-width: calc(50% - 0.5rem); }
  .timer-value { font-size: 2.2rem; }
  .btn-extreme { width: 100%; justify-content: center; padding: 1rem; }
}
</style>
