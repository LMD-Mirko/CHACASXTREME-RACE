<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  History, 
  Trophy, 
  Route
} from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import routeMapImg from '@/assets/images/mapa.webp';
import chacas1 from '@/assets/images/chacas /1.webp';
import chacas2 from '@/assets/images/chacas /2.webp';
import chacas3 from '@/assets/images/chacas /3.webp';

const { t } = useI18n();

const events = computed(() => [
  {
    edition: t('events.data[0].edition'),
    date: t('events.data[0].date'),
    tag: t('events.data[0].tag'),
    desc: t('events.data[0].desc'),
    image: chacas1
  },
  {
    edition: t('events.data[1].edition'),
    date: t('events.data[1].date'),
    tag: t('events.data[1].tag'),
    desc: t('events.data[1].desc'),
    image: chacas2
  },
  {
    edition: t('events.data[2].edition'),
    date: t('events.data[2].date'),
    tag: t('events.data[2].tag'),
    desc: t('events.data[2].desc'),
    image: chacas3
  }
]);

const activeIndex = ref(0);

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
</script>

<template>
  <div class="events-page">
    <!-- Decorative Editorial Grid Lines -->
    <div class="editorial-grid">
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
    </div>

    <!-- 1. HERO SECTION -->
    <section class="events-hero">
      <div class="hero-bg">
        <div class="overlay"></div>
        <img src="@/assets/images/chacas /4.webp" alt="Ediciones anteriores de la competencia de ciclismo de montaña Chacas Xtreme Race" class="parallax-img" />
      </div>
      
      <!-- Large Watermark Text -->
      <div class="hero-watermark font-podium">EDICIONES</div>

      <div class="container relative z-10 hero-inner">
        <div class="badge-red reveal">{{ t('events.badge') }}</div>
        <h1 class="events-title reveal">{{ t('events.title') }}</h1>
        <p class="events-subtitle reveal">{{ t('events.subtitle') }}</p>
      </div>
    </section>

    <!-- 2. INTERACTIVE ARCHIVE TIMELINE -->
    <section class="archive-section container">
      <div class="section-header reveal">
        <h2 class="title-tech">
          {{ t('events.archive_title_prefix') }} 
          <span class="primary-text">{{ t('events.archive_title_highlight') }}</span>
        </h2>
      </div>

      <div class="archive-grid">
        <!-- Sidebar Timeline Menu -->
        <div class="archive-timeline">
          <div 
            v-for="(event, index) in events" 
            :key="index" 
            class="timeline-item" 
            :class="{ 'timeline-item--active': activeIndex === index }"
            @click="activeIndex = index"
          >
            <span class="timeline-num font-podium">0{{ index + 1 }}</span>
            <div class="menu-label">
              <span class="m-edition">{{ event.edition }}</span>
              <span class="m-date">{{ event.date }}</span>
            </div>
            <div class="active-indicator-line"></div>
          </div>
        </div>

        <!-- Dynamic Content Viewer (Cinematic Screen) -->
        <div class="archive-viewer">
          <Transition name="viewport" mode="out-in">
            <div :key="activeIndex" class="viewer-portal">
              <!-- Content details on the left for split editorial design -->
              <div class="portal-content">
                <div class="content-top">
                  <History class="icon-accent" :size="18" />
                  <div class="relato-tag">{{ t('events.portal.story_tag') }}</div>
                </div>
                
                <h3 class="portal-title font-podium">{{ events[activeIndex].edition }}</h3>
                <div class="portal-tag">{{ events[activeIndex].tag }}</div>
                
                <p class="portal-desc">{{ events[activeIndex].desc }}</p>
                
                <div class="portal-stats">
                  <div class="p-stat">
                    <Trophy :size="16" class="stat-icon" />
                    <div class="p-stat-info">
                      <span class="p-stat-label">{{ t('events.portal.difficulty_label') }}</span>
                      <span class="p-stat-val">{{ t('events.portal.difficulty_val') }}</span>
                    </div>
                  </div>
                  <div class="p-stat">
                    <Route :size="16" class="stat-icon" />
                    <div class="p-stat-info">
                      <span class="p-stat-label">{{ t('events.portal.route_label') }}</span>
                      <span class="p-stat-val">{{ t('events.portal.route_val') }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- High-end curved image preview on the right -->
              <div class="portal-image-frame">
                <img :src="events[activeIndex].image" :alt="events[activeIndex].edition + ' - Competencia de Ciclismo de Montaña Chacas Xtreme'" class="p-img" />
                <div class="p-overlay"></div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- 3. RUTA & DETALLES TÉCNICOS (FULL WIDTH HUD MAP) -->
    <section class="route-massive container">
      <div class="section-heading reveal">
        <h2 class="title-tech">
          {{ t('events.route.title_prefix') }} 
          <span class="primary-text">{{ t('events.route.title_highlight') }}</span>
        </h2>
      </div>

      <div class="route-hero-massive reveal">
        <div class="massive-visual-wrap">
          <!-- Corner brackets and HUD overlays -->
        
          <div class="map-corner-bracket top-left"></div>
          <div class="map-corner-bracket top-right"></div>
          <div class="map-corner-bracket bottom-left"></div>
          <div class="map-corner-bracket bottom-right"></div>
          <div class="map-scanlines"></div>

          <img :src="routeMapImg" alt="Mapa técnico de la ruta de ciclismo Chacas Xtreme Race - Altimetría y Puntos Clave" class="massive-img" />
          <div class="massive-overlay">
            <!-- Blinking Tactical Points Plaza Ugo Censi -->
            <div class="tactical-point p-start">
              <span class="blink-dot"></span>
              <span>{{ t('events.route.start') }}</span>
            </div>
            <div class="tactical-point p-finish">
              <span class="blink-dot"></span>
              <span>{{ t('events.route.finish') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.events-page {
  background: #020202;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 8rem;
  overflow-x: hidden;
  position: relative;
}

/* Editorial Grid Background Lines */
.editorial-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  pointer-events: none;
  z-index: 0;
}
.grid-col-line {
  border-right: 1px solid rgba(255, 255, 255, 0.02);
  height: 100%;
}

/* REVEAL SYSTEM */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

/* 1. HERO SECTION */
.events-hero {
  position: relative;
  height: 65vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.parallax-img {
  width: 100%;
  height: 120%;
  object-fit: cover;
  opacity: 0.35;
  filter: saturate(0.85) contrast(1.1);
  animation: parallaxHero linear both;
  animation-timeline: scroll();
  will-change: transform;
}

@keyframes parallaxHero {
  from { transform: translateY(0); }
  to { transform: translateY(12%); }
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #020202 5%, rgba(2, 2, 2, 0.2) 60%, rgba(2, 2, 2, 0.7) 100%);
  z-index: 2;
}

.hero-watermark {
  position: absolute;
  bottom: 0;
  left: 5%;
  font-size: clamp(6rem, 18vw, 16rem);
  font-weight: 950;
  line-height: 0.8;
  color: rgba(255, 255, 255, 0.02);
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.015);
  pointer-events: none;
  z-index: 2;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.2rem;
}

.badge-red {
  display: inline-block;
  padding: 0.4rem 1.2rem;
  background: rgba(255, 94, 0, 0.06);
  border: 1px solid rgba(255, 94, 0, 0.3);
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 3px;
  border-radius: 100px;
  text-transform: uppercase;
}

.events-title {
  font-family: var(--font-podium);
  font-size: clamp(3.5rem, 9vw, 7.5rem);
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 0.95;
  margin: 0;
  background: linear-gradient(to bottom, #ffffff 50%, rgba(255, 255, 255, 0.3) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-transform: uppercase;
}

.events-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 600px;
  margin: 0;
  line-height: 1.6;
}

/* 2. ARCHIVE SECTION (TIMELINE + VIEWER) */
.archive-section {
  padding: 8rem 2rem;
  position: relative;
  z-index: 10;
}

.title-tech {
  font-family: var(--font-podium);
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: -1px;
  text-transform: uppercase;
  margin: 0;
  color: #fff;
}

.archive-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 4rem;
  margin-top: 5rem;
  align-items: flex-start;
}

/* Archive Timeline Menu */
.archive-timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  padding: 1rem 0;
  opacity: 0.35;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.timeline-num {
  font-size: 1.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  line-height: 1;
}

.menu-label {
  display: flex;
  flex-direction: column;
}

.m-edition {
  font-family: var(--font-accent);
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  transition: color 0.4s ease;
}

.m-date {
  font-size: 0.7rem;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 0.3rem;
}

.active-indicator-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0%;
  height: 1px;
  background: var(--primary-color);
  transition: width 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.timeline-item:hover {
  opacity: 0.7;
}

.timeline-item--active {
  opacity: 1;
}

.timeline-item--active .timeline-num {
  color: var(--primary-color);
  transform: scale(1.1);
}

.timeline-item--active .active-indicator-line {
  width: 100%;
}

/* Archive Viewer Split Editorial Layout */
.archive-viewer {
  position: relative;
  width: 100%;
}

.viewer-portal {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: rgba(10, 10, 10, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  overflow: hidden;
  width: 100%;
  backdrop-filter: blur(15px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
}

/* Left side content */
.portal-content {
  padding: 4.5rem 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.content-top {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.8rem;
}

.icon-accent {
  color: var(--primary-color);
}

.relato-tag {
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.portal-title {
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 900;
  margin: 0;
  line-height: 1;
  text-transform: uppercase;
  color: #ffffff;
}

.portal-tag {
  color: var(--secondary-color);
  font-family: var(--font-accent);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 0.6rem;
  margin-bottom: 2rem;
}

.portal-desc {
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 3rem 0;
  font-weight: 400;
}

.portal-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.p-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  color: var(--primary-color);
  opacity: 0.85;
}

.p-stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.p-stat-label {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 700;
}

.p-stat-val {
  font-family: var(--font-podium);
  font-weight: 900;
  font-size: 1rem;
  color: #ffffff;
  text-transform: uppercase;
}

/* Right side Image frame */
.portal-image-frame {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 520px;
  overflow: hidden;
  background: #000;
}

.p-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.portal-image-frame:hover .p-img {
  transform: scale(1.05);
}

.p-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to left, transparent 40%, rgba(2, 2, 2, 0.3) 100%);
  pointer-events: none;
}

/* Transitions */
.viewport-enter-active, .viewport-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}
.viewport-enter-from { opacity: 0; transform: translateY(15px); }
.viewport-leave-to { opacity: 0; transform: translateY(-15px); }

/* 3. RUTA MASSIVE HUD */
.route-massive {
  padding: 6rem 2rem 10rem;
  position: relative;
  z-index: 10;
}

.route-hero-massive {
  margin-top: 4rem;
}

.route-split-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 3rem;
  align-items: stretch;
}

