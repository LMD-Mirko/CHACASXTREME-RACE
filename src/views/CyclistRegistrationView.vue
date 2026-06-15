<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, Instagram } from 'lucide-vue-next';
import joseImg from '@/assets/images/jose.webp';
import luigiImg from '@/assets/images/luigi.webp';

const { t } = useI18n();

const riders = computed(() => [
  {
    name: "JOSE IGNACIO",
    alias: t('events.participants[0].alias') || "\"EL DEMONIO\"",
    image: joseImg,
    tag: t('events.hall.card.tag') || "CICLISTA ELITE",
    instagram: "https://www.instagram.com/eldemonio.mtb/",
    color: "#ff5e00",
    colorRgb: "255, 94, 0",
    stats: [
      { name: "POTENCIA / VELOCIDAD", value: 98 },
      { name: "AGILIDAD / TÉCNICA", value: 95 },
      { name: "RESISTENCIA DE ALTURA", value: 99 }
    ]
  },
  {
    name: "LUIGI TRAVI",
    alias: t('events.participants[1].alias') || "RIDER ELITE",
    image: luigiImg,
    tag: t('events.hall.card.tag') || "CICLISTA ELITE",
    instagram: "https://www.instagram.com/luigitravi/",
    color: "#fbbf24",
    colorRgb: "251, 191, 36",
    stats: [
      { name: "POTENCIA / VELOCIDAD", value: 94 },
      { name: "AGILIDAD / TÉCNICA", value: 98 },
      { name: "RESISTENCIA DE ALTURA", value: 96 }
    ]
  }
]);

const hoveredIndex = ref(null);
</script>

<template>
  <div class="riders-versus-page">
    <!-- SVG Filter for Jagged Electric / Lightning Effect -->
    <svg style="position: absolute; width: 0; height: 0;" aria-hidden="true">
      <defs>
        <filter id="electric-arc-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.09" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>

    <!-- Background grid lines & carbon mesh texture -->
    <div class="editorial-grid">
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
    </div>
    <div class="carbon-mesh-overlay"></div>

    <!-- Back Button to Home -->
    <RouterLink to="/inicio" class="btn-back">
      <ArrowLeft :size="16" /> VOLVER AL INICIO
    </RouterLink>

    <!-- Header badge and title -->
    <div class="page-header container">
      <span class="header-badge">{{ t('events.hall.badge') }}</span>
      <h1 class="page-title font-podium">
        {{ t('events.hall.title_prefix') }} 
        <span class="primary-text">{{ t('events.hall.title_highlight') }}</span>
      </h1>
      <p class="page-subtitle">El enfrentamiento de las cumbres. Conoce a los dos corredores más representativos de la hermandad Manka Riders en el Chacas Xtreme.</p>
    </div>

    <!-- Versus Dashboard Grid -->
    <div class="versus-dashboard">
      <div 
        v-for="(rider, index) in riders" 
        :key="index"
        class="rider-profile-card"
        :class="{ 
          'card-hovered': hoveredIndex === index, 
          'card-dimmed': hoveredIndex !== null && hoveredIndex !== index
        }"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
        :style="{ '--rider-accent': rider.color, '--rider-accent-rgb': rider.colorRgb }"
      >
        <!-- Electric Lightning Perimeter Border SVG -->
        <svg class="electric-border-svg" width="100%" height="100%">
          <rect x="0" y="0" width="100%" height="100%" rx="28" ry="28" class="electric-rect electric-rect--glow" />
          <rect x="0" y="0" width="100%" height="100%" rx="28" ry="28" class="electric-rect electric-rect--core" />
        </svg>

        <!-- Background watermark name -->
        <div class="watermark-name font-podium">{{ index === 0 ? 'DEMONIO' : 'ELITE' }}</div>

        <!-- Viewfinder Circular Frame -->
        <div class="viewfinder-frame">
          <div class="outer-rotating-ring"></div>
          <div class="inner-image-wrap">
            <img :src="rider.image" :alt="rider.name" class="rider-avatar" />
          </div>
        </div>

        <!-- Rider Profile Header -->
        <div class="rider-profile-header">
          <span class="rider-tag">{{ rider.tag }}</span>
          <h2 class="rider-name font-podium">{{ rider.name }}</h2>
          <span class="rider-alias">{{ rider.alias }}</span>
        </div>

        <!-- Speedometer Circular Gauges -->
        <div class="gauges-row">
          <div v-for="(stat, sIdx) in rider.stats" :key="sIdx" class="gauge-item">
            <div class="gauge-svg-wrap">
              <svg class="gauge-svg" viewBox="0 0 50 50">
                <!-- Track circle -->
                <circle cx="25" cy="25" r="22" class="gauge-track" />
                <!-- Progress circle -->
                <circle 
                  cx="25" 
                  cy="25" 
                  r="22" 
                  class="gauge-fill" 
                  :style="{ 
                    strokeDasharray: '138', 
                    strokeDashoffset: hoveredIndex === index ? 138 - (138 * stat.value) / 100 : 138,
                    stroke: rider.color
                  }"
                />
              </svg>
              <span class="gauge-value font-podium">{{ stat.value }}%</span>
            </div>
            <span class="gauge-label">{{ stat.name }}</span>
          </div>
        </div>

        <a :href="rider.instagram" target="_blank" rel="noopener noreferrer" class="instagram-link-btn">
          <Instagram :size="15" /> {{ t('events.hall.card.instagram') }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.riders-versus-page {
  background: #020202;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 8rem;
  overflow-x: hidden;
  position: relative;
}

/* Background lines */
.editorial-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  pointer-events: none;
  z-index: 1;
}
.grid-col-line {
  border-right: 1px solid rgba(255, 255, 255, 0.02);
  height: 100%;
}

