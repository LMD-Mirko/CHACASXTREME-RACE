<script setup>
import { onMounted, ref } from 'vue';
import { 
  Handshake, 
  Target, 
  Users, 
  Globe, 
  TrendingUp, 
  Download,
  Info,
  ArrowLeft
} from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

// Import actual logo images
import logoMain from '@/assets/images/logo.webp';
import logo1 from '@/assets/images/logo1.png';
import unnamedLogo from '@/assets/images/unnamed.webp';
import imagenaus from '@/assets/images/imagenaus.jpg';

const { t } = useI18n();

const sponsorLogos = [
  { name: 'Sponsor 1', img: logoMain },
  { name: 'Sponsor 2', img: logo1 },
  { name: 'Sponsor 3', img: unnamedLogo },
  { name: 'Sponsor 4', img: logoMain },
  { name: 'Sponsor 5', img: logo1 },
  { name: 'Sponsor 6', img: unnamedLogo },
  { name: 'Sponsor 7', img: logoMain },
  { name: 'Sponsor 8', img: logo1 }
];

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
  <div class="sponsors-page">
    <!-- BACKGROUND DECORATIONS -->
    <div class="light-leak leak-1"></div>
    <div class="light-leak leak-2"></div>

    <!-- 1. HERO SECTION -->
    <section class="sponsor-hero">
      <div class="hero-bg">
        <div class="overlay"></div>
        <img src="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=1200" alt="Chacas Mountain" class="parallax-img" />
      </div>

      <!-- Navigation Link Back -->
      <RouterLink to="/como-participar" class="btn-back reveal">
        <ArrowLeft :size="18" /> {{ t('sponsors.back') }}
      </RouterLink>

      <div class="container relative z-10">
        <div class="badge-gold reveal shimmer-gold">{{ t('sponsors.badge') }}</div>
        <h1 class="sponsor-title reveal">{{ t('sponsors.title') }}</h1>
        <p class="sponsor-subtitle reveal">
          {{ t('sponsors.subtitle') }}
        </p>
        <div class="hero-actions reveal">
          <a href="#" class="btn-gold-glow shimmer-gold">
            <Download :size="20" /> {{ t('sponsors.download') }}
          </a>
        </div>
      </div>
    </section>

    <!-- 2. AUTOMATIC CIRCULAR CAROUSEL -->
    <section class="logo-carousel-section">
      <div class="carousel-track">
        <div class="logo-list">
          <!-- Double list for seamless loop -->
          <div v-for="n in 2" :key="n" class="logo-group">
            <div v-for="(logo, index) in sponsorLogos" :key="`${n}-${index}`" 
                 class="logo-circle float-anim" 
                 :style="`--f-delay: ${index * 0.2}s`"
            >
               <div class="logo-inner">
                  <img :src="logo.img" :alt="logo.name" class="sponsor-logo-img" />
               </div>
               <div class="circle-border"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="carousel-glow-left"></div>
      <div class="carousel-glow-right"></div>
    </section>

    <!-- 3. MISSION SECTION (EDITORIAL STYLE) -->
    <section class="mission-section container">
      <div class="mission-grid">
        <div class="mission-text reveal">
          <div class="text-block">
            <div class="line-accent"></div>
            <h2 class="editorial-title font-podium">{{ t('sponsors.editorial_title') }} <span class="gradient-text">{{ t('sponsors.editorial_title_highlight') }}</span></h2>
            <p class="font-inter">
              {{ t('sponsors.editorial_p1') }}
            </p>
          </div>
          
          <div class="text-block secondary">
            <p class="font-inter">
              {{ t('sponsors.editorial_p2') }}
            </p>
          </div>

          <div class="final-quote">
            <h3 class="font-podium">{{ t('sponsors.final_quote') }}</h3>
          </div>
        </div>

        <div class="mission-visual reveal">
           <div class="visual-card-premium">
              <img :src="imagenaus" alt="Proyecto Social Chacas" class="visual-card-bg" />
              <div class="visual-card-overlay"></div>

              <div class="card-decor-bracket top-left"></div>
              <div class="card-decor-bracket top-right"></div>
              <div class="card-decor-bracket bottom-left"></div>
              <div class="card-decor-bracket bottom-right"></div>
           </div>
        </div>
      </div>
    </section>

    <!-- 4. VALUES GRID -->
    <section class="values-grid container">
      <div class="value-card reveal">
        <div class="card-decor-corner top-left"></div>
        <div class="card-decor-corner bottom-right"></div>
        <Target :size="40" class="primary-text value-icon" />
        <h3 class="font-podium">{{ t('sponsors.values[0].title') }}</h3>
        <p class="font-inter">{{ t('sponsors.values[0].desc') }}</p>
      </div>
      <div class="value-card reveal">
        <div class="card-decor-corner top-left"></div>
        <div class="card-decor-corner bottom-right"></div>
        <TrendingUp :size="40" class="primary-text" />
        <h3 class="font-podium">{{ t('sponsors.values[1].title') }}</h3>
        <p class="font-inter">{{ t('sponsors.values[1].desc') }}</p>
      </div>
      <div class="value-card reveal">
        <div class="card-decor-corner top-left"></div>
        <div class="card-decor-corner bottom-right"></div>
        <Users :size="40" class="primary-text" />
        <h3 class="font-podium">{{ t('sponsors.values[2].title') }}</h3>
        <p class="font-inter">{{ t('sponsors.values[2].desc') }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sponsors-page {
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
.sponsor-hero {
  position: relative;
  height: 70vh;
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
  opacity: 0.4;
  animation: parallaxHero linear both;
  animation-timeline: scroll();
}

@keyframes parallaxHero {
  from { transform: translateY(0); }
  to { transform: translateY(15%); }
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #020202, transparent 50%, rgba(0,0,0,0.6));
  z-index: 1;
}

.badge-gold {
  position: relative;
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background: rgba(255, 184, 0, 0.1);
  border: 1px solid #ffb800;
  color: #ffb800;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.75rem;
  letter-spacing: 3px;
  border-radius: 4px;
  overflow: hidden;
}

.shimmer-gold::after {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(45deg, transparent, rgba(255, 184, 0, 0.2), transparent);
  transform: rotate(45deg);
  animation: shimmer 4s infinite;
}

@keyframes shimmer {
  0% { transform: translate(-100%, -100%) rotate(45deg); }
  20% { transform: translate(100%, 100%) rotate(45deg); }
  100% { transform: translate(100%, 100%) rotate(45deg); }
}

.sponsor-title {
  font-family: var(--font-accent);
  font-size: clamp(3.5rem, 10vw, 8rem);
  font-weight: 950;
  letter-spacing: -4px;
  line-height: 1;
  margin: 2rem 0;
  background: linear-gradient(to right, #fff, rgba(255,255,255,0.4));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sponsor-subtitle {
  font-size: 1.5rem;
  max-width: 800px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  margin-bottom: 3rem;
}

.btn-gold-glow {
  background: #ffb800;
  color: #000;
  padding: 1.5rem 2.8rem;
  border-radius: 100px;
  text-decoration: none;
  font-family: var(--font-accent);
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 0 30px rgba(255, 184, 0, 0.3);
  transition: all 0.3s ease;
}

.btn-gold-glow:hover {
  transform: scale(1.05);
  box-shadow: 0 0 50px rgba(255, 184, 0, 0.5);
}

/* 2. LOGO CAROUSEL SECTION */
.logo-carousel-section {
  position: relative;
  padding: 6rem 0;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.carousel-track {
  width: 100%;
  display: flex;
}

.logo-list {
  display: flex;
  animation: scrollLogos 40s linear infinite;
}

.logo-group {
  display: flex;
  gap: 4rem;
  padding: 0 2rem;
}

.logo-circle {
  width: 135px;
  height: 135px;
  min-width: 135px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.45s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
}

.logo-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50%;
}

.sponsor-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  filter: grayscale(0.2) contrast(1.1) brightness(0.95);
  transition: all 0.45s cubic-bezier(0.25, 1, 0.5, 1);
}

.float-anim {
  animation: floatCircle 6s ease-in-out infinite;
  animation-delay: var(--f-delay);
}

@keyframes floatCircle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.logo-circle:hover {
  background: rgba(255, 94, 0, 0.08);
  border-color: var(--primary-color);
  transform: translateY(-15px) scale(1.08) !important;
  z-index: 10;
  box-shadow: 0 15px 30px rgba(255, 94, 0, 0.15);
}

.logo-circle:hover .sponsor-logo-img {
  filter: grayscale(0) contrast(1.05) brightness(1.1);
  transform: scale(1.12);
}

.circle-border {
  position: absolute;
  inset: -6px;
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  transition: all 0.45s cubic-bezier(0.25, 1, 0.5, 1);
}

.logo-circle:hover .circle-border {
  border-color: var(--primary-color);
  inset: -12px;
  transform: rotate(45deg);
}

@keyframes scrollLogos {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.carousel-glow-left {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  background: linear-gradient(to right, #020202, transparent);
  z-index: 5;
}

.carousel-glow-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  background: linear-gradient(to left, #020202, transparent);
  z-index: 5;
}

/* 3. MISSION SECTION */
.mission-section {
  padding: 12rem 2rem;
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rem;
  align-items: center;
}

.text-block h2 {
  font-size: clamp(2rem, 5vw, 3.8rem);
  font-weight: 950;
  margin-bottom: 2rem;
  line-height: 0.95;
  letter-spacing: -2px;
}

.text-block p {
  font-size: 1.15rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.75);
}

.text-block.secondary {
  margin-top: 3rem;
  padding-left: 2rem;
  border-left: 2px solid var(--primary-color);
}

.final-quote h3 {
  font-size: 1.6rem;
  font-weight: 900;
  margin-top: 4.5rem;
  color: var(--primary-color);
  letter-spacing: -1px;
}

.gradient-text {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.mission-visual {
  position: relative;
  padding: 0 2rem;
}

.visual-card-premium {
  position: relative;
  aspect-ratio: 4/5;
  border-radius: 24px;
  overflow: visible; /* Allow floating stats to overflow slightly */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7);
  background: #050505;
}

.visual-card-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
  opacity: 0.75;
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease;
}

.visual-card-premium:hover .visual-card-bg {
  transform: scale(1.06);
  opacity: 0.9;
}

.visual-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(2, 2, 2, 0.85) 0%, rgba(2, 2, 2, 0.1) 50%, rgba(2, 2, 2, 0.4) 100%);
  z-index: 1;
  border-radius: 24px;
  pointer-events: none;
}