/* Glassmorphic Telemetry Details Panel */
.map-telemetry-box {
  background: rgba(10, 10, 10, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 3rem 2.2rem;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  gap: 2.5rem;
}

.route-massive {
  padding: 6rem 2rem 10rem;
}

.route-hero-massive {
  margin-top: 3rem;
}

.massive-visual-wrap {
  position: relative;
  width: 100%;
  background: #050505;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.massive-img {
  width: 100%;
  height: auto;
  display: block;
  filter: saturate(1.05) contrast(1.1) brightness(0.9);
}

.map-hud-overlay {
  position: absolute;
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--font-accent);
  z-index: 5;
  background: rgba(2, 2, 2, 0.7);
  padding: 4px 8px;
  border-radius: 2px;
  pointer-events: none;
}
.map-hud-overlay.top-left { top: 1.25rem; left: 1.25rem; }
.map-hud-overlay.top-right { top: 1.25rem; right: 1.25rem; }
.map-hud-overlay.bottom-left { bottom: 1.25rem; left: 1.25rem; }
.map-hud-overlay.bottom-right { bottom: 1.25rem; right: 1.25rem; }

.map-scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.12) 50%
  );
  background-size: 100% 4px;
  z-index: 2;
  pointer-events: none;
  opacity: 0.3;
}

