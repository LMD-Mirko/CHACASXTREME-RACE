<script setup>
import { ref } from 'vue';
import confetti from 'canvas-confetti';
import { X } from 'lucide-vue-next';

import gallery1 from '@/assets/images/gallery1.png';
import gallery2 from '@/assets/images/gallery2.png';
import gallery3 from '@/assets/images/gallery3.png';
import hero1 from '@/assets/images/hero1.png';
import hero2 from '@/assets/images/hero2.jpg';
import hero3 from '@/assets/images/hero3.jpg';

const imagesRow1 = [gallery1, gallery2, gallery3];
const imagesRow2 = [hero1, hero2, hero3];

const isWarping = ref(false);
const selectedImage = ref(null);

const openLightbox = (img) => {
  selectedImage.value = img;
  isWarping.value = true;
  setTimeout(() => {
    isWarping.value = false;
  }, 800);
};

const closeLightbox = () => {
  isWarping.value = true;
  setTimeout(() => {
    selectedImage.value = null;
    isWarping.value = false;
  }, 500);
};
</script>

<template>
  <section class="gallery">
    <div class="gallery__header container">
      <h2 class="section-title">NUESTRA VIBRA</h2>
      <h3 class="gallery__headline">EXPEDICIÓN EN CHACAS</h3>
    </div>

    <!-- Row 1: Left to Right -->
    <div class="gallery__row">
      <div class="gallery__track move-right">
        <div v-for="(img, index) in [...imagesRow1, ...imagesRow1, ...imagesRow1]" 
             :key="'r1-'+index" 
             class="gallery__item"
             @click="openLightbox(img)">
          <img :src="img" alt="Gallery 1" />
          <div class="gallery__overlay">
            <span class="gallery__label">AMPLIAR</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: Right to Left -->
    <div class="gallery__row mt-4">
      <div class="gallery__track move-left">
        <div v-for="(img, index) in [...imagesRow2, ...imagesRow2, ...imagesRow2]" 
             :key="'r2-'+index" 
             class="gallery__item"
             @click="openLightbox(img)">
          <img :src="img" alt="Gallery 2" />
          <div class="gallery__overlay">
            <span class="gallery__label">AMPLIAR</span>
          </div>
        </div>
      </div>
    </div>

    <!-- BRUTAL LIGHTBOX -->
    <!-- PREMIUM LIGHTBOX: KINETIC WARP -->
    <Teleport to="body">
      <Transition name="kinetic">
        <div v-if="selectedImage" class="lightbox" @click="closeLightbox">
          <!-- Background Kinetic Text -->
          <div class="lightbox__bg-text">
            <span class="bg-label">XTREME</span>
            <span class="bg-label">CHACAS</span>
            <span class="bg-label">SPEED</span>
          </div>

          <button class="lightbox__close"><X :size="32" /></button>
          
          <div class="lightbox__content" :class="{ 'is-warping': isWarping }" @click.stop>
            <!-- RGB Shift Layers -->
            <div class="rgb-layer rgb-layer--red"><img :src="selectedImage" /></div>
            <div class="rgb-layer rgb-layer--blue"><img :src="selectedImage" /></div>
            <img :src="selectedImage" alt="Zoomed" class="lightbox__img" />
            
            <div class="lightbox__glow"></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.gallery {
  padding: 8rem 0;
  background: #050505;
  overflow: hidden;
}

.gallery__header {
  margin-bottom: 4rem;
  text-align: center;
}

.gallery__headline {
  font-family: var(--font-accent);
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  letter-spacing: -2px;
}

.gallery__row {
  display: flex;
  width: 100%;
}

.mt-4 { margin-top: 1.5rem; }

.gallery__track {
  display: flex;
  gap: 1.5rem;
}

.move-right {
  animation: scroll-right 40s linear infinite;
}

.move-left {
  animation: scroll-left 40s linear infinite;
}

.gallery__track:hover {
  animation-play-state: paused;
}

.gallery__item {
  position: relative;
  flex: 0 0 450px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.gallery__overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 94, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.gallery__label {
  font-family: var(--font-accent);
  color: white;
  font-weight: 800;
  letter-spacing: 4px;
  font-size: 1.2rem;
  transform: translateY(20px);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.gallery__item:hover img {
  transform: scale(1.15) rotate(2deg);
}

.gallery__item:hover .gallery__overlay {
  opacity: 1;
}

.gallery__item:hover .gallery__label {
  transform: translateY(0);
}

@keyframes scroll-right {
  0% { transform: translateX(calc(-450px * 3 - 1.5rem * 3)); }
  100% { transform: translateX(0); }
}

@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-450px * 3 - 1.5rem * 3)); }
}

/* LIGHTBOX BRUTAL */
/* KINETIC LIGHTBOX: THE NEXT LEVEL */
.lightbox {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(15, 15, 15, 0.95) 0%, #000 100%);
  backdrop-filter: blur(15px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.lightbox__bg-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.03;
  pointer-events: none;
  overflow: hidden;
}

.bg-label {
  font-family: var(--font-accent);
  font-size: 20vw;
  font-weight: 900;
  line-height: 0.8;
  color: white;
  white-space: nowrap;
}

.lightbox__content {
  position: relative;
  max-width: 80vw;
  max-height: 80vh;
  z-index: 10;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.lightbox__img {
  width: 100%;
  height: auto;
  max-height: 80vh;
  display: block;
  border-radius: 4px;
  position: relative;
  z-index: 5;
  box-shadow: 0 30px 60px rgba(0,0,0,0.8);
}

/* RGB SHIFT EFFECT */
.rgb-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  z-index: 4;
}

.rgb-layer img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.is-warping .rgb-layer--red {
  animation: rgb-red 0.6s ease-out;
  filter: sepia(100%) hue-rotate(-50deg) saturate(5);
}

.is-warping .rgb-layer--blue {
  animation: rgb-blue 0.6s ease-out;
  filter: sepia(100%) hue-rotate(180deg) saturate(5);
}

@keyframes rgb-red {
  0% { transform: translate(0); opacity: 0; }
  20% { transform: translate(-20px, 10px); opacity: 0.5; }
  100% { transform: translate(0); opacity: 0; }
}

@keyframes rgb-blue {
  0% { transform: translate(0); opacity: 0; }
  20% { transform: translate(20px, -10px); opacity: 0.5; }
  100% { transform: translate(0); opacity: 0; }
}

.lightbox__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  opacity: 0.1;
  z-index: 1;
  pointer-events: none;
}

.lightbox__close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  color: white;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: var(--transition-smooth);
}

.lightbox__close:hover {
  background: var(--primary-color);
  color: black;
  transform: rotate(90deg);
}

/* KINETIC TRANSITION */
.kinetic-enter-active, .kinetic-leave-active {
  transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.kinetic-enter-from, .kinetic-leave-to {
  opacity: 0;
  transform: scale(0.85);
  letter-spacing: 20px;
}

.kinetic-enter-active .bg-label {
  animation: kinetic-labels 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes kinetic-labels {
  0% { transform: translateX(-100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 0.03; }
}

@media (max-width: 768px) {
  .gallery { padding: 4rem 0; }
  .gallery__header { margin-bottom: 2rem; }
  .gallery__headline { font-size: 2rem; }
  .gallery__item { flex: 0 0 300px; height: 200px; }
  @keyframes scroll-right {
    0% { transform: translateX(calc(-300px * 3 - 1.5rem * 3)); }
    100% { transform: translateX(0); }
  }
  @keyframes scroll-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-300px * 3 - 1.5rem * 3)); }
  }
}
</style>
