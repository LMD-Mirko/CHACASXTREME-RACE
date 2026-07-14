<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Instagram, Facebook, ArrowRight, MessageCircle } from 'lucide-vue-next';
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
const showZooming4 = ref(false);
const showTransitionStyled4 = ref(false);
const typedChacas = ref('');
const typedX = ref('');
const typedTreme = ref('');
const typedRace = ref('');

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
  showZooming4.value = true;
  showTransitionStyled4.value = false;
  typedChacas.value = '';
  typedX.value = '';
  typedTreme.value = '';
  typedRace.value = '';

  // Initialize transition timeline
  const exitTl = gsap.timeline({
    onComplete: () => router.push('/inicio')
  });

  // Set initial states
  gsap.set('.giant-zoom-4', { scale: 0.1, opacity: 0 });
  gsap.set('.slanted-wipe-panel', { x: '120vw', opacity: 0 });
  gsap.set('.transition-logo-container', { opacity: 0 });

  // 1. Zoom in the giant number 4
  exitTl.to('.giant-zoom-4', { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.2)", force3D: true })
        .to('.giant-zoom-4', { 
          scale: 20, 
          opacity: 0.95, 
          duration: 0.55, 
          ease: "power2.in",
          force3D: true,
          onComplete: () => {
            showZooming4.value = false;
          }
        }, "+=0.1");

  // 2. Wipe in slanted panel background and activate logo container overlay
  exitTl.to('.slanted-wipe-panel', { opacity: 1, x: '-20vw', duration: 0.75, ease: "power3.inOut" }, 0.8)
        .to('.transition-logo-container', { opacity: 1, duration: 0.15 }, 0.95);

  // Typewriter helper
  const typeText = (refVar, text, duration, selectorToPop) => {
    const obj = { val: 0 };
    return gsap.to(obj, {
      val: text.length,
      duration: duration,
      ease: "none",
      onUpdate: () => {
        refVar.value = text.slice(0, Math.ceil(obj.val));
      },
      onComplete: () => {
        if (selectorToPop) {
          gsap.fromTo(selectorToPop, 
            { scale: 1.25, rotate: selectorToPop === '.logo-x-char' ? -12 : (Math.random() - 0.5) * 6 }, 
            { scale: 1, rotate: selectorToPop === '.logo-x-char' ? -5 : 0, duration: 0.22, ease: "back.out(2)" }
          );
        }
      }
    });
  };

  // 3. Type writer animation steps
  exitTl.add(typeText(typedX, 'X', 0.22, '.logo-x-char'), 1.1)
        .add(typeText(typedChacas, 'CHACAS', 0.35, '.logo-row-chacas'), '+=0.02')
        .add(typeText(typedTreme, 'TREME', 0.28, '.treme-text'), '+=0.02')
        .add(typeText(typedRace, 'RACE', 0.22, '.race-text'), '+=0.02')
        
        // 4. Pop styled "4" badge next to RACE
        .add(() => {
          showTransitionStyled4.value = true;
          gsap.fromTo('.transition-styled-4',
            { scale: 0, opacity: 0, rotate: -25 },
            { scale: 1, opacity: 1, rotate: -12, duration: 0.45, ease: "back.out(2.2)" }
          );
        }, '+=0.05')
        
        .to({}, { duration: 1.3 }) // Read time
        .to('.custom-transition-container', { opacity: 0, duration: 0.45, ease: "power2.out" });
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
      <div class="zooming-intro-4" v-if="showZooming4">
        <div class="giant-zoom-4 font-podium">4</div>
      </div>
      
      <div class="slanted-wipe-panel"></div>
      <div class="transition-logo-container">
        <div class="logo-x-wrapper">
          <div class="logo-x-char">{{ typedX }}</div>
        </div>
        <div class="logo-text-stack">
          <div class="logo-row-chacas">
            {{ typedChacas }}
          </div>
          <div class="logo-row-treme-race">
            <span class="treme-text">{{ typedTreme }}</span>
            <span class="race-text">{{ typedRace }}</span>
            <span class="transition-styled-4 font-podium" v-if="showTransitionStyled4">4</span>
          </div>
        </div>
      </div>
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
        <a href="https://www.instagram.com/manka_riders_team/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram"><Instagram :size="22" /></a>
        <a href="https://www.facebook.com/profile.php?id=61567035784750&locale=es_LA" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook"><Facebook :size="22" /></a>
        <a href="https://wa.me/51983426996" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="WhatsApp"><MessageCircle :size="22" /></a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Force single viewport layout to prevent any scroll behavior completely */
.countdown-view {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  background: #020202;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden !important; /* Force NO scrollbars at all */
  font-family: 'Bebas Neue', sans-serif;
  padding: 1.5rem 1rem;
  box-sizing: border-box;
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

/* Zooming 4 Layer on Exit */
.zooming-intro-4 {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #010101;
  z-index: 10010;
  pointer-events: none;
}

.giant-zoom-4 {
  font-family: var(--font-podium);
  font-size: clamp(15rem, 30vw, 25rem);
  font-weight: 950;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-style: italic;
  line-height: 1.25; /* Increased to prevent top and bottom clip cut-off */
  padding: 1rem 2rem; /* Added padding to prevent slanted edge clip */
  text-shadow: 0 0 35px rgba(255, 94, 0, 0.45); /* High-performance text shadow */
  will-change: transform;
}

/* Styled 4 badge next to RACE */
.transition-styled-4 {
  font-family: var(--font-podium);
  font-size: clamp(2rem, 7vh, 4rem);
  font-weight: 950;
  color: #000 !important;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: 0 0.8rem;
  margin-left: 0.6rem;
  border-radius: 6px;
  line-height: 1.15;
  transform: skewX(-12deg);
  display: inline-block;
  font-style: italic;
  box-shadow: 0 0 10px rgba(255, 94, 0, 0.35);
  will-change: transform;
  transform-origin: center;
}

.slanted-wipe-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 140vw;
  height: 100%;
  background: radial-gradient(circle at 75% 20%, rgba(255, 94, 0, 0.15) 0%, transparent 60%),
              radial-gradient(circle at 25% 80%, rgba(251, 191, 36, 0.08) 0%, transparent 60%),
              #0c0c0c;
  border-left: 5px solid #ff5e00;
  box-shadow: -8px 0 20px rgba(0, 0, 0, 0.6); /* Reduced shadow depth for GPU performance */
  transform: skewX(-15deg);
  will-change: transform;
}

/* OVERLAYS & BACKGROUND */
.background-overlay {
  position: absolute;
  inset: -30px;
  background: radial-gradient(circle at center, #150801 0%, #020202 100%);
  z-index: 0;
  overflow: hidden;
  will-change: transform;
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
  justify-content: space-evenly;
  text-align: center;
  width: 100%;
  height: 100%;
  max-width: 600px;
  padding: 0.5rem;
  box-sizing: border-box;
  gap: 0.5rem;
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

/* MOBILE DYNAMIC LAYOUT CORRECTIONS & SMALL HEIGHT SAFETY */
@media (max-width: 480px) {
  .content {
    padding: 0.5rem;
    height: 100%;
  }
  .main-logo {
    width: 110px;
  }
  .edition-badge {
    font-size: 0.72rem;
    padding: 0.15rem 1.2rem;
    margin-top: -0.3rem;
  }
  .title {
    font-size: clamp(1.4rem, 5.5vw, 2.5rem);
    margin-bottom: 0.2rem;
  }
  .subtitle {
    font-size: 0.62rem;
    letter-spacing: 1.5px;
    line-height: 1.3;
  }
  .timer-container {
    max-width: 320px;
    gap: 0.3rem;
  }
  .timer-item {
    border-bottom-width: 2px;
    padding: 0.4rem 0.1rem;
    min-width: 50px;
  }
  .timer-value {
    font-size: 1.6rem;
  }
  .timer-label {
    font-size: 0.52rem;
    margin-top: 0.15rem;
  }
  .btn-extreme {
    padding: 0.75rem 2.2rem;
    font-size: 0.85rem;
    box-shadow: 0 0 15px rgba(255, 94, 0, 0.25);
  }
  .stats-container {
    gap: 0.8rem;
    padding: 0.3rem 0;
  }
  .stat-number {
    font-size: 1.05rem;
  }
  .stat-name {
    font-size: 0.48rem;
  }
  .social-footer {
    gap: 1.5rem;
  }
}

@media (max-height: 750px) {
  .content {
    height: 100%;
    gap: 0.3rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .main-logo {
    width: 95px;
  }
  .title {
    font-size: 1.6rem;
    margin-bottom: 0.15rem;
  }
  .timer-item {
    padding: 0.35rem 0.1rem;
  }
  .timer-value {
    font-size: 1.4rem;
  }
  .btn-extreme {
    padding: 0.65rem 2rem;
  }
  .stats-container {
    padding: 0.25rem 0;
  }
  .raider-bg {
    height: 50%;
  }
}

/* TRANSITION TEXT ANIMATIONS */
.transition-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 3.5vw, 2.2rem);
  z-index: 10005; /* Higher than .slanted-wipe-panel (9999) */
  pointer-events: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: auto;
  max-width: 90%;
  will-change: transform, opacity;
}

.logo-x-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-x-char {
  font-family: 'Rubik Glitch', system-ui, var(--font-podium);
  font-size: clamp(5.5rem, 18vh, 10.5rem);
  font-weight: 950;
  color: #ff221c;
  line-height: 0.8;
  transform: rotate(-5deg);
  text-shadow: 0 0 25px rgba(255, 34, 28, 0.5);
  will-change: transform;
}

.logo-text-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.logo-row-chacas {
  font-family: var(--font-podium);
  font-size: clamp(2.8rem, 9vh, 5.2rem);
  font-weight: 950;
  line-height: 0.95;
  color: #ffcc00;
  text-transform: uppercase;
  letter-spacing: -2px;
  text-shadow: 3px 3px 0px #990000;
  will-change: transform;
}

.logo-row-treme-race {
  font-family: var(--font-podium);
  font-size: clamp(2rem, 7vh, 4rem);
  font-weight: 950;
  line-height: 0.95;
  text-transform: uppercase;
  letter-spacing: -1px;
  display: flex;
  gap: 0.4rem;
}

.treme-text {
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  will-change: transform;
}

.race-text {
  color: #ff5e00;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  will-change: transform;
}

@media (max-width: 480px) {
  .transition-logo-container {
    gap: 0.8rem;
  }
  .logo-x-char {
    font-size: clamp(4rem, 15vh, 7rem);
  }
  .logo-row-chacas {
    font-size: clamp(2rem, 8vh, 3.5rem);
    text-shadow: 2px 2px 0px #990000;
  }
  .logo-row-treme-race {
    font-size: clamp(1.5rem, 6vh, 2.6rem);
    gap: 0.25rem;
  }
}
</style>