.map-corner-bracket {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 4;
  pointer-events: none;
}
.map-corner-bracket.top-left { top: 8px; left: 8px; border-right: none; border-bottom: none; }
.map-corner-bracket.top-right { top: 8px; right: 8px; border-left: none; border-bottom: none; }
.map-corner-bracket.bottom-left { bottom: 8px; left: 8px; border-right: none; border-top: none; }
.map-corner-bracket.bottom-right { bottom: 8px; right: 8px; border-left: none; border-top: none; }

.massive-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(2, 2, 2, 0.4) 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 4rem;
  z-index: 3;
  pointer-events: none;
}

.tactical-point {
  position: absolute;
  z-index: 6;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: #000;
  font-family: var(--font-accent);
  font-weight: 950;
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(255, 94, 0, 0.3);
}

.tactical-point::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.blink-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #000;
  animation: mapPulse 1s infinite alternate;
}

@keyframes mapPulse {
  from { opacity: 0.2; }
  to { opacity: 1; }
}

.p-start { top: 45%; right: 8%; }
.p-start::after { bottom: -4px; }

.p-finish { top: 55%; left: 11.5%; }
.p-finish::after { bottom: -4px; }


/* RESPONSIVE SYSTEM */

/* --- Tablet / Large Mobile (1024px) --- */
@media (max-width: 1024px) {
  .events-hero { min-height: 50vh; }
  .events-title { font-size: 5rem; }
  
  .archive-section, .route-massive { padding: 5rem 2rem; }
  .archive-grid { grid-template-columns: 1fr; gap: 3rem; margin-top: 4rem; }
  
  .archive-timeline { 
    flex-direction: row; 
    overflow-x: auto; 
    padding: 1rem 0.5rem;
    gap: 2rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    margin-bottom: 1rem;
  }
  .archive-timeline::-webkit-scrollbar { display: none; }
  
  .timeline-item { 
    flex-shrink: 0; 
    padding: 0.8rem 1rem; 
    scroll-snap-align: start;
    gap: 0.8rem;
  }
  
  .viewer-portal { grid-template-columns: 1fr; }
  .portal-image-frame { min-height: 380px; order: -1; }
  .portal-content { padding: 3.5rem 2.5rem; }
  .p-overlay { background: linear-gradient(to top, rgba(2, 2, 2, 0.4) 0%, transparent 100%); }
  
  .route-hero-massive { margin-top: 2rem; }
  .p-start { right: 5%; font-size: 0.55rem; }
  .p-finish { left: 5%; font-size: 0.55rem; }
}

