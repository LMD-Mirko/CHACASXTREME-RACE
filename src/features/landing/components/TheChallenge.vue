<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Mountain, Activity, Wind, Zap } from 'lucide-vue-next';
import challengeImg from '@/assets/images/unnamed.webp';

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
const autoPlayInterval = ref(null);

const nextStat = () => {
  currentIndex.value = (currentIndex.value + 1) % stats.value.length;
};

const setStat = (index) => {
  currentIndex.value = index;
  // Reset timer on manual click
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value);
    autoPlayInterval.value = setInterval(nextStat, 6000);
  }
};

onMounted(() => {
  autoPlayInterval.value = setInterval(nextStat, 6000);
});

onUnmounted(() => {
  if (autoPlayInterval.value) clearInterval(autoPlayInterval.value);
});
</script>

<template>
  <section class="challenge">
    <div class="container">
      <div class="challenge__wrapper">
        <!-- Left: Image with sharp editorial design -->
        <div class="challenge__visual entry-anim entry-anim--left" style="--stagger: 0s">
          <div class="visual__frame">
            <img :src="challengeImg" alt="Competencia de ciclismo de montaña extrema Chacas Xtreme Race - Manka Riders" class="visual__img" loading="lazy" />
            <div class="visual__overlay"></div>
            <!-- Technical frame markings -->
            <div class="corner-mark top-left"></div>
            <div class="corner-mark top-right"></div>
            <div class="corner-mark bottom-left"></div>
            <div class="corner-mark bottom-right"></div>
          </div>
          <div class="visual__technical-tag font-inter">TELEMETRÍA RUTA // COORD-934X</div>
        </div>

        <!-- Right: Dynamic Content & HUD Telemetry -->
        <div class="challenge__content">
          <header class="content__header entry-anim entry-anim--right" style="--stagger: 0.1s">
            <div class="header__badge-row">
              <span class="header__badge font-inter">{{ t('challenge.badge') }}</span>
              <div class="badge-line"></div>
            </div>
            <h2 class="header__title font-podium">{{ t('challenge.title') }}</h2>
            <p class="header__text font-inter">
              {{ t('challenge.description') }}
            </p>
          </header>

          <!-- Telemetry HUD Stats Area -->
          <div class="content__stats-area entry-anim entry-anim--right" style="--stagger: 0.22s">
            <!-- HUD Grid Decoration -->
            <div class="hud-grid-overlay"></div>
            <div class="hud-crosshair"></div>
            <div class="hud-tag top-left font-inter">SYS.MONITOR // ACTIVE</div>
            <div class="hud-tag bottom-right font-inter">PAGE_0{{ currentIndex + 1 }}</div>

            <!-- Main Stat Slide -->
            <Transition name="stat-fade" mode="out-in">
              <div :key="currentIndex" class="stat-card">
                <div class="stat-card__icon-wrap">
                  <div class="icon-glow"></div>
                  <component :is="stats[currentIndex].icon" :size="28" class="stat-icon" />
                </div>
                
                <div class="stat-card__info">
                  <span class="stat-label font-inter">{{ stats[currentIndex].label }}</span>
                  <div class="stat-main">
                    <span class="stat-value font-podium">{{ stats[currentIndex].value }}</span>
                    <span class="stat-unit font-podium">{{ stats[currentIndex].unit }}</span>
                  </div>
                  <p class="stat-desc font-inter">{{ stats[currentIndex].desc }}</p>
                </div>
              </div>
            </Transition>

            <!-- Navigation indicators -->
            <div class="stats-nav">
              <button 
                v-for="(_, index) in stats" 
                :key="index"
                class="nav-dot"
                :class="{ 'is-active': currentIndex === index }"
                @click="setStat(index)"
                :aria-label="'Ver estadística ' + (index + 1)"
              >
                <span class="nav-dot-inner"></span>
                <span class="nav-dot-label font-podium">0{{ index + 1 }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.challenge {
  padding: var(--section-py) 0;
  background: var(--bg-color);
  position: relative;
}

.challenge__wrapper {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
  background: var(--surface-color);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: clamp(1.5rem, 4vw, 3rem);
  position: relative;
  overflow: hidden;
}

.challenge__wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 94, 0, 0.02) 0%, transparent 70%);
  pointer-events: none;
}

/* IMAGE SIDE */
.challenge__visual {
  position: relative;
}

.visual__frame {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 4/5;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.visual__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.2) contrast(1.1);
  transition: var(--transition-smooth);
}

.challenge__visual:hover .visual__img {
  filter: grayscale(0) contrast(1.05);
}

.visual__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 60%);
}

