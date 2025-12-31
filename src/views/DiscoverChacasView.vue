<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

import chacasHero from '@/assets/images/chacas /chacas.jpg';
import slide1 from '@/assets/images/chacas /1.jpg';
import slide2 from '@/assets/images/chacas /2.jpg';
import slide3 from '@/assets/images/chacas /3.jpg';

const images = [slide1, slide2, slide3];

const currentImageIndex = ref(0);
let intervalId = null;

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
        <img :src="chacasHero" alt="Chacas Hero" class="hero-img" />
      </div>
      <div class="container relative z-10">
        <h1 class="hero-title reveal">CONOCE<br/>CHACAS</h1>
      </div>
    </section>

    <!-- CONTENT SECTION -->
    <section class="chacas-content container">
      <div class="split-layout">
        <!-- Image Box with Auto-Slide Transition -->
        <div class="image-box reveal">
          <Transition name="fade" mode="out-in">
            <img :key="currentImageIndex" :src="images[currentImageIndex]" alt="Chacas Landscape" class="sliding-img" />
          </Transition>
        </div>

        <!-- Text Content -->
        <div class="text-box reveal">
          <h2 class="section-title">CONOCE CHACAS</h2>
          <div class="text-content">
            <p>
              Chacas, en la región de Áncash, Perú, es un destino único que te invita a sumergirte en la naturaleza 
              más pura, rodeada de imponentes montañas, valles profundos y paisajes deslumbrantes. Es el lugar 
              perfecto para los aventureros, a solo unos kilómetros se encuentra el Parque Nacional Huascarán, 
              donde el majestuoso nevado Huascarán y las montañas cercanas embellecen aún más nuestra ciudad.
            </p>
            <p>
              Además, Chacas destaca por su encantadora arquitectura colonial, su rica herencia cultural y la 
              calidez de su gente, que hacen de cada visita una experiencia memorable. Y para los más intrépidos, 
              organizamos emocionantes rutas en bicicleta, donde podrás explorar caminos secretos y descubrir los 
              rincones más asombrosos de nuestra fascinante comunidad. ¡Ven a vivir la aventura y la tradición de 
              Chacas como nunca antes!
            </p>
          </div>
          
          <div class="technical-details">
            <div class="detail-item">
              <span class="label">UBICACIÓN</span>
              <span class="value">ÁNCASH, PERÚ</span>
            </div>
            <div class="detail-item">
              <span class="label">ALTITUD</span>
              <span class="value">3,359 MSNM</span>
            </div>
            <div class="detail-item">
              <span class="label">CLIMA</span>
              <span class="value">MONTAÑA_FRIO</span>
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
  font-family: var(--font-accent);
  font-size: clamp(4rem, 10vw, 8rem);
  font-weight: 950;
  line-height: 0.9;
  letter-spacing: -2px;
  background: linear-gradient(to bottom, #fff, rgba(255,255,255,0.3));
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
}

/* TEXT BOX */
.text-box {
  padding-top: 2rem;
}

.section-title {
  font-family: var(--font-accent);
  font-size: 3rem;
  font-weight: 950;
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.7rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
}

.value {
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 1.1rem;
  color: var(--primary-color);
}

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
