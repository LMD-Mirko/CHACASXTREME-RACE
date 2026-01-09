<script setup>
import { onMounted, ref, computed } from 'vue'; // Added computed
import { 
  History, 
  MapPin, 
  Trophy, 
  Calendar,
  Instagram,
  Route,
  ChevronRight,
  ArrowRight
} from 'lucide-vue-next';
import { useI18n } from 'vue-i18n'; // Create useI18n
import joseImg from '@/assets/images/jose.png';
import luigiImg from '@/assets/images/luigi.png';
import routeMapImg from '@/assets/images/mapa.png';
import chacas1 from '@/assets/images/chacas /1.jpg';
import chacas2 from '@/assets/images/chacas /2.jpg';
import chacas3 from '@/assets/images/chacas /3.jpg';

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

const participants = computed(() => [
  {
    name: t('events.participants[0].name'),
    alias: t('events.participants[0].alias'),
    image: joseImg,
    ig: '@jose.ignacio'
  },
  {
    name: t('events.participants[1].name'),
    alias: t('events.participants[1].alias'),
    image: luigiImg,
    ig: '@luigi.travi'
  }
]);

const activeIndex = ref(0);
const flippedCards = ref([]);
const cardRotations = ref(participants.value.map(() => ({ x: 0, y: 0 })));

const toggleFlip = (index) => {
  if (flippedCards.value.includes(index)) {
    flippedCards.value = flippedCards.value.filter(i => i !== index);
  } else {
    flippedCards.value.push(index);
  }
};

const handleMouseMove = (e, index) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  // Max movement of 15 degrees
  const rotateX = ((y - centerY) / centerY) * -15;
  const rotateY = ((x - centerX) / centerX) * 15;
  
  cardRotations.value[index] = { x: rotateX, y: rotateY };
};

const handleMouseLeave = (index) => {
  cardRotations.value[index] = { x: 0, y: 0 };
};

