<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import hero1 from '@/assets/images/hero1.webp';
import hero2 from '@/assets/images/hero2.webp';
import hero3 from '@/assets/images/hero3.webp';

const { t } = useI18n();
const router = useRouter();

const bgImages = [hero1, hero2, hero3];

const slides = computed(() => [
  {
    title: t('hero.slides[0].title'),
    subtitle: t('hero.slides[0].subtitle'),
  },
  {
    title: t('hero.slides[1].title'),
    subtitle: t('hero.slides[1].subtitle'),
  },
  {
    title: t('hero.slides[2].title'),
    subtitle: t('hero.slides[2].subtitle'),
  },
]);

const currentIndex = ref(0);
let timer = null;

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.value.length;
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length;
};

const startTimer = () => {
  timer = setInterval(nextSlide, 7500);
};

const navigateToRegister = () => {
  router.push('/registro/ciclista');
};

const navigateToDemo = () => {
  router.push('/como-participar');
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
    <!-- Cinematic Background Slideshow (Ken Burns Effect linked to slide index) -->
    <div class="slideshow-container">
      <transition name="fade-bg">
        <div :key="currentIndex" class="slide-item">
          <div 
            class="slide-image" 
            :style="{ backgroundImage: `url(${bgImages[currentIndex]})` }"
          ></div>
        </div>
      </transition>
      <div class="video-overlay"></div>
      <div class="noise-bg"></div>
    </div>

    <div class="hero__slider">
      <transition-group name="slide-fade">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          v-show="currentIndex === index"
          class="hero__slide"
        >
          <div class="container hero__content">
            <div class="hero__text-box">
              <span class="hero__tagline animate-fade-up">{{ t('hero.tagline') }}</span>
              <h1 class="hero__title font-podium animate-fade-up-delay-1">
                {{ slide.title }}
              </h1>
              <p class="hero__description animate-fade-up-delay-2">
                {{ slide.subtitle }}
              </p>
              <div class="hero__actions animate-fade-up-delay-3">
                <button @click="navigateToRegister" class="btn btn--primary group">
                  <span>{{ t('hero.cta_primary') }}</span>
                  <ArrowUpRight :size="16" class="arrow-icon" />
                </button>
                <button @click="navigateToDemo" class="btn btn--outline">
                  {{ t('hero.cta_secondary') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- Controls -->
      <div class="hero__controls animate-fade-in-delay">
        <button @click="prevSlide" class="control-btn" aria-label="Previous Slide">
          <ChevronLeft :size="28" />
        </button>
        <div class="hero__dots">
          <span 
            v-for="(_, index) in slides" 
            :key="index"
            :class="['dot', { active: currentIndex === index }]"
            @click="currentIndex = index"
          ></span>
        </div>
        <button @click="nextSlide" class="control-btn" aria-label="Next Slide">
          <ChevronRight :size="28" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  height: 100vh;
  position: relative;
  overflow: hidden;
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
    linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.95) 100%),
    linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.75) 100%);
  z-index: 1;
}

.noise-bg {
  position: absolute;
  inset: 0;
  background: url('https://grainy-gradients.vercel.app/noise.svg');
  opacity: 0.1;
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

/* SLIDER */
.hero__slider {
  height: 100%;
  position: relative;
  z-index: 10;
}

.hero__slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero__content {
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 5%;
}

.hero__text-box {
  max-width: 850px;
}

.hero__tagline {
  display: inline-block;
  font-family: var(--font-main);
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.hero__title {
  font-size: clamp(3rem, 7.5vw, 6.2rem);
  font-weight: 900;
  line-height: 0.92;
  margin-bottom: 1.8rem;
  letter-spacing: -2px;
  color: #ffffff;
  text-transform: uppercase;
}

.hero__description {
  font-family: var(--font-main);
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--text-secondary);
  margin-bottom: 2.8rem;
  max-width: 550px;
  line-height: 1.6;
}

.hero__actions {
  display: flex;
  gap: 1.5rem;
}

/* BUTTONS */
.btn {
  font-family: var(--font-accent);
  padding: 1.1rem 2.8rem;
  border-radius: 4px;
  font-weight: 950;
  font-size: 0.85rem;
  transition: var(--transition-smooth);
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  outline: none;
}

.btn--primary {
  background: var(--primary-color);
  color: #000;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 10px 25px rgba(255, 94, 0, 0.25);
}

.btn--primary:hover {
  background: #ffffff;
  color: #000;
  transform: translateY(-4px) skew(-3deg);
  box-shadow: 0 15px 35px rgba(255, 94, 0, 0.4);
}

.arrow-icon {
  transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.btn--primary:hover .arrow-icon {
  transform: translate(3px, -3px);
}

.btn--outline {
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  background: transparent;
}

.btn--outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(255, 94, 0, 0.05);
}

/* Controls */
.hero__controls {
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2.5rem;
  z-index: 20;
}

.control-btn {
  color: rgba(255, 255, 255, 0.45);
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.control-btn:hover {
  color: var(--primary-color);
  transform: scale(1.15);
}

.hero__dots {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.dot {
  width: 35px;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.dot.active {
  background: var(--primary-color);
  width: 55px;
}

/* Transitions */
.slide-fade-enter-active {
  transition: opacity 0.8s ease, transform 1s cubic-bezier(0.19, 1, 0.22, 1);
}

.slide-fade-leave-active {
  transition: opacity 0.6s ease, transform 0.8s cubic-bezier(0.19, 1, 0.22, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

@media (max-width: 768px) {
  .hero__content {
    align-items: center;
    padding-left: 0;
  }

  .hero__text-box {
    text-align: center;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .hero__title {
    font-size: clamp(2.2rem, 8vw, 3.8rem);
    margin-bottom: 1.2rem;
  }
  
  .hero__description {
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .hero__actions {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }

  .btn {
    padding: 1rem;
    font-size: 0.8rem;
    width: 100%;
    justify-content: center;
  }

  .hero__controls {
    bottom: 2.5rem;
    gap: 1.5rem;
  }

  .dot {
    width: 20px;
  }

  .dot.active {
    width: 35px;
  }
}
</style>
