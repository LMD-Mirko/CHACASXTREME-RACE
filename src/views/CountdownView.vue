<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Crown, Award, ArrowUpRight } from 'lucide-vue-next';
import { gsap } from 'gsap';
import { useI18n } from 'vue-i18n';
import LanguageSelector from '@/components/common/LanguageSelector.vue';

import hero1 from '@/assets/images/hero1.webp';
import hero2 from '@/assets/images/hero2.webp';
import hero3 from '@/assets/images/hero3.webp';

const router = useRouter();
const { t } = useI18n();
const targetDate = new Date('2026-07-28T00:00:00').getTime();
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });

const bgImages = [hero1, hero2, hero3];
const currentBgIndex = ref(0);
let timerInterval = null;
let bgInterval = null;
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

const handleStartExit = () => {
  isExiting.value = true;
  const exitTl = gsap.timeline({
    onComplete: () => router.push('/inicio')
  });

  // Blast out animation
  exitTl.to('.impact-overlay', { opacity: 1, duration: 0.5, backgroundColor: '#ff5e00', ease: "power4.in" })
        .to('.content', { scale: 1.3, opacity: 0, duration: 0.5, filter: 'blur(10px)', ease: "power4.in" }, 0)
        .to('.slide-image', { scale: 1.25, opacity: 0, duration: 0.6, ease: "power4.in" }, 0)
        .to('.header-nav', { y: -50, opacity: 0, duration: 0.4, ease: "power4.in" }, 0);
};

onMounted(() => {
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
  bgInterval = setInterval(() => {
    currentBgIndex.value = (currentBgIndex.value + 1) % bgImages.length;
  }, 7500);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (bgInterval) clearInterval(bgInterval);
});
</script>

