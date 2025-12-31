<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import hero1 from '@/assets/images/hero1.png';
import hero2 from '@/assets/images/hero2.jpg';
import hero3 from '@/assets/images/hero3.jpg';

const slides = [
  {
    image: hero1,
    title: 'SENTIR LA ADRENALINA',
    subtitle: 'Manka Riders es más que una competencia, es una comunidad de ciclistas apasionados por el desafío.',
  },
  {
    image: hero2,
    title: 'SUPERAR TUS LÍMITES',
    subtitle: 'Nuestras rutas están diseñadas para poner a prueba cada fibra de tu cuerpo y mente.',
  },
  {
    image: hero3,
    title: 'EQUIPO DE ÉLITE',
    subtitle: 'Contamos con la mejor tecnología y organización para que tu experiencia sea inolvidable.',
  },
];

const currentIndex = ref(0);
let timer = null;

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.length;
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length;
};

const startTimer = () => {
  timer = setInterval(nextSlide, 6000);
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <section class="hero" id="inicio">
    <div class="hero__slider">
      <transition-group name="slide-fade">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          v-show="currentIndex === index"
          class="hero__slide"
        >
          <div 
            class="hero__image" 
            :style="{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.7) 100%), linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%), url(${slide.image})` }"
          ></div>
          
          <div class="container hero__content">
            <div class="hero__text-box">
              <span class="hero__tagline">PRESENTAMOS A MANKA RIDERS</span>
              <h1 class="hero__title">
                {{ slide.title }}
              </h1>
              <p class="hero__description">
                {{ slide.subtitle }}
              </p>
              <div class="hero__actions">
                <button class="btn btn--primary">Inscribirse Ahora</button>
                <button class="btn btn--outline">Versión Demo</button>
              </div>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- Controls -->
      <div class="hero__controls">
        <button @click="prevSlide" class="control-btn"><ChevronLeft :size="32" /></button>
        <div class="hero__dots">
          <span 
            v-for="(_, index) in slides" 
            :key="index"
            :class="['dot', { active: currentIndex === index }]"
            @click="currentIndex = index"
          ></span>
        </div>
        <button @click="nextSlide" class="control-btn"><ChevronRight :size="32" /></button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.hero__slider {
  height: 100%;
  position: relative;
}

.hero__slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: -1;
  transform: scale(1.1);
  filter: brightness(0.85) contrast(1.1) saturate(0.9);
  animation: zoom-out 20s linear infinite alternate;
}

@keyframes zoom-out {
  from { transform: scale(1.2); }
  to { transform: scale(1); }
}

.hero__slide[style*="display: block"] .hero__image,
.hero__slide:not([style*="display: none"]) .hero__image {
  transform: scale(1);
}

.hero__content {
  height: 100%;
  display: flex;
  align-items: center;
}

.hero__text-box {
  max-width: 700px;
}

.hero__tagline {
  display: inline-block;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 2px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.hero__title {
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 900;
  line-height: 1;
  margin-bottom: 2rem;
  letter-spacing: -2px;
}

.hero__description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  max-width: 500px;
}

.hero__actions {
  display: flex;
  gap: 1.5rem;
}

.btn {
  font-family: var(--font-accent);
  padding: 1rem 2.5rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 1rem;
  transition: var(--transition-smooth);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn--primary {
  background: var(--accent-gradient);
  color: black;
}

.btn--primary:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 255, 136, 0.4);
}

.btn--outline {
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn--outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* Controls */
.hero__controls {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 10;
}

.control-btn {
  color: rgba(255, 255, 255, 0.5);
  transition: var(--transition-smooth);
}

.control-btn:hover {
  color: var(--primary-color);
}

.hero__dots {
  display: flex;
  gap: 1rem;
}

.dot {
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.dot.active {
  background: var(--primary-color);
  width: 60px;
}

/* Transitions */
.slide-fade-enter-active {
  transition: opacity 1s ease, transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: opacity 1s ease, transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

@media (max-width: 768px) {
  .hero__content {
    align-items: flex-end;
    padding-bottom: 8rem;
  }

  .hero__text-box {
    text-align: center;
    margin: 0 auto;
  }

  .hero__title {
    font-size: 2.2rem;
    margin-bottom: 1rem;
    letter-spacing: -1px;
  }
  
  .hero__description {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    line-height: 1.4;
  }

  .hero__tagline {
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
  }

  .hero__actions {
    flex-direction: row;
    gap: 0.8rem;
  }

  .btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.8rem;
    flex: 1;
    text-align: center;
  }

  .hero__controls {
    bottom: 2rem;
    gap: 1rem;
  }

  .dot {
    width: 20px;
  }

  .dot.active {
    width: 35px;
  }
}

@media (max-width: 480px) {
  .hero__actions {
    flex-direction: column;
  }
}
</style>