/* --- Standard Mobile (768px) --- */
@media (max-width: 768px) {
  .archive-section, .route-massive { padding: 4rem 1.5rem; }
  
  .events-title { font-size: 3.5rem; }
  .events-subtitle { font-size: 1rem; }
  .hero-watermark { font-size: 6rem; left: 2%; }
  
  .title-tech { font-size: 2.2rem; }
  .portal-image-frame { min-height: 280px; }
  .portal-desc { font-size: 1rem; margin-bottom: 2.5rem; }
  
  .portal-stats { gap: 1.5rem; grid-template-columns: 1fr; }
  .p-stat { border-left: none; }
  
  .massive-overlay { padding: 2rem; }
}

/* --- Small Mobile (480px) --- */
@media (max-width: 480px) {
  .archive-section, .route-massive { padding: 3rem 1rem; }
  
  .events-hero { height: auto; padding-top: 120px; padding-bottom: 60px; }
  .events-title { font-size: 2.8rem; }
  .badge-red { font-size: 0.6rem; letter-spacing: 2px; }
  
  .archive-timeline { gap: 1rem; }
  .timeline-item { padding: 0.6rem 0.8rem; }
  .timeline-num { font-size: 1.3rem; }
  .m-edition { font-size: 0.9rem; }
  
  .portal-content { padding: 2.5rem 1.5rem; }
  .portal-title { font-size: 1.8rem; }
  
  .map-hud-overlay { font-size: 0.55rem; padding: 2px 4px; }
  .tactical-point { padding: 0.35rem 0.65rem; font-size: 0.55rem; }
}
</style>