<template>
  <div class="countdown-view">
    <!-- Overlay for Transitions -->
    <div class="impact-overlay transition-layer"></div>
    
    <!-- Cinematic Background Slideshow (Ken Burns Effect) -->
    <div class="slideshow-container">
      <transition name="fade-bg">
        <div :key="currentBgIndex" class="slide-item">
          <div 
            class="slide-image" 
            :style="{ backgroundImage: `url(${bgImages[currentBgIndex]})` }"
          ></div>
        </div>
      </transition>
      <div class="video-overlay"></div>
      <div class="noise-bg"></div>
    </div>

    <!-- Header Navbar -->
    <header class="header-nav animate-fade-in">
      <div class="header-brand font-podium">
        <span class="text-white">CHACAS</span>
        <span class="text-primary ml-2"><span class="text-accent-red">X</span>TREME</span>
      </div>
      <div class="header-actions">
        <LanguageSelector />
      </div>
    </header>

    <!-- Content Overlay -->
    <div class="content main-layout">
      <!-- Tagline -->
      <div class="tagline animate-fade-up">
        <Crown :size="16" class="text-primary animate-pulse" />
        <span class="tagline-text">{{ t('teaser.tagline') }}</span>
      </div>

      <!-- Main Heading -->
      <div class="headline font-podium animate-fade-up-delay-1">
        <h1 class="title">
          <div class="title-row" v-for="(word, i) in t('teaser.headings')" :key="i">
            <span :class="{ 'text-primary': i === 0, 'text-white': i === 1, 'text-accent-yellow': i === 2 }">{{ word }}</span>
          </div>
        </h1>
      </div>

      <!-- Subtext -->
      <p class="subtext animate-fade-up-delay-2">
        {{ t('teaser.subtext') }}
      </p>

      <!-- Minimal Countdown Timer -->
      <div class="timer-container animate-fade-up-delay-2">
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

      <!-- CTA Row -->
      <div class="cta-row animate-fade-up-delay-3">
        <button @click="handleStartExit" class="btn-extreme group">
          <span>{{ t('teaser.cta_enter') }}</span>
          <ArrowUpRight :size="18" class="arrow-icon" />
        </button>
        
        <div class="badge-certified hidden sm:flex">
          <Award :size="32" class="text-primary" />
          <div class="badge-text">
            <span class="text-white font-bold block leading-none">{{ t('teaser.badge_status') }}</span>
            <span class="text-white/60 text-[10px] uppercase tracking-wider block mt-1">{{ t('teaser.badge_desc') }}</span>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row animate-fade-up-delay-4">
        <div class="stat-box">
          <div class="stat-value">3,359 <span class="stat-unit">msnm</span></div>
          <div class="stat-label">{{ t('teaser.stats.altimetry') }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">24 <span class="stat-unit">KM</span></div>
          <div class="stat-label">{{ t('teaser.stats.distance') }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">100% <span class="stat-unit">ADN</span></div>
          <div class="stat-label">{{ t('teaser.stats.adrenaline') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.countdown-view {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 10%;
  padding-right: 10%;
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
    linear-gradient(to right, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.7) 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0.7) 100%);
  z-index: 1;
}

.noise-bg {
  position: absolute;
  inset: 0;
  background: url('https://grainy-gradients.vercel.app/noise.svg');
  opacity: 0.12;
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

/* HEADER NAV */
.header-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.5rem 10%;
  z-index: 30;
}

.header-brand {
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  font-weight: 950;
  letter-spacing: 1px;
}

.text-white {
  color: #ffffff;
}

.text-primary {
  color: var(--primary-color);
}

.text-accent-red {
  color: var(--accent-red);
}

.text-accent-yellow {
  color: var(--secondary-color);
}

.ml-2 {
  margin-left: 0.5rem;
}

/* CONTENT HERO */
.content {
  position: relative;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 1.8rem;
  max-width: 850px;
  padding: 6rem 0;
  margin-top: 3rem;
}

.tagline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tagline-text {
  font-family: var(--font-main);
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.35em;
  text-transform: uppercase;
}

.title {
  font-size: clamp(3rem, 7.5vw, 6.2rem);
  line-height: 0.88;
  font-weight: 900;
  letter-spacing: -2px;
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.title-row {
  display: block;
}

.subtext {
  font-family: var(--font-main);
  font-size: clamp(0.95rem, 2vw, 1.15rem);
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  max-width: 600px;
}

/* TIMER */
.timer-container {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.timer-item {
  background: rgba(255, 255, 255, 0.02);
  border-left: 4px solid var(--primary-color);
  padding: 1.2rem 1.6rem;
  min-width: 120px;
  border-radius: 4px;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.timer-value {
  font-family: var(--font-main);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 950;
  line-height: 1;
  color: #ffffff;
}

.timer-label {
  font-family: var(--font-main);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 0.4rem;
}

/* CTA ROW */
.cta-row {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  margin-top: 1rem;
  width: 100%;
  flex-wrap: wrap;
}

.btn-extreme {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: var(--primary-color);
  color: #000;
  border: none;
  padding: 1.2rem 3.2rem;
  font-family: var(--font-accent);
  font-weight: 950;
  font-size: 0.85rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  border-radius: 4px;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(255, 94, 0, 0.25);
}

.btn-extreme:hover {
  background: #ffffff;
  color: #000;
  transform: translateY(-4px) skew(-3deg);
  box-shadow: 0 15px 35px rgba(255, 94, 0, 0.4);
}

.arrow-icon {
  transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.btn-extreme:hover .arrow-icon {
  transform: translate(4px, -4px);
}

.badge-certified {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  padding-left: 2rem;
}

.badge-text {
  display: flex;
  flex-direction: column;
}

/* STATS ROW */
.stats-row {
  display: flex;
  gap: 5rem;
  flex-wrap: wrap;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  width: 100%;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-value {
  font-family: var(--font-main);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
}

.stat-unit {
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 0.1rem;
}

.stat-label {
  font-family: var(--font-main);
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

/* OVERLAY FOR TRANSITION */
.impact-overlay {
  position: absolute;
  inset: 0;
  background: var(--primary-color);
  opacity: 0;
  z-index: 1000;
  pointer-events: none;
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .countdown-view {
    padding-left: 6%;
    padding-right: 6%;
    justify-content: flex-start;
  }
  
  .header-nav {
    padding: 2rem 6%;
  }

  .content {
    margin-top: 5rem;
    padding: 4rem 0;
    gap: 1.5rem;
  }

  .title {
    font-size: clamp(2.5rem, 9vw, 4.2rem);
  }

  .timer-item {
    min-width: calc(50% - 0.6rem);
    padding: 1rem 1.2rem;
  }

  .timer-value {
    font-size: 2rem;
  }

  .btn-extreme {
    width: 100%;
    justify-content: center;
    padding: 1.1rem;
  }

  .stats-row {
    gap: 2rem;
    justify-content: space-between;
  }

  .stat-value {
    font-size: 1.8rem;
  }

  .stat-unit {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .timer-container {
    gap: 0.6rem;
  }
  
  .timer-item {
    min-width: calc(50% - 0.3rem);
    padding: 0.8rem 1rem;
  }
}
</style>