.visual__technical-tag {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 2px;
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

/* Corner markers for engineering style */
.corner-mark {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid var(--primary-color);
  z-index: 10;
  pointer-events: none;
}

.corner-mark.top-left { top: 15px; left: 15px; border-right: none; border-bottom: none; }
.corner-mark.top-right { top: 15px; right: 15px; border-left: none; border-bottom: none; }
.corner-mark.bottom-left { bottom: 15px; left: 15px; border-right: none; border-top: none; }
.corner-mark.bottom-right { bottom: 15px; right: 15px; border-left: none; border-top: none; }

/* CONTENT SIDE */
.content__header {
  margin-bottom: 2rem;
}

.header__badge-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.header__badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: 3px;
  text-transform: uppercase;
}

.badge-line {
  flex-grow: 1;
  height: 1px;
  background: rgba(255, 94, 0, 0.2);
}

.header__title {
  font-size: clamp(1.75rem, 4.5vw, 3.5rem);
  font-weight: 900;
  color: white;
  line-height: 0.95;
  margin-bottom: 1.5rem;
  letter-spacing: -2px;
}

.header__text {
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.7;
  max-width: 520px;
}

/* TELEMETRY HUD AREA */
.content__stats-area {
  position: relative;
  padding: 2rem;
  background: rgba(10, 10, 10, 0.5);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 200px;
  overflow: hidden;
}

.hud-grid-overlay {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.hud-crosshair {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 15px;
  height: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  pointer-events: none;
}

.hud-tag {
  position: absolute;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.25);
  pointer-events: none;
}

.hud-tag.top-left {
  top: 12px;
  left: 15px;
}

.hud-tag.bottom-right {
  bottom: 12px;
  right: 15px;
}

.stat-card {
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;
  position: relative;
  z-index: 5;
}

.stat-card__icon-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  background: rgba(255, 94, 0, 0.08);
  border: 1px solid rgba(255, 94, 0, 0.3);
  color: var(--primary-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-glow {
  position: absolute;
  inset: 0;
  background: var(--primary-color);
  opacity: 0.15;
  filter: blur(10px);
  pointer-events: none;
}

.stat-card__info {
  flex-grow: 1;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.stat-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.stat-value {
  font-size: clamp(2.2rem, 6vw, 4.5rem);
  font-weight: 900;
  color: white;
  line-height: 0.95;
  letter-spacing: -2px;
}

.stat-unit {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: 1px;
}

.stat-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 440px;
}

/* NAV INDICATORS (HUD COMPASS-LIKE DOTS) */
.stats-nav {
  display: flex;
  gap: 1.5rem;
  margin-top: 2.5rem;
  position: relative;
  z-index: 5;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1.5rem;
}

.nav-dot {
  background: transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  opacity: 0.4;
  transition: var(--transition-smooth);
}

.nav-dot-inner {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  transition: var(--transition-smooth);
}

.nav-dot-label {
  font-size: 0.8rem;
  font-weight: 900;
  color: white;
  line-height: 1;
}

.nav-dot.is-active {
  opacity: 1;
}

.nav-dot.is-active .nav-dot-inner {
  background: var(--primary-color);
  box-shadow: 0 0 10px var(--primary-color);
  transform: scale(1.5);
}

/* ANIMATIONS */
.stat-fade-enter-active, .stat-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-fade-enter-from { opacity: 0; transform: translateY(15px); }
.stat-fade-leave-to { opacity: 0; transform: translateY(-15px); }

@media (max-width: 992px) {
  .challenge__wrapper {
    grid-template-columns: 1fr;
    gap: clamp(2rem, 5vw, 3rem);
  }

  .visual__frame {
    aspect-ratio: 16/9;
    max-height: 320px;
  }

  .content__header {
    text-align: center;
  }

  .header__badge-row {
    justify-content: center;
  }

  .header__text {
    max-width: 100%;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .content__stats-area {
    padding: 1.5rem 1.25rem;
    min-height: auto;
  }

  .stat-card {
    flex-direction: column;
    gap: 1.25rem;
    align-items: flex-start;
  }

  .stat-card__icon-wrap {
    width: 52px;
    height: 52px;
  }

  .stat-desc {
    max-width: 100%;
    font-size: 0.88rem;
  }

  .stats-nav {
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1.75rem;
    padding-top: 1.25rem;
  }

  .visual__technical-tag {
    justify-content: center;
    font-size: 0.58rem;
  }
}

@media (max-width: 480px) {
  .header__text {
    font-size: 0.92rem;
  }

  .stat-unit {
    font-size: 0.95rem;
  }

  .hud-tag {
    display: none;
  }
}
</style>