.floating-stat {
  position: absolute;
  z-index: 2;
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.4rem 2.2rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.floating-stat:hover {
  border-color: var(--primary-color);
  background: rgba(255, 94, 0, 0.1);
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 25px 50px rgba(255, 94, 0, 0.15);
}

.stat-top {
  top: 15%;
  left: -12%;
}

.stat-bottom {
  bottom: 18%;
  right: -12%;
}

.visual-card-premium .stat-number {
  font-size: 3.5rem;
  font-weight: 950;
  color: white;
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.visual-card-premium .stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.7;
  color: var(--text-secondary);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 0.3rem;
}

.card-decor-bracket {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 94, 0, 0.4);
  pointer-events: none;
  z-index: 2;
}

.card-decor-bracket.top-left { top: 20px; left: 20px; border-right: none; border-bottom: none; }
.card-decor-bracket.top-right { top: 20px; right: 20px; border-left: none; border-bottom: none; }
.card-decor-bracket.bottom-left { bottom: 20px; left: 20px; border-right: none; border-top: none; }
.card-decor-bracket.bottom-right { bottom: 20px; right: 20px; border-left: none; border-top: none; }

/* 4. VALUES GRID */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}

.value-card {
  position: relative;
  background: rgba(255, 255, 255, 0.01);
  padding: 5rem 3rem 4rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  transition: all 0.45s cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;
}