// Particle System State
const initParticles = (canvas) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = canvas.offsetWidth;
  let h = canvas.height = canvas.offsetHeight;
  
  const particleCount = 45; // Slightly more for wider cards
  const localParticles = [];
  
  for (let i = 0; i < particleCount; i++) {
    localParticles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      opacity: Math.random() * 0.5 + 0.1
    });
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ff5e00';
    
    localParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
};

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
    <!-- 1. HERO SECTION -->
    <section class="events-hero">
      <div class="hero-bg">
        <div class="overlay"></div>
        <img src="@/assets/images/chacas /4.jpg" alt="Events Background" class="parallax-img" />
      </div>
      <div class="container relative z-10">
        <div class="badge-red reveal">{{ t('events.badge') }}</div>
        <h1 class="events-title reveal">{{ t('events.title') }}</h1>
        <p class="events-subtitle reveal">{{ t('events.subtitle') }}</p>
      </div>
    </section>

    <!-- 2. INTERACTIVE ARCHIVE (The "Menu" Layout) -->
    <section class="archive-section container">
      <div class="section-header reveal">
        <h2 class="title-tech">{{ t('events.archive_title_prefix') }} <span class="primary-text">{{ t('events.archive_title_highlight') }}</span></h2>
      </div>

      <div class="archive-grid">
        <!-- Sidebar Menu -->
        <div class="archive-menu">
           <div v-for="(event, index) in events" :key="index" 
                class="menu-item" 
                :class="{ 'menu-item--active': activeIndex === index }"
                @click="activeIndex = index"
           >
              <div class="menu-num">0{{ events.length - index }}</div>
              <div class="menu-label">
                 <span class="m-edition">{{ event.edition }}</span>
                 <span class="m-date">{{ event.date }}</span>
              </div>
              <div class="menu-hover-glow"></div>
           </div>
        </div>

        <!-- Dynamic Content Viewer -->
        <div class="archive-viewer">
           <Transition name="viewport" mode="out-in">
              <div :key="activeIndex" class="viewer-portal">
                 <div class="portal-image">
                    <img :src="events[activeIndex].image" :alt="events[activeIndex].edition" class="p-img" />
                    <div class="p-badge">{{ events[activeIndex].tag }}</div>
                    <div class="p-overlay"></div>
                 </div>
                 
                 <div class="portal-content glass-premium">
                    <div class="content-top">
                       <History class="icon-accent" :size="32" />
                       <div class="relato-tag">{{ t('events.portal.story_tag') }}</div>
                    </div>
                    
                    <h3 class="portal-title">{{ events[activeIndex].edition }}</h3>
                    <p class="portal-desc">{{ events[activeIndex].desc }}</p>
                    
                    <div class="portal-stats">
                       <div class="p-stat">
                          <Trophy :size="20" />
                          <div class="p-stat-info">
                             <span class="p-stat-val">{{ t('events.portal.difficulty_val') }}</span>
                             <span class="p-stat-label">{{ t('events.portal.difficulty_label') }}</span>
                          </div>
                       </div>
                       <div class="p-stat">
                          <Route :size="20" />
                          <div class="p-stat-info">
                             <span class="p-stat-val">{{ t('events.portal.route_val') }}</span>
                             <span class="p-stat-label">{{ t('events.portal.route_label') }}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </Transition>
        </div>
      </div>
    </section>

    <!-- 3. RUTA & DETALLES TÉCNICOS (FULL WIDTH) -->
    <section class="route-massive container">
      <div class="section-heading reveal">
        <h2 class="title-tech">{{ t('events.route.title_prefix') }} <span class="primary-text">{{ t('events.route.title_highlight') }}</span></h2>
      </div>

      <div class="route-hero-massive reveal">
        <div class="massive-visual-wrap">
          <img :src="routeMapImg" alt="Detalle de Carrera" class="massive-img" />
          <div class="massive-overlay">
            <!-- Puntos Tácticos Plaza Ugo Censi -->
            <div class="tactical-point p-start"><span>{{ t('events.route.start') }}</span></div>
            <div class="tactical-point p-finish"><span>{{ t('events.route.finish') }}</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. HALL OF FAME (Participants) -->
    <section class="hall-of-fame container">
       <div class="section-heading reveal">
          <div class="badge-red">{{ t('events.hall.badge') }}</div>
          <h2 class="title-tech">{{ t('events.hall.title_prefix') }} <span class="primary-text">{{ t('events.hall.title_highlight') }}</span></h2>
       </div>

       <div class="participants-grid">
         <div v-for="(rider, index) in participants" 
              :key="index" 
              class="legend-container reveal" 
              :style="`--delay: ${index * 0.2}s`"
              @click="toggleFlip(index)"
              @mousemove="e => handleMouseMove(e, index)"
              @mouseleave="handleMouseLeave(index)"
         >
            <div class="legend-card-3d" 
                 :class="{ 'is-flipped': flippedCards.includes(index) }"
                 :style="{ 
                    transform: `rotateX(${cardRotations[index].x}deg) rotateY(${cardRotations[index].y + (flippedCards.includes(index) ? 180 : 0)}deg)` 
                 }"
            >
               <!-- Particle Canvas -->
               <canvas :ref="el => { if (el) initParticles(el) }" class="background-canvas"></canvas>

               <!-- FRONT: Brutal Elite -->
               <div class="card-face card-front">
                  <div class="brutal-border"></div>
                  <div class="visual-wrap">
                     <img :src="rider.image" :alt="rider.name" class="rider-img-pro" />
                     <div class="face-overlay">
                        <div class="technical-overlay">
                           <div class="scanner-line"></div>
                           <div class="corner-L top-left"></div>
                           <div class="corner-L bottom-right"></div>
                           <div class="rider-id-badge">ID-{{ index + 2024 }}</div>
                        </div>
                        <div class="pro-label">
                           <span class="pro-tag">{{ t('events.hall.card.tag') }}</span>
                           <h3 class="pro-name">{{ rider.name }}</h3>
                        </div>
                     </div>
                     <div class="glass-glint"></div>
                  </div>
               </div>

               <!-- BACK: Cyber Archival -->
               <div class="card-face card-back">
                  <div class="brutal-border active"></div>
                  <div class="info-wrap">
                     <div class="tech-header">
                        <Trophy :size="24" class="tech-icon" />
                        <span class="status-blink">{{ t('events.hall.card.level') }}</span>
                     </div>
                     
                     <div class="main-info">
                        <span class="info-alias">{{ rider.alias }}</span>
                        <h4 class="info-name">{{ rider.name }}</h4>
                     </div>

                     <div class="stats-technical">
                        <div class="t-stat">
                           <div class="t-label">{{ t('events.hall.card.power') }}</div>
                           <div class="t-bar"><div class="t-fill" style="width: 95%"></div></div>
                        </div>
                        <div class="t-stat">
                           <div class="t-label">{{ t('events.hall.card.agility') }}</div>
                           <div class="t-bar"><div class="t-fill" style="width: 88%"></div></div>
                        </div>
                     </div>

                     <a :href="'https://instagram.com/' + rider.ig.replace('@','')" 
                        target="_blank" 
                        class="ig-btn-pro"
                        @click.stop
                     >
                        <Instagram :size="18" />
                        <span>{{ t('events.hall.card.instagram') }}</span>
                        <ArrowRight :size="14" />
                     </a>
                  </div>
                  <div class="corner-L top-right"></div>
                  <div class="corner-L bottom-left"></div>
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
  padding-bottom: 10rem;
  overflow-x: hidden;
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
  height: 60vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
}

