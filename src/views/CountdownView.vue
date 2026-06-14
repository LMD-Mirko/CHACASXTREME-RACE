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
  mouseX.value = (e.clientX / window.innerWidth - 0.5) * 20;
  mouseY.value = (e.clientY / window.innerHeight - 0.5) * 20;
  gsap.to('.parallax-layer', { x: mouseX.value, y: mouseY.value, duration: 1, ease: "power2.out" });
};

const handleStartExit = () => {
  isExiting.value = true;

  // Initialize transition timeline
  const exitTl = gsap.timeline({
    onComplete: () => router.push('/inicio')
  });

  // Set initial state for slanted panel (offscreen to the right)
  gsap.set('.slanted-wipe-panel', { x: '120vw' });

  // Play clean slanted sweep animation (slower and smoother transition)
  exitTl.to('.content', { opacity: 0, x: -30, duration: 0.45, ease: "power2.in" })
        .to('.slanted-wipe-panel', { x: '-20vw', duration: 0.85, ease: "power2.inOut" }, 0.05);
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
  gsap.set('.content', { scale: 0.95, opacity: 0 });
  gsap.set(['.hero-logo', '.title-char', '.extreme-text', '.subtitle', '.timer-item', '.nav-section', '.social-footer', '.raider-bg', '.stats-container'], {
    opacity: 0, y: 20, filter: 'blur(5px)'
  });

  tl.to('.impact-overlay', { opacity: 0, duration: 0.6, ease: "power2.out" })
    .to('.content', { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" }, 0)
    .to('.hero-logo', { duration: 0.8, opacity: 1, y: 0, filter: 'blur(0px)', ease: "back.out(1.4)" }, 0.15)
    .to('.raider-bg', { duration: 1.2, opacity: 0.18, y: 0, filter: 'blur(0px)', ease: "power2.out" }, 0.3)
    .to('.title-char', { duration: 0.5, opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.012, ease: "power2.out" }, 0.4)
    .to('.extreme-text', { duration: 0.6, opacity: 1, y: 0, filter: 'blur(0px)', ease: "back.out(1.5)", onComplete: () => {
        const titleEl = document.querySelector('.title');
        if (titleEl) titleEl.classList.add('glitch-active');
    }}, 0.5)
    .to('.subtitle', { duration: 0.5, opacity: 1, y: 0, filter: 'blur(0px)', ease: "power2.out" }, "-=0.25")
    .to('.timer-item', { duration: 0.5, opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', stagger: 0.05, ease: "back.out(1.2)" }, "-=0.25")
    .to('.nav-section', { duration: 0.5, opacity: 1, y: 0, filter: 'blur(0px)', ease: "power2.out" }, "-=0.2")
    .to(['.stats-container', '.social-footer'], { duration: 0.5, opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.08, ease: "power2.out" }, "-=0.25");
};
</script>

<template>
  <div class="countdown-view">
    <!-- Overlay for Initial Transition -->
    <div class="impact-overlay transition-layer"></div>

    <!-- Cinematic Circular Shutter & Speed Tunnel Exit Transition -->
    <div class="custom-transition-container" v-if="isExiting">
      <div class="slanted-wipe-panel"></div>
    </div>

    <!-- Background Parallax Canvas -->
    <div class="background-overlay parallax-layer">
      <div class="vignette"></div>
      <div class="noise-bg"></div>
      <div class="scanlines"></div>
      <div class="glow-sphere"></div>
      <div class="huellas-bg" :style="{ maskImage: `url(${huellas})`, webkitMaskImage: `url(${huellas})` }"></div>
      <div class="raider-bg" :style="{ backgroundImage: `url(${raider})` }"></div>
    </div>

    <!-- Header Actions (Language selector capsule) -->
    <div class="header-actions-top">
      <LanguageSelector />
    </div>

    <!-- Main Container styled to strictly fit single viewport on any screen -->
    <div class="content main-layout">
      <!-- Logo Section -->
      <div class="hero-logo">
        <div class="logo-wrapper">
          <img :src="logo" alt="Chacas Xtreme Race" class="main-logo" />
          <div class="edition-badge">{{ t('teaser.badge') }}</div>
        </div>
        
      </div>

      <!-- Heading Section (Gradient clip fixed by animating single block) -->
      <div class="headline">
        <h1 class="title">
          <div class="title-row first-row">
            <span v-for="(char, i) in t('teaser.title_prep').split('')" :key="i" class="title-char">{{ char === ' ' ? '&nbsp;' : char }}</span>
          </div>
          <div class="title-row title-bottom">
            <span class="lo-text title-char">{{ t('teaser.title_lo') }}</span>
            <span class="extreme-text">{{ t('teaser.title_ext') }}</span>
          </div>
        </h1>
        <p class="subtitle">{{ t('teaser.subtext') }}</p>
      </div>

      <!-- Glassmorphic Countdown Dock -->
      <div class="timer-container">
        <div class="timer-item" v-for="(val, unit) in { 
          [t('teaser.time.days')]: timeLeft.days, 
          [t('teaser.time.hours')]: timeLeft.hours, 
          [t('teaser.time.minutes')]: timeLeft.minutes, 
          [t('teaser.time.seconds')]: timeLeft.seconds 
        }" :key="unit">
          <div class="timer-value">{{ val.toString().padStart(2, '0') }}</div>
          <div class="timer-label">{{ unit }}</div>
          <div class="timer-glow"></div>
        </div>
      </div>

      <!-- Premium Skewed Button with magnetic hover & tap feedback -->
      <div class="nav-section">
        <button @click="handleStartExit" class="btn-extreme">
          <span class="btn-text">{{ t('teaser.cta_enter') }}</span>
          <ArrowRight :size="18" class="btn-icon" />
        </button>
      </div>

      <!-- Technical Route Stats -->
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-number">3,359</span>
          <span class="stat-name">msnm</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">24</span>
          <span class="stat-name">KM</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">100%</span>
          <span class="stat-name">ADN</span>
        </div>
      </div>

      <!-- Footer Social Icons -->
      <div class="social-footer">
        <a href="https://instagram.com" target="_blank" class="social-link" aria-label="Instagram"><Instagram :size="22" /></a>
        <a href="https://facebook.com" target="_blank" class="social-link" aria-label="Facebook"><Facebook :size="22" /></a>
        <a href="https://tiktok.com" target="_blank" class="social-link" aria-label="TikTok">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.6 8.6 0 0 1-1.87-1.39v9.23c.03 2.05-.62 4.13-1.95 5.7a7.6 7.6 0 0 1-5.69 2.76 7.6 7.6 0 0 1-6.19-2.9 8.3 8.3 0 0 1-1.63-5.36 8.1 8.1 0 0 1 2.39-5.74 7.64 7.64 0 0 1 5.37-2.33V12.1a3.25 3.25 0 0 0-2.6 1.86c-.51.81-.66 1.79-.47 2.72.2 1.1.84 2.1 1.76 2.73.93.63 2.1.83 3.19.55 1.1-.3 1.99-1.12 2.4-2.16.29-.82.35-1.7.35-2.56V.02z"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Force single viewport layout to prevent any scroll behavior completely */
.countdown-view {
  height: 100dvh;
  min-height: 100dvh;
  max-height: 100dvh;
  background: #020202;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden; /* Strict scroll block */
  font-family: 'Bebas Neue', sans-serif;
  padding: 0;
}

/* CINEMATIC SLANTED SWEEP EXIT TRANSITION OVERLAY */
.custom-transition-container {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: all;
  background: transparent;
  overflow: hidden;
}

.slanted-wipe-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 140vw;
  height: 100%;
  background: #ff5e00;
  box-shadow: -15px 0 50px rgba(0, 0, 0, 0.6);
  transform: skewX(-15deg);
}

/* OVERLAYS & BACKGROUND */
.background-overlay {
  position: absolute;
  inset: -30px;
  background: radial-gradient(circle at center, #150801 0%, #020202 100%);
  z-index: 0;
  overflow: hidden;
}

.noise-bg {
  position: absolute;
  inset: 0;
  background: url('https://grainy-gradients.vercel.app/noise.svg');
  opacity: 0.1;
  mix-blend-mode: overlay;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.45) 51%);
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 5;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.9) 100%);
  z-index: 2;
}

