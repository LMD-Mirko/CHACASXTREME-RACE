<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

import chacasHero from '@/assets/images/chacas/chacas.webp';
import slide1 from '@/assets/images/chacas/1.webp';
import slide2 from '@/assets/images/chacas/2.webp';
import slide3 from '@/assets/images/chacas/3.webp';
import { useI18n } from 'vue-i18n';

const images = [slide1, slide2, slide3];

const currentImageIndex = ref(0);
let intervalId = null;
const { t } = useI18n();

onMounted(() => {
  intervalId = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % images.length;
  }, 5000);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="chacas-page">
    <!-- HERO SECTION -->
    <section class="chacas-hero">
      <div class="hero-bg">
        <div class="overlay"></div>
        <img :src="chacasHero" alt="Paisaje de alta montaña en Chacas, Áncash, Perú - Ruta Chacas Xtreme Race" class="hero-img" />
      </div>

      <div class="container relative z-10">
        <h1 class="hero-title reveal" v-html="t('discover.hero_title').replace('\n', '<br/>')"></h1>
      </div>
    </section>

    <!-- CONTENT SECTION -->
    <section class="chacas-content container">
      <div class="split-layout">
        <!-- Image Box with Auto-Slide Transition -->
        <div class="image-box reveal">
          <Transition name="fade" mode="out-in">
            <img :key="currentImageIndex" :src="images[currentImageIndex]" alt="Ruta de ciclismo extremo en los Andes, Chacas Perú" class="sliding-img" />
          </Transition>
          <!-- Corner Marks -->
          <div class="corner-mark top-left"></div>
          <div class="corner-mark top-right"></div>
          <div class="corner-mark bottom-left"></div>
          <div class="corner-mark bottom-right"></div>
        </div>

        <!-- Text Content -->
        <div class="text-box reveal">
          <h2 class="section-title font-podium">{{ t('discover.section_title') }}</h2>
          <div class="text-content font-inter">
            <p>{{ t('discover.p1') }}</p>
            <p>{{ t('discover.p2') }}</p>
          </div>
          
          <div class="technical-details">
            <div class="detail-item">
              <div class="item-decor top-left"></div>
              <div class="item-decor bottom-right"></div>
              <span class="label font-inter">{{ t('discover.specs.location_label') }}</span>
              <span class="value font-podium">{{ t('discover.specs.location_val') }}</span>
            </div>
            <div class="detail-item">
              <div class="item-decor top-left"></div>
              <div class="item-decor bottom-right"></div>
              <span class="label font-inter">{{ t('discover.specs.altitude_label') }}</span>
              <span class="value font-podium">{{ t('discover.specs.altitude_val') }}</span>
            </div>
            <div class="detail-item">
              <div class="item-decor top-left"></div>
              <div class="item-decor bottom-right"></div>
              <span class="label font-inter">{{ t('discover.specs.climate_label') }}</span>
              <span class="value font-podium">{{ t('discover.specs.climate_val') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chacas-page {
  background: #020202;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 8rem;
}

/* HERO */
.chacas-hero {
  position: relative;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-align: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7; /* Increased for better clarity */
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(2,2,2,0.2), #020202 90%);
  z-index: 1;
}

.hero-title {
  font-family: var(--font-podium);
  font-size: clamp(3.5rem, 9vw, 7.5rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -2px;
  background: linear-gradient(to bottom, #ffffff 40%, rgba(255,255,255,0.25) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* CONTENT LAYOUT */
.chacas-content {
  margin-top: -5vh;
  position: relative;
  z-index: 10;
}

.split-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 6rem;
  align-items: flex-start;
}

/* IMAGE BOX WITH SLIDER */
.image-box {
  position: relative;
  height: 700px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sliding-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: opacity;
}

/* TEXT BOX */
.text-box {
  padding-top: 2rem;
}

.section-title {
  font-family: var(--font-podium);
  font-size: 3rem;
  font-weight: 900;
  color: var(--primary-color);
  margin-bottom: 2.5rem;
  letter-spacing: -1px;
}

.text-content p {
  font-size: 1.15rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  font-weight: 400;
}

.technical-details {
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.detail-item {
  position: relative;
  padding: 2rem 1.5rem;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;
}

.detail-item:hover {
  background: rgba(255, 94, 0, 0.03);
  border-color: rgba(255, 94, 0, 0.35);
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 94, 0, 0.05);
}

.item-decor {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  transition: border-color 0.4s ease;
}

.detail-item:hover .item-decor {
  border-color: var(--primary-color);
}

.item-decor.top-left { top: 10px; left: 10px; border-right: none; border-bottom: none; }
.item-decor.bottom-right { bottom: 10px; right: 10px; border-left: none; border-top: none; }

.label {
  font-size: 0.7rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
}

.value {
  font-family: var(--font-podium);
  font-weight: 900;
  font-size: 1.1rem;
  color: var(--primary-color);
}

/* Corner markers for engineering style */
.corner-mark {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid var(--primary-color);
  z-index: 10;
  pointer-events: none;
}

.corner-mark.top-left { top: 15px; left: 15px; border-right: none; border-bottom: none; }
.corner-mark.top-right { top: 15px; right: 15px; border-left: none; border-bottom: none; }
.corner-mark.bottom-left { bottom: 15px; left: 15px; border-right: none; border-top: none; }
.corner-mark.bottom-right { bottom: 15px; right: 15px; border-left: none; border-top: none; }



/* TRANSITIONS */
.fade-enter-active, .fade-leave-active {
  transition: opacity 1.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .split-layout {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
  
  .image-box {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .chacas-page { padding-bottom: 4rem; }
  .chacas-hero { height: 40vh; }
  .hero-title { font-size: 3.5rem; }
  .section-title { font-size: 2.2rem; }
  .text-content p { font-size: 1rem; }
  .technical-details { 
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 2rem;
    padding-top: 2rem;
  }
}

.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal--visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