.parallax-img {
  width: 100%;
  height: 120%;
  object-fit: cover;
  opacity: 0.5;
  animation: parallaxHero linear both;
  animation-timeline: scroll();
}

@keyframes parallaxHero {
  from { transform: translateY(0); }
  to { transform: translateY(20%); }
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #020202, transparent 50%, rgba(0,0,0,0.6));
  z-index: 1;
}

.badge-red {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid var(--accent-red);
  color: #fff;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.75rem;
  letter-spacing: 3px;
  border-radius: 4px;
}

.events-title {
  font-family: var(--font-accent);
  font-size: clamp(4rem, 12vw, 10rem);
  font-weight: 950;
  letter-spacing: -5px;
  line-height: 0.9;
  margin: 1.5rem 0;
  background: linear-gradient(to bottom, #fff, rgba(255,255,255,0.4));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.events-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
}

/* 2. ARCHIVE SECTION (MENU + VIEWER) */
.archive-section {
  padding: 8rem 2rem;
}

.archive-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 4rem;
  margin-top: 5rem;
  min-height: 700px;
}

/* Archive Menu */
.archive-menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-item {
  position: relative;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.menu-item--active {
  background: rgba(255, 94, 0, 0.05);
  border-color: var(--primary-color);
  transform: translateX(15px);
}

.menu-num {
  font-family: var(--font-accent);
  font-size: 2.5rem;
  font-weight: 950;
  color: var(--primary-color);
  opacity: 0.2;
  transition: opacity 0.4s;
}

.menu-item--active .menu-num {
  opacity: 0.8;
}

.menu-label {
  display: flex;
  flex-direction: column;
}

.m-edition {
  font-family: var(--font-accent);
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.m-date {
  font-size: 0.8rem;
  opacity: 0.4;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 0.3rem;
}

.menu-hover-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, var(--primary-color) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}

.menu-item:hover .menu-hover-glow {
  opacity: 0.05;
}

/* Archive Viewer */
.archive-viewer {
  position: relative;
}

.viewer-portal {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border-radius: 40px;
  overflow: hidden;
  height: 100%;
}

.portal-image {
  position: relative;
  height: 350px;
  overflow: hidden;
}

.p-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.p-badge {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: var(--primary-color);
  color: #000;
  padding: 0.5rem 1rem;
  font-family: var(--font-accent);
  font-weight: 950;
  font-size: 0.7rem;
  letter-spacing: 1px;
  border-radius: 4px;
  z-index: 2;
}

.p-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, #090909);
}

.portal-content {
  margin-top: -60px;
  z-index: 2;
  padding: 4rem;
  border-radius: 40px;
  flex-grow: 1;
}