.glow-sphere {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(75vw, 400px);
  height: min(75vw, 400px);
  background: radial-gradient(circle, rgba(255, 94, 0, 0.12) 0%, rgba(255, 94, 0, 0) 70%);
  filter: blur(15px);
  z-index: 1;
  pointer-events: none;
}

.raider-bg {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  max-width: 600px;
  height: 70%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: right bottom;
  opacity: 0.18;
  filter: sepia(1) saturate(5) hue-rotate(-20deg) brightness(0.6);
  mix-blend-mode: lighten;
  z-index: 1;
  pointer-events: none;
}

.huellas-bg {
  position: absolute;
  inset: -10%;
  mask-repeat: repeat;
  -webkit-mask-repeat: repeat;
  mask-size: 300px auto;
  -webkit-mask-size: 300px auto;
  background-color: #ff5e00;
  opacity: 0.025;
  transform: rotate(-22deg);
  mix-blend-mode: plus-lighter;
  pointer-events: none;
  z-index: 0;
}

/* CYCLICAL TYRE TRACKS */
.bike-track {
  position: absolute;
  width: 500px;
  height: 120px;
  background-color: #ff5e00;
  mask-size: contain;
  mask-repeat: repeat-x;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: repeat-x;
  z-index: 4;
  opacity: 0;
  pointer-events: none;
}

