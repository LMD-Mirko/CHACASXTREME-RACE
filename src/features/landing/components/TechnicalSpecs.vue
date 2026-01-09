<script setup>
import { ref, computed } from 'vue';
import { useMouseInElement } from '@vueuse/core';
import { Mountain, Wind, Activity, Zap } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Data for the cards
const cardsData = computed(() => [
  {
    title: t('specs.cards[0].title'),
    value: '3,359',
    unit: t('specs.cards[0].unit'),
    icon: Mountain,
    desc: t('specs.cards[0].desc')
  },
  {
    title: t('specs.cards[1].title'),
    value: '42',
    unit: t('specs.cards[1].unit'),
    icon: Activity,
    desc: t('specs.cards[1].desc')
  },
  {
    title: t('specs.cards[2].title'),
    value: '12-18',
    unit: t('specs.cards[2].unit'),
    icon: Wind,
    desc: t('specs.cards[2].desc')
  },
  {
    title: t('specs.cards[3].title'),
    value: 'ELITE',
    unit: t('specs.cards[3].unit'),
    icon: Zap,
    desc: t('specs.cards[3].desc')
  }
]);

// Inner component for 3D effect
const TechnicalCard = {
  props: ['card'],
  setup(props) {
    const target = ref(null);
    const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(target);

    const cardStyle = computed(() => {
      if (isOutside.value) return {};
      
      const MAX_ROTATION = 15;
      const rX = (MAX_ROTATION / 2 - (elementY.value / elementHeight.value) * MAX_ROTATION).toFixed(2);
      const rY = ((elementX.value / elementWidth.value) * MAX_ROTATION - MAX_ROTATION / 2).toFixed(2);
      
      return {
        transform: `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(1.05, 1.05, 1.05)`
      };
    });

    return { target, cardStyle };
  }
};
</script>

<template>
  <section class="challenge" id="competencias">
    <div class="container">
      <div class="challenge__header">
        <h2 class="section-title">{{ t('specs.section_title') }}</h2>
        <h3 class="challenge__headline">{{ t('specs.headline') }}</h3>
        <p class="challenge__intro">
          {{ t('specs.intro') }}
        </p>
      </div>

      <div class="challenge__grid">
        <div 
          v-for="card in cardsData" 
          :key="card.title" 
          class="tech-card"
        >
          <div class="tech-card__wrapper">
             <div class="tech-card__inner">
                <div class="tech-card__glow"></div>
                <div class="tech-card__content">
                  <component :is="card.icon" :size="40" class="tech-card__icon" />
                  <h4 class="tech-card__title">{{ card.title }}</h4>
                  <div class="tech-card__stats">
                    <span class="value">{{ card.value }}</span>
                    <span class="unit">{{ card.unit }}</span>
                  </div>
                  <p class="tech-card__desc">{{ card.desc }}</p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Decoration -->
    <div class="challenge__bg-text">{{ t('specs.bg_text') }}</div>
  </section>
</template>

<style scoped>
.challenge {
  padding: 10rem 0;
  background: #020202;
  position: relative;
  overflow: hidden;
}

.challenge__header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 6rem;
}

.challenge__headline {
  font-family: var(--font-accent);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  color: white;
  margin-bottom: 1.5rem;
  letter-spacing: -2px;
}

.challenge__intro {
  color: var(--text-secondary);
  font-size: 1.15rem;
  line-height: 1.8;
}

.challenge__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  position: relative;
  z-index: 5;
}

.tech-card {
  height: 380px;
  perspective: 1000px;
}

.tech-card__wrapper {
  height: 100%;
  transition: transform 0.1s ease-out;
}

.tech-card__inner {
  position: relative;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 3rem 2rem;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tech-card:hover .tech-card__inner {
  transform: translateY(-10px) scale(1.02);
  border-color: var(--primary-color);
  background: rgba(255, 94, 0, 0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}

.tech-card__glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 0%, rgba(255, 94, 0, 0.15), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.tech-card:hover .tech-card__glow {
  opacity: 1;
}

.tech-card__icon {
  color: var(--primary-color);
  margin-bottom: 2rem;
  transition: transform 0.5s ease;
}

.tech-card:hover .tech-card__icon {
  transform: scale(1.2) rotate(-10deg);
}

.tech-card__title {
  font-family: var(--font-accent);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 2px;
  margin-bottom: 1rem;
}

.tech-card__stats {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tech-card__stats .value {
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  line-height: 1;
}

.tech-card__stats .unit {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.tech-card__desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.challenge__bg-text {
  position: absolute;
  bottom: -5%;
  right: -5%;
  font-size: 20vw;
  font-weight: 950;
  color: rgba(255, 255, 255, 0.02);
  pointer-events: none;
  z-index: 1;
  font-style: italic;
}

@media (max-width: 768px) {
  .challenge { padding: 6rem 0; }
  .tech-card { height: auto; }
  .tech-card__stats .value { font-size: 2.5rem; }
}
</style>