.content-top {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.relato-tag {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.4rem 1rem;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.portal-title {
  font-family: var(--font-accent);
  font-size: 3rem;
  font-weight: 950;
  margin-bottom: 1.5rem;
  line-height: 1;
}

.portal-desc {
  font-size: 1.25rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
}

.portal-stats {
  display: flex;
  gap: 4rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.p-stat {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.p-stat svg {
  color: var(--primary-color);
}

.p-stat-info {
  display: flex;
  flex-direction: column;
}

.p-stat-val {
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 1.1rem;
  line-height: 1;
}

.p-stat-label {
  font-size: 0.7rem;
  opacity: 0.4;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 0.3rem;
}

/* Transitions */
.viewport-enter-active, .viewport-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.viewport-enter-from { opacity: 0; transform: scale(0.95); filter: blur(10px); }
.viewport-leave-to { opacity: 0; transform: scale(1.05); filter: blur(10px); }

/* 3. RUTA MASSIVE */
.route-massive {
  padding: 8rem 2rem;
}

.route-hero-massive {
  margin-top: 4rem;
}

.massive-visual-wrap {
  position: relative;
  width: 100%;
  height: auto; /* Allow image to define height */
  min-height: 500px;
  background: #050505;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.massive-img {
  width: 100%;
  height: auto;
  display: block;
  filter: saturate(1.1) contrast(1.1);
}

.massive-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #000 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 4rem;
  z-index: 5;
  pointer-events: none; /* Let clicks pass through if needed */
}

.massive-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
  max-width: 1000px;
}

.m-stat-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.m-stat-label {
  font-family: var(--font-accent);
  font-size: 0.7rem;
  font-weight: 800;
  color: rgba(255,255,255,0.4);
  letter-spacing: 2px;
}

.m-stat-value {
  font-family: var(--font-accent);
  font-size: 1.5rem;
  font-weight: 950;
  color: #fff;
}

.terminal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  display: flex;
  gap: 3rem;
}

.t-line {
  font-family: monospace;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
}

.t-line span {
  color: var(--primary-color);
  font-weight: 900;
}

.tactical-point {
  position: absolute;
  z-index: 6;
  padding: 0.4rem 1rem;
  background: var(--primary-color);
  color: #000;
  font-family: var(--font-accent);
  font-weight: 950;
  font-size: 0.65rem;
  letter-spacing: 1px;
}

.tactical-point::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--primary-color);
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.p-start { top: 45%; right: 8%; }
.p-start::after { bottom: -5px; }

.p-finish { top: 55%; left: 11.5%; }
.p-finish::after { bottom: -5px; }

/* 4. HALL OF FAME (BRUTAL PROFESSIONAL) */
.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 380px)); /* Wider Pro Profile */
  gap: 4rem;
  margin-top: 6rem;
  perspective: 2000px;
  justify-content: center;
  max-width: 1300px;
  margin-left: auto;
  margin-right: auto;
}

.legend-container {
  height: 520px;
  cursor: pointer;
}

.legend-card-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.1s ease-out; /* Sharper for active mooning, 0.8s only when flip occurs */
  transform-style: preserve-3d;
  will-change: transform;
}

.legend-card-3d.is-flipped {
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.background-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  opacity: 0.6;
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 4px;
  overflow: hidden;
  background: #050505;
}

.brutal-border {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 15;
  pointer-events: none;
  transition: all 0.3s;
}

.legend-container:hover .brutal-border {
  border-color: var(--primary-color);
  box-shadow: inset 0 0 20px rgba(255, 94, 0, 0.1);
}

.brutal-border.active {
  border-color: var(--primary-color);
}

/* FRONT FACE */
.visual-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.rider-img-pro {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.1) brightness(0.9);
  transition: all 0.8s ease;
}

.legend-container:hover .rider-img-pro {
  transform: scale(1.05);
  filter: contrast(1.2) brightness(1.1);
}

.face-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #000 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem;
  z-index: 12;
}

/* Technical Details */
.technical-overlay {
  position: relative;
  height: 100%;
}

.scanner-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, transparent, var(--primary-color), transparent);
  box-shadow: 0 0 15px var(--primary-color);
  opacity: 0;
  transition: opacity 0.3s;
  animation: scan 3s linear infinite;
}

.legend-container:hover .scanner-line {
  opacity: 1;
}

@keyframes scan {
  0% { top: 0% }
  100% { top: 100% }
}

.corner-L {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 4px solid var(--primary-color);
  z-index: 20;
}

.top-left { top: 0; left: 0; border-right: none; border-bottom: none; }
.top-right { top: 0; right: 0; border-left: none; border-bottom: none; }
.bottom-left { bottom: 0; left: 0; border-right: none; border-top: none; }
.bottom-right { bottom: 0; right: 0; border-left: none; border-top: none; }

.rider-id-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--primary-color);
  background: rgba(0,0,0,0.8);
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--primary-color);
  font-weight: 900;
}

.pro-label {
  position: relative;
  z-index: 20;
}

.pro-tag {
  display: block;
  font-family: var(--font-accent);
  color: var(--primary-color);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 3px;
  margin-bottom: 0.5rem;
}

.pro-name {
  font-family: var(--font-accent);
  font-size: 2.5rem;
  font-weight: 950;
  line-height: 0.9;
}

.glass-glint {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%);
  background-size: 200% 200%;
  z-index: 16;
  pointer-events: none;
  transition: all 0.5s;
}

.legend-container:hover .glass-glint {
  background-position: 100% 100%;
}