.track--tl { top: 8%; left: -10%; transform: rotate(18deg); }
.track--br { bottom: 12%; right: -10%; transform: rotate(-18deg); }

/* HEADER ACTIONS */
.header-actions-top {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  z-index: 50;
}

/* MAIN CONTENT BLOCK */
.content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: space-evenly;
  width: 100%;
  height: 96%;
  max-width: 680px;
  padding: 2.8rem 0.5rem 0.5rem 0.5rem;
}

/* LOGO SECTION */
.hero-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-logo {
  width: clamp(120px, 25vw, 175px);
  height: auto;
  filter: drop-shadow(0 0 20px rgba(255, 94, 0, 0.3));
}

.edition-badge {
  background: linear-gradient(90deg, #ff5e00 0%, #ff8200 100%);
  color: #000;
  font-weight: 950;
  padding: 0.2rem 1.5rem;
  font-size: clamp(0.8rem, 1.8vw, 1.1rem);
  letter-spacing: 3px;
  margin-top: -0.5rem;
  transform: skewX(-12deg);
  box-shadow: 0 4px 12px rgba(255, 94, 0, 0.35);
  text-transform: uppercase;
}

.brand-text-under {
  font-family: var(--font-podium);
  font-size: clamp(1.2rem, 3.2vw, 1.6rem);
  font-weight: 950;
  letter-spacing: 2px;
  margin-top: 0.6rem;
  display: flex;
  gap: 0.4rem;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 10px rgba(255, 94, 0, 0.2);
}

.brand-text-under .white-text {
  color: #ffffff;
}

.brand-text-under .accent-orange-text {
  color: var(--primary-color);
}

.brand-text-under .sub-race-text {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.65em;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.08rem 0.45rem;
  border-radius: 3px;
  letter-spacing: 1px;
  line-height: 1;
}

/* HEADINGS */
.title {
  display: flex;
  flex-direction: column;
  font-size: clamp(2rem, 6.5vw, 4.6rem);
  line-height: 0.95;
  margin-bottom: 0.5rem;
}

.title-row {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  font-family: var(--font-podium);
  text-transform: uppercase;
}

.first-row {
  font-size: 1.12em;
  letter-spacing: -1px;
}

.title-char {
  display: inline-block;
  white-space: pre;
}

.title-bottom {
  gap: clamp(0.4rem, 1.2vw, 1rem);
  align-items: baseline;
  justify-content: center;
}

.lo-text { 
  font-family: var(--font-podium);
  font-size: 0.44em; 
  opacity: 0.9; 
  font-weight: 950;
  color: #ffffff;
}

.extreme-text {
  font-family: 'Rubik Glitch', system-ui;
  background: linear-gradient(135deg, #ff5e00 0%, #ff8c00 50%, #ffc000 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.15em;
  filter: drop-shadow(0 0 20px rgba(255, 94, 0, 0.4));
  display: inline-block;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(0.68rem, 1.6vw, 0.8rem);
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: clamp(2.5px, 0.8vw, 4px);
  max-width: 520px;
  margin: 0 auto;
  text-transform: uppercase;
  font-weight: 500;
  line-height: 1.35;
}

/* GLASSMORPHIC COUNTDOWN */
.timer-container {
  display: flex;
  gap: clamp(0.4rem, 1.5vw, 0.8rem);
  width: 100%;
  justify-content: center;
  max-width: 440px;
}

.timer-item {
  position: relative;
  flex: 1 1 0px;
  min-width: 60px;
  max-width: 95px;
  background: rgba(15, 8, 4, 0.5);
  border: 1px solid rgba(255, 94, 0, 0.12);
  border-bottom: 3px solid #ff5e00;
  border-radius: 6px;
  padding: clamp(0.6rem, 1.6vh, 1rem) 0.15rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.timer-value {
  font-size: clamp(1.5rem, 4.5vw, 2.6rem);
  font-weight: 900;
  line-height: 1;
  color: #ffffff;
  position: relative;
  z-index: 2;
}

.timer-label {
  font-family: 'Inter', sans-serif;
  font-size: clamp(0.5rem, 1.3vw, 0.65rem);
  letter-spacing: 1.2px;
  color: #ff5e00;
  font-weight: 800;
  margin-top: 0.25rem;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
}

.timer-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 94, 0, 0.06) 0%, transparent 80%);
  pointer-events: none;
  z-index: 1;
}