.value-card:hover {
  background: rgba(255, 94, 0, 0.03);
  border-color: rgba(255, 94, 0, 0.35);
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 
              0 0 20px rgba(255, 94, 0, 0.05);
}

.value-card h3 {
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  letter-spacing: -1px;
}

.value-card p {
  opacity: 0.55;
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-decor-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  transition: border-color 0.4s ease;
}

.value-card:hover .card-decor-corner {
  border-color: var(--primary-color);
}

.card-decor-corner.top-left { top: 15px; left: 15px; border-right: none; border-bottom: none; }
.card-decor-corner.bottom-right { bottom: 15px; right: 15px; border-left: none; border-top: none; }

/* LIGHT LEAKS */
.light-leak {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(150px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.15;
}

.leak-1 {
  top: -10%;
  right: -10%;
  background: var(--primary-color);
}

.leak-2 {
  bottom: 10%;
  left: -5%;
  background: #ffb800;
}
.btn-back {
  position: absolute;
  top: 120px;
  left: 5%;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #fff;
  text-decoration: none;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 2px;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem 1.5rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: var(--accent-gradient);
  color: #000;
  border-color: var(--primary-color);
  transform: translateX(-5px);
}

/* RESPONSIVE DESIGN - MOBILE FIRST REFINEMENTS */
@media (max-width: 1200px) {
  .mission-grid { gap: 4rem; }
}

@media (max-width: 1024px) {
  .mission-grid { grid-template-columns: 1fr; gap: 4rem; }
  .values-grid { grid-template-columns: 1fr; }
  .sponsor-hero { height: auto; min-width: 100%; padding: 180px 0 100px; }
  .visual-card-premium { aspect-ratio: 16/10; }
}

@media (max-width: 768px) {
  .btn-back { 
    top: 100px; 
    left: 2rem;
    font-size: 0.6rem; 
    padding: 0.5rem 1.2rem; 
  }
  
  .badge-gold { 
    font-size: 0.6rem; 
    letter-spacing: 2px;
    padding: 0.4rem 0.8rem;
  }

  .sponsor-title { 
    font-size: clamp(2.5rem, 12vw, 4rem); 
    margin: 1.5rem 0 1rem;
    letter-spacing: -2px;
    line-height: 1;
  }

  .sponsor-subtitle { 
    font-size: 1rem; 
    line-height: 1.5;
    margin-bottom: 2.5rem;
    max-width: 100%;
  }

  .btn-gold-glow { 
    width: 100%; 
    max-width: 320px;
    padding: 1.2rem; 
    font-size: 0.8rem;
    justify-content: center;
  }

  .logo-carousel-section { padding: 4rem 0; }
  .logo-circle { width: 90px; height: 90px; min-width: 90px; }
  .logo-group { gap: 2.5rem; }
  
  .mission-section { 
    padding: 5rem 1.5rem; 
  }
  .text-block h2 { font-size: 2.2rem; line-height: 1.1; }
  .text-block p { font-size: 1rem; }
  .text-block.secondary { margin-top: 2rem; padding-left: 1.5rem; padding-top: 0.5rem; }
  
  .final-quote h3 { 
    font-size: 1.25rem; 
    margin-top: 3.5rem; 
    line-height: 1.4;
  }

  .stat-number { font-size: 3rem; }
  .stat-label { font-size: 0.8rem; }
  .visual-card-premium { border-radius: 20px; }
}

@media (max-width: 480px) {
  .sponsor-hero { padding: 160px 0 80px; }
  .sponsor-title { font-size: 2.8rem; }
  .btn-back { top: 90px; left: 1rem; }
  
  .logo-circle { width: 75px; height: 75px; min-width: 75px; }
  .logo-group { gap: 1.5rem; }

  .value-card { padding: 3rem 1.5rem; }
}
</style>
