<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import logo from '@/assets/images/logo.jpg';

const { t } = useI18n();
const isVisible = ref(true);
const isExiting = ref(false); // Controls the exit animation class

// Emit event when splash is fully gone
const emit = defineEmits(['finish']);

onMounted(() => {
  // Minimum display time for the splash
  setTimeout(() => {
    isExiting.value = true;
    
    // Wait for exit animation to finish before destroying
    setTimeout(() => {
      isVisible.value = false;
      emit('finish');
    }, 1000); 
  }, 3000);
});
</script>

<template>
  <div v-if="isVisible" class="splash-screen" :class="{ 'is-exiting': isExiting }">
    <div class="splash-bg">
      <div class="scanlines"></div>
      <div class="vignette"></div>
      
      <!-- Floating Particles -->
      <div class="particles">
        <div v-for="i in 20" :key="i" class="particle" :style="{
          '--x': Math.random() * 100 + '%',
          '--y': Math.random() * 100 + '%',
          '--delay': Math.random() * 3 + 's',
          '--duration': (Math.random() * 4 + 3) + 's'
        }"></div>
      </div>
    </div>

    <div class="splash-content">
      <div class="logo-wrapper">
        <!-- Technical Rings -->
        <div class="ring ring--1"></div>
        <div class="ring ring--2"></div>
        <div class="ring ring--3"></div>
        <div class="ring ring--4"></div>
        
        <!-- Main Logo -->
        <div class="logo-hex">
          <img :src="logo" alt="Manka Riders" class="splash-logo" />
          <div class="logo-pulse"></div>
        </div>
      </div>

      <div class="text-wrapper">
        <h1 class="brand-title">
          <span class="text-reveal">CHACAS</span>
          <span class="text-reveal accent">XTREME</span>
        </h1>
        
        <div class="loader-container">
          <div class="loader-bar"></div>
        </div>
        
        <div class="status-text">
          <span>{{ t('splash.system_check') }}</span>
          <span class="dots">...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Background Effects */
.splash-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.02) 50%, transparent 50%);
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 1;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, #000 90%);
  z-index: 2;
}

/* Floating Particles */
.particles {
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 50%;
  left: var(--x);
  top: var(--y);
  opacity: 0;
  box-shadow: 0 0 10px var(--primary-color);
  animation: float-particle var(--duration) ease-in-out var(--delay) infinite;
}

@keyframes float-particle {
  0% { 
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(-10vh) scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: translateY(-50vh) scale(1);
  }
  90% {
    opacity: 0.3;
  }
  100% { 
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

/* Content Layout */
.splash-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

/* Logo Animation */
.logo-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-hex {
  position: relative;
  z-index: 10;
}

.splash-logo {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 0 30px rgba(255, 94, 0, 0.4);
  animation: logo-enter 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  position: relative;
  z-index: 12;
}

.logo-pulse {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  opacity: 0;
  z-index: 11;
  animation: pulse-out 2s ease-out 1s infinite;
}

@keyframes pulse-out {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* Tech Rings */
.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.ring--1 {
  width: 170px;
  height: 170px;
  border-color: rgba(255, 94, 0, 0.4);
  border-top-color: transparent;
  border-right-color: transparent;
  animation: spin 3s linear infinite;
}

.ring--2 {
  width: 210px;
  height: 210px;
  border-style: dashed;
  border-color: rgba(255, 94, 0, 0.2);
  animation: spin 8s linear infinite reverse;
}

.ring--3 {
  width: 250px;
  height: 250px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: pulse-ring 2s ease-in-out infinite;
}

.ring--4 {
  width: 290px;
  height: 290px;
  border: 1px solid rgba(255, 94, 0, 0.1);
  border-left-color: transparent;
  border-bottom-color: transparent;
  animation: spin 12s linear infinite;
}

/* Text Animations */
.text-wrapper {
  position: relative;
  z-index: 20; /* Ensure text is always on top */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.brand-title {
  font-family: var(--font-accent);
  font-size: 2.5rem;
  font-weight: 950;
  color: #fff;
  letter-spacing: -2px;
  display: flex;
  gap: 0.5rem;
  overflow: hidden;
  position: relative;
  z-index: 21;
}

.text-reveal {
  display: inline-block;
  transform: translateY(100%);
  animation: text-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.5s forwards;
}

.accent {
  color: var(--primary-color);
  animation-delay: 0.6s;
}

/* Loader Bar */
.loader-container {
  width: 200px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  z-index: 15; /* Below text */
}

.loader-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--primary-color);
  transform: translateX(-100%);
  animation: load-progress 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  box-shadow: 0 0 10px var(--primary-color);
}

.status-text {
  font-family: var(--font-accent);
  font-size: 0.7rem;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 21;
}

.dots { animation: dots 1.5s infinite; }

/* Keyframes */
@keyframes logo-enter {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes pulse-ring {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.6; }
}

@keyframes text-up {
  to { transform: translateY(0); }
}

@keyframes load-progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(-20%); }
  100% { transform: translateX(0); }
}

@keyframes dots {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

/* Exit Transition */
.is-exiting {
  animation: slide-up-out 0.8s cubic-bezier(0.7, 0, 0.3, 1) forwards;
}

.is-exiting .splash-content {
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.5s ease;
}

@keyframes slide-up-out {
  0% { transform: translateY(0); clip-path: inset(0 0 0 0); }
  100% { transform: translateY(-100%); clip-path: inset(0 0 100% 0); }
}

@media (max-width: 480px) {
  .logo-wrapper { width: 160px; height: 160px; }
  .splash-logo { width: 110px; height: 110px; }
  .brand-title { font-size: 1.8rem; }
  .ring--1 { width: 140px; height: 140px; }
  .ring--2 { width: 170px; height: 170px; }
  .ring--3 { width: 200px; height: 200px; }
  .ring--4 { width: 230px; height: 230px; }
}
</style>