/* PREMIUM SKEWED BUTTON */
.btn-extreme {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(255, 94, 0, 0.1) 0%, rgba(255, 94, 0, 0.02) 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 94, 0, 0.35);
  padding: 0.85rem clamp(2rem, 5vw, 3.8rem);
  font-size: clamp(0.85rem, 1.8vw, 1.05rem);
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform: skewX(-7deg);
}

.btn-text, .btn-icon {
  display: inline-block;
  transform: skewX(7deg);
}

.btn-extreme::before {
  content: '';
  position: absolute;
  top: 0; 
  left: -100%;
  width: 100%; 
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 94, 0, 0.15), transparent);
  transition: left 0.6s ease;
  z-index: -1;
}

.btn-extreme:hover::before {
  left: 100%;
}

.btn-extreme:hover {
  background: #ff5e00;
  color: #000;
  border-color: #ff5e00;
  box-shadow: 0 0 25px rgba(255, 94, 0, 0.4);
  transform: translateY(-3px) skewX(-7deg);
}

.btn-extreme:active {
  transform: scale(0.96) skewX(-7deg) !important;
}

.btn-icon {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-extreme:hover .btn-icon {
  transform: translate(4px, 0) skewX(7deg);
}

/* STATS ROW */
.stats-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(0.8rem, 3.5vw, 2.2rem);
  width: 100%;
  max-width: 440px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.6rem 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: clamp(1.2rem, 3.2vw, 1.6rem);
  font-weight: 900;
  color: #ffffff;
  line-height: 1.1;
}

.stat-name {
  font-family: 'Inter', sans-serif;
  font-size: clamp(0.5rem, 1.3vw, 0.6rem);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 0.1rem;
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.12);
}

/* FOOTER / SOCIAL */
.social-footer {
  display: flex;
  gap: 2rem;
}

.social-link {
  color: rgba(255, 255, 255, 0.45);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.social-link:hover {
  color: #ff5e00;
  transform: scale(1.2) rotate(6deg);
}

/* GLITCH EFFECTS */
.glitch-active { 
  animation: glitch 0.25s infinite alternate-reverse; 
}

@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-1px, 1px); }
  40% { transform: translate(1px, -1px); }
  60% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 1px); }
  100% { transform: translate(0); }
}

/* MOBILE DYNAMIC LAYOUT CORRECTIONS */
@media (max-width: 480px) {
  .content {
    padding-top: 2.2rem;
    height: 94%;
  }
  .title-bottom {
    gap: 0.2rem;
  }
  .timer-container {
    gap: 0.3rem;
  }
  .timer-item {
    border-bottom-width: 2px;
    padding: 0.55rem 0.1rem;
  }
  .social-footer {
    gap: 1.8rem;
  }
}

/* Safe margins for small heights (iPhone SE / folding screens) */
@media (max-height: 670px) {
  .content {
    height: 98%;
    padding-top: 2rem;
  }
  .raider-bg {
    height: 60%;
  }
}
</style>