/* Carbon fiber mesh background overlay */
.carbon-mesh-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(rgba(255, 94, 0, 0.03) 1.5px, transparent 1.5px), 
    radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 20px 20px, 40px 40px;
  pointer-events: none;
  z-index: 1;
}

/* Floating back button */
.btn-back {
  position: absolute;
  top: 100px;
  left: 5%;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #fff;
  text-decoration: none;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 2px;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.6rem 1.3rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}
.btn-back:hover {
  background: var(--primary-color);
  color: #000;
  border-color: var(--primary-color);
  box-shadow: 0 0 15px rgba(255, 94, 0, 0.3);
}

.primary-text {
  color: var(--primary-color);
}

/* Page Header */
.page-header {
  padding-top: 180px;
  padding-bottom: 4rem;
  text-align: center;
  position: relative;
  z-index: 10;
}

.header-badge {
  display: inline-block;
  padding: 0.3rem 1rem;
  background: rgba(255, 94, 0, 0.05);
  border: 1px solid rgba(255, 94, 0, 0.25);
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 850;
  font-size: 0.65rem;
  letter-spacing: 3px;
  border-radius: 100px;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.page-title {
  font-size: clamp(2.5rem, 5vw, 4.2rem);
  font-weight: 900;
  letter-spacing: -1px;
  text-transform: uppercase;
  margin: 0;
  color: #fff;
}

.page-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.5);
  max-width: 650px;
  margin: 1.2rem auto 0;
  line-height: 1.6;
}

/* Versus Dashboard Grid */
.versus-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
  gap: 6rem;
  align-items: stretch;
}

.rider-profile-card {
  position: relative;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.01) 0%, transparent 100%), rgba(8, 8, 8, 0.45);
  border: 1.5px solid rgba(255, 255, 255, 0.04);
  border-radius: 28px;
  padding: 4.5rem 3.5rem;
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  z-index: 1;
}

.rider-profile-card:hover {
  transform: translateY(-8px);
  border-color: transparent;
  background: radial-gradient(circle at top center, rgba(var(--rider-accent-rgb), 0.03) 0%, transparent 80%), rgba(12, 12, 12, 0.6);
}

/* Electric Lightning Perimeter Border SVG */
.electric-border-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  overflow: visible;
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.4s ease;
  will-change: opacity;
}

.rider-profile-card:hover .electric-border-svg {
  opacity: 1;
}

