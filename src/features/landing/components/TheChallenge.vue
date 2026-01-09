<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Mountain, Activity, Wind, Zap, ChevronRight } from 'lucide-vue-next';
import challengeImg from '@/assets/images/unnamed.jpg';

const { t } = useI18n();

const stats = computed(() => [
  {
    label: t('challenge.stats[0].label'),
    value: '3,359',
    unit: t('challenge.stats[0].unit'),
    icon: Mountain,
    desc: t('challenge.stats[0].desc')
  },
  {
    label: t('challenge.stats[1].label'),
    value: '42',
    unit: t('challenge.stats[1].unit'),
    icon: Activity,
    desc: t('challenge.stats[1].desc')
  },
  {
    label: t('challenge.stats[2].label'),
    value: '12-18',
    unit: t('challenge.stats[2].unit'),
    icon: Wind,
    desc: t('challenge.stats[2].desc')
  },
  {
    label: t('challenge.stats[3].label'),
    value: 'ELITE',
    unit: t('challenge.stats[3].unit'),
    icon: Zap,
    desc: t('challenge.stats[3].desc')
  }
]);

const currentIndex = ref(0);
const isTransitioning = ref(false);
const autoPlayInterval = ref(null);

const nextStat = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % stats.value.length;
    setTimeout(() => {
      isTransitioning.value = false;
    }, 400);
  }, 400);
};

onMounted(() => {
  autoPlayInterval.value = setInterval(nextStat, 5000);
});

onUnmounted(() => {
  if (autoPlayInterval.value) clearInterval(autoPlayInterval.value);
});
</script>

<template>
  <section class="challenge reveal">
    <div class="container">
      <div class="challenge__wrapper">
        <!-- Left: Image with rounded design -->
        <div class="challenge__visual">
          <div class="visual__frame">
            <img :src="challengeImg" alt="Chacas Xtreme Challenge" class="visual__img" />
            <div class="visual__overlay"></div>
          </div>
          <!-- Decorative elements -->
          <div class="visual__dot-grid"></div>
        </div>

        <!-- Right: Dynamic Content -->
        <div class="challenge__content">
          <header class="content__header">
            <span class="header__badge">{{ t('challenge.badge') }}</span>
            <h2 class="header__title">{{ t('challenge.title') }}</h2>
            <p class="header__text">
              {{ t('challenge.description') }}
            </p>
          </header>

          <div class="content__stats-area">
            <!-- Mosaic Transition Overlay -->
            <div v-if="isTransitioning" class="mosaic-transition">
              <div v-for="i in 16" :key="i" class="mosaic-square"></div>
            </div>

            <Transition name="stat-fade" mode="out-in">
              <div :key="currentIndex" class="stat-card">
                <div class="stat-card__icon">
                  <component :is="stats[currentIndex].icon" :size="32" />
                </div>
                <div class="stat-card__info">
                  <span class="stat-label">{{ stats[currentIndex].label }}</span>
                  <div class="stat-main">
                    <span class="stat-value">{{ stats[currentIndex].value }}</span>
                    <span class="stat-unit">{{ stats[currentIndex].unit }}</span>
                  </div>
                  <p class="stat-desc">{{ stats[currentIndex].desc }}</p>
                </div>
              </div>
            </Transition>

            <!-- Navigation dots -->
            <div class="stats-nav">
              <button 
                v-for="(_, index) in stats" 
                :key="index"
                class="nav-dot"
                :class="{ 'is-active': currentIndex === index }"
                @click="currentIndex = index"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.challenge {
  padding: 10rem 0;
  background: var(--bg-color);
  position: relative;
}

.challenge__wrapper {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 6rem;
  align-items: center;
  background: var(--surface-color);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  border-radius: 40px;
  padding: 4rem;
  position: relative;
  overflow: hidden;
}

/* IMAGE SIDE */
.challenge__visual {
  position: relative;
}

.visual__frame {
  position: relative;
  border-radius: 30px;
  overflow: hidden;
  aspect-ratio: 4/5;
  box-shadow: 0 40px 80px rgba(0,0,0,0.6);
  border: 1px solid rgba(255, 94, 0, 0.2);
}

.visual__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.visual__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.visual__dot-grid {
  position: absolute;
  top: -30px;
  left: -30px;
  width: 150px;
  height: 150px;
  background-image: radial-gradient(var(--primary-color) 1px, transparent 1px);
  background-size: 15px 15px;
  opacity: 0.2;
  z-index: -1;
}

/* CONTENT SIDE */
.content__header {
  margin-bottom: 3rem;
}

.header__badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 94, 0, 0.1);
  color: var(--primary-color);
  border-radius: 100px;
  font-family: var(--font-accent);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
}

.header__title {
  font-family: var(--font-accent);
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  line-height: 1;
  margin-bottom: 1.5rem;
  letter-spacing: -2px;
}

.header__text {
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.7;
}

/* STATS AREA WITH MOSAIC EFFECT */
.content__stats-area {
  position: relative;
  padding: 3rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 250px;
}

.mosaic-transition {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  z-index: 10;
  pointer-events: none;
}

.mosaic-square {
  background: var(--primary-color);
  opacity: 0;
  animation: square-flash 0.8s ease-in-out forwards;
}

@keyframes square-flash {
  0% { opacity: 0; transform: scale(0); }
  40% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0); }
}

/* Transition delays for mosaic squares */
.mosaic-square:nth-child(2) { animation-delay: 0.05s; }
.mosaic-square:nth-child(3) { animation-delay: 0.1s; }
.mosaic-square:nth-child(4) { animation-delay: 0.15s; }
.mosaic-square:nth-child(5) { animation-delay: 0.05s; }
.mosaic-square:nth-child(9) { animation-delay: 0.1s; }
.mosaic-square:nth-child(6) { animation-delay: 0.1s; }
.mosaic-square:nth-child(13) { animation-delay: 0.15s; }

.stat-card {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.stat-card__icon {
  width: 70px;
  height: 70px;
  background: var(--primary-color);
  color: black;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 20px rgba(255, 94, 0, 0.3);
}

.stat-label {
  display: block;
  font-family: var(--font-accent);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.stat-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 4rem;
  font-weight: 950;
  color: white;
  line-height: 1;
}

.stat-unit {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-desc {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.stats-nav {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
}

.nav-dot {
  width: 30px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  transition: var(--transition-smooth);
}

.nav-dot.is-active {
  background: var(--primary-color);
  width: 50px;
}

/* ANIMATIONS */
.stat-fade-enter-active, .stat-fade-leave-active {
  transition: all 0.4s ease;
}
.stat-fade-enter-from { opacity: 0; transform: translateX(20px); }
.stat-fade-leave-to { opacity: 0; transform: translateX(-20px); }

@media (max-width: 1024px) {
  .challenge { padding: 6rem 0; }
  .challenge__wrapper { grid-template-columns: 1fr; gap: 3rem; padding: 2.5rem; border-radius: 30px; }
  .visual__frame { aspect-ratio: 16/9; }
}

@media (max-width: 768px) {
  .challenge { padding: 4rem 0; }
  .challenge__wrapper { padding: 2rem 1.5rem; }
  .header__title { font-size: 2.5rem; letter-spacing: -1px; }
  .content__stats-area { padding: 1.5rem; min-height: auto; }
  .stat-card { gap: 1rem; }
  .stat-card__icon { width: 50px; height: 50px; border-radius: 12px; }
  .stat-card__icon :deep(svg) { width: 24px; height: 24px; }
  .stat-value { font-size: 2.6rem; }
  .stat-desc { font-size: 0.9rem; }
}
</style>