/* BACK FACE */
.card-back {
  background: #080808;
  transform: rotateY(180deg);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tech-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.tech-icon { color: var(--primary-color); }

.status-blink {
  font-family: monospace;
  font-size: 0.6rem;
  color: #00ff00;
  animation: blink 1s infinite;
}

@keyframes blink { 50% { opacity: 0.3 } }

.main-info { margin-bottom: 3rem; }

.info-alias {
  display: block;
  color: var(--primary-color);
  font-weight: 900;
  font-size: 0.8rem;
  letter-spacing: 4px;
  margin-bottom: 0.5rem;
}

.info-name {
  font-family: var(--font-accent);
  font-size: 2.2rem;
  font-weight: 950;
  line-height: 1;
}

.stats-technical {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.t-stat {
  width: 100%;
}

.t-label {
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.t-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.05);
  border-radius: 2px;
}

.t-fill {
  height: 100%;
  background: var(--primary-color);
  box-shadow: 0 0 10px var(--primary-color);
}

.ig-btn-pro {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.2rem;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.ig-btn-pro:hover {
  background: var(--primary-color);
  color: #000;
}

/* RESPONSIVE SYSTEM - BRUTAL MOBILE OPTIMIZATION */

/* --- Tablet / Large Mobile (1024px) --- */
@media (max-width: 1024px) {
  .events-hero { min-height: 50vh; padding-top: 120px; }
  .events-title { font-size: 5rem; }
  
  .archive-section, .route-massive, .hall-of-fame { padding: 5rem 2rem; }
  .archive-grid { grid-template-columns: 1fr; gap: 2rem; margin-top: 3rem; }
  
  .archive-menu { 
    flex-direction: row; 
    overflow-x: auto; 
    padding: 1rem 0.5rem;
    gap: 1rem;
    margin-bottom: 2rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-snap-type: x mandatory; /* Kinetic Carousel Snap */
  }
  .archive-menu::-webkit-scrollbar { display: none; }
  
  .menu-item { 
    flex-shrink: 0; 
    padding: 1rem 1.5rem; 
    min-width: 260px; /* Wider for better carousel presence */
    border-radius: 12px;
    scroll-snap-align: center; /* Snap items to center */
    margin: 0;
    justify-content: center;
  }
  
  .portal-content { padding: 3rem 2rem; margin-top: -40px; }
  .portal-title { font-size: 2.5rem; }
  
  .massive-visual-wrap { height: 400px; }
  .route-hero-massive { margin-top: 2rem; }
  .p-start { right: 5%; font-size: 0.55rem; }
  .p-finish { left: 5%; font-size: 0.55rem; }
  
  .participants-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  }
}

/* --- Standard Mobile (768px) --- */
@media (max-width: 768px) {
  .archive-section, .route-massive, .hall-of-fame { padding: 3.5rem 1.5rem; }
  
  .events-title { font-size: 3.5rem; letter-spacing: -2px; }
  .events-subtitle { font-size: 1rem; max-width: 100%; }
  
  .section-header h2, .section-heading h2 { font-size: 2rem; }
  
  .portal-desc { font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; }
  .portal-stats { gap: 1.5rem; flex-direction: column; }
  
  .massive-visual-wrap { min-height: 300px; }
  .massive-overlay { padding: 2rem; }
  
  .legend-container { height: 450px; }
  .pro-name { font-size: 2rem; }
  .info-name { font-size: 1.8rem; }
  
  .ig-btn-pro { padding: 1rem; font-size: 0.75rem; }
}

/* --- Small Mobile (480px) --- */
@media (max-width: 480px) {
  .archive-section, .route-massive, .hall-of-fame { padding: 2.5rem 1rem; }
  
  .events-hero { padding-top: 100px; }
  .events-title { font-size: 2.8rem; }
  .badge-red { font-size: 0.6rem; letter-spacing: 2px; }
  
  .menu-item { min-width: 160px; padding: 0.8rem 1rem; }
  .menu-num { font-size: 1.5rem; }
  .m-edition { font-size: 0.65rem; }
  
  .portal-content { padding: 2rem 1.5rem; }
  .portal-title { font-size: 1.8rem; }
  
  .massive-visual-wrap { min-height: 250px; }
  .tactical-point { padding: 0.3rem 0.6rem; font-size: 0.5rem; }
  
  .participants-grid {
    grid-template-columns: 1fr;
    margin-top: 2rem;
  }
  
  .legend-container { height: 420px; }
}
</style>