.electric-rect {
  stroke-linecap: round;
  stroke-dasharray: 240 800;
  stroke-dashoffset: 1040;
  animation: moveBorder 2.5s linear infinite, electricCrackle 0.08s steps(2) infinite;
  filter: url(#electric-arc-filter);
  transform-origin: center;
  will-change: stroke-dashoffset, transform, opacity;
}

.electric-rect--glow {
  stroke: var(--rider-accent);
  stroke-width: 6px;
}

.electric-rect--core {
  stroke: #ffffff;
  stroke-width: 2px;
}

@keyframes moveBorder {
  from {
    stroke-dashoffset: 1040;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes electricCrackle {
  0% {
    opacity: 0.8;
    transform: scale(0.995) translate(-1px, 1px) rotate(0.2deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.005) translate(1px, -1px) rotate(-0.2deg);
  }
  100% {
    opacity: 0.9;
    transform: scale(1.0) translate(-0.5px, 0.5px) rotate(0.1deg);
  }
}

.card-hovered {
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.85),
              0 0 40px rgba(var(--rider-accent-rgb), 0.15) !important;
}

.card-dimmed {
  opacity: 0.55;
  transform: scale(0.98);
}

/* Watermark Outline text */
.watermark-name {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(6rem, 12vw, 11rem);
  font-weight: 950;
  color: rgba(255, 255, 255, 0.01);
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.008);
  pointer-events: none;
  z-index: 2;
  letter-spacing: -2px;
  transition: color 0.4s ease, -webkit-text-stroke 0.4s ease;
}

.rider-profile-card:hover .watermark-name {
  color: rgba(var(--rider-accent-rgb), 0.012);
  -webkit-text-stroke: 1px rgba(var(--rider-accent-rgb), 0.05);
}

/* Viewfinder Profile Circular Frame */
.viewfinder-frame {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.outer-rotating-ring {
  position: absolute;
  inset: -8px;
  border: 1.5px dashed var(--rider-accent);
  border-radius: 50%;
  opacity: 0.25;
  transition: opacity 0.5s ease, transform 0.5s ease, border-style 0.5s;
  animation: rotateClockwise 25s linear infinite;
  will-change: transform, opacity;
}

.rider-profile-card:hover .outer-rotating-ring {
  opacity: 0.85;
  border-style: solid;
  animation: rotateClockwise 8s linear infinite;
}

@keyframes rotateClockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.inner-image-wrap {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
  transition: border-color 0.5s ease, box-shadow 0.5s ease;
}

.rider-profile-card:hover .inner-image-wrap {
  border-color: var(--rider-accent);
  box-shadow: 0 0 20px rgba(var(--rider-accent-rgb), 0.15), 0 10px 30px rgba(0, 0, 0, 0.8);
}

.rider-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.85) contrast(1.1) brightness(0.9);
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1),
              filter 0.6s ease;
}

.rider-profile-card:hover .rider-avatar {
  transform: scale(1.05);
  filter: grayscale(0) contrast(1.15) brightness(1);
}

/* Rider Profile Header */
.rider-profile-header {
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.rider-tag {
  font-family: var(--font-accent);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 2.5px;
  color: var(--rider-accent);
  text-transform: uppercase;
}

.rider-name {
  font-size: clamp(2rem, 3vw, 2.6rem);
  font-weight: 900;
  line-height: 1;
  margin: 0;
  color: #fff;
}

.rider-alias {
  font-family: var(--font-accent);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
}

/* Speedometers Row */
.gauges-row {
  display: flex;
  justify-content: space-around;
  gap: 1.5rem;
  width: 100%;
  margin-top: 1rem;
}

.gauge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
}

.gauge-svg-wrap {
  position: relative;
  width: 60px;
  height: 60px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.04);
  stroke-width: 3.5px;
}

.gauge-fill {
  fill: none;
  stroke-width: 3.5px;
  stroke-linecap: round;
  transition: stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1);
  filter: drop-shadow(0 0 4px var(--rider-accent));
}

.gauge-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: 900;
  color: #fff;
}

.gauge-label {
  font-size: 0.52rem;
  font-family: var(--font-accent);
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 800;
  text-align: center;
  line-height: 1.3;
}

/* Instagram Capsule Link */
.instagram-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.9rem 1.8rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  color: #fff;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  text-decoration: none;
  transition: all 0.35s ease;
  margin-top: 2.5rem;
  width: max-content;
}

.instagram-link-btn:hover {
  background: var(--rider-accent);
  color: #000;
  border-color: var(--rider-accent);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5),
              0 0 15px var(--rider-accent);
  transform: translateY(-2px);
}

/* RESPONSIVE LAYOUT */
@media (max-width: 1024px) {
  .versus-dashboard {
    grid-template-columns: 1fr;
    gap: 4rem;
    padding: 0 1.5rem;
    max-width: 600px;
  }
  
  .rider-profile-card {
    padding: 3.5rem 2.5rem;
  }

  .side-hovered, .side-dimmed {
    flex: none;
  }

  .card-dimmed {
    opacity: 1;
    transform: none;
  }

  .watermark-name {
    display: none;
  }
}

@media (max-width: 768px) {
  .riders-versus-page {
    padding-bottom: 8rem;
  }
  .btn-back {
    top: 90px;
    left: 1.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.65rem;
  }
  .page-header {
    padding-top: 150px;
    padding-bottom: 2.5rem;
  }
  .page-title {
    font-size: 2.2rem;
  }
  .page-subtitle {
    font-size: 0.95rem;
    margin-top: 0.8rem;
  }
  
  .rider-profile-card {
    padding: 2.5rem 1.5rem;
  }

  .viewfinder-frame {
    width: 150px;
    height: 150px;
  }

  .rider-name {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .gauges-row {
    gap: 0.8rem;
  }
  .gauge-svg-wrap {
    width: 50px;
    height: 50px;
  }
  .gauge-value {
    font-size: 0.7rem;
  }
  .gauge-label {
    font-size: 0.48rem;
    line-height: 1.2;
  }
}
</style>
