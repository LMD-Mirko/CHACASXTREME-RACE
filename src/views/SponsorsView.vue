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

// Placeholder logos for sponsors
const sponsorLogos = [
  { name: 'Brand 1', icon: 'logo1' },
  { name: 'Brand 2', icon: 'logo2' },
  { name: 'Brand 3', icon: 'logo3' },
  { name: 'Brand 4', icon: 'logo4' },
  { name: 'Brand 5', icon: 'logo5' },
  { name: 'Brand 6', icon: 'logo6' },
  { name: 'Brand 7', icon: 'logo7' },
  { name: 'Brand 8', icon: 'logo8' },
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
        <ArrowLeft :size="18" /> VOLVER
      </RouterLink>

      <div class="container relative z-10">
        <div class="badge-gold reveal shimmer-gold">ALIANZAS ESTRATÉGICAS</div>
        <h1 class="sponsor-title reveal">AUSPICIADORES</h1>
        <p class="sponsor-subtitle reveal">
          ¡Únete a esta gran aventura y ayuda a que el ciclismo crezca en Chacas!
        </p>
        <div class="hero-actions reveal">
          <a href="#" class="btn-gold-glow shimmer-gold">
            <Download :size="20" /> DESCARGAR DOSSIER PARA MARCAS
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
               <div class="logo-placeholder">LOGO {{ (index % 8) + 1 }}</div>
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
            <h2 class="editorial-title">UNA MISIÓN QUE <span class="gradient-text">TRANSFORMA</span></h2>
            <p>
              Te invitamos a ser parte de un proyecto con el potencial de transformar vidas y poner a Chacas en el mapa internacional del ciclismo. 
              Con tu apoyo, llevaremos este deporte a nuevas generaciones, promoviendo valores como la disciplina y la superación personal.
            </p>
          </div>
          
          <div class="text-block secondary">
            <p>
              El ciclismo es más que una actividad física, es una herramienta para el desarrollo personal y comunitario. 
              Al ser auspiciador, contribuirás al crecimiento de esta iniciativa y ayudarás a más personas a descubrir sus beneficios.
            </p>
          </div>

          <div class="final-quote">
            <h3>¡Juntos podemos expandir esta misión y fortalecer nuestra comunidad! ¡Tu apoyo es clave para lograrlo!</h3>
          </div>
        </div>

        <div class="mission-visual reveal">
           <div class="visual-card glass-premium aura-pulse">
              <div class="impact-stat">
                 <span class="stat-number">+100</span>
                 <span class="stat-label">Niños Impactados</span>
              </div>
              <div class="impact-stat">
                 <span class="stat-number">2026</span>
                 <span class="stat-label">Meta Internacional</span>
              </div>
              <div class="stat-badge">PROYECTO SOCIAL</div>
              <div class="card-glow"></div>
           </div>
        </div>
      </div>
    </section>

    <!-- 4. VALUES GRID -->
    <section class="values-grid container">
      <div class="value-card reveal">
        <Target :size="40" class="primary-text" />
        <h3>Visibilidad de Marca</h3>
        <p>Tu logo en metas, jerseys y toda la comunicación oficial del evento.</p>
      </div>
      <div class="value-card reveal">
        <TrendingUp :size="40" class="primary-text" />
        <h3>Responsabilidad Social</h3>
        <p>Vínculo directo con el desarrollo comunitario y deportivo de Chacas.</p>
      </div>
      <div class="value-card reveal">
        <Users :size="40" class="primary-text" />
        <h3>Networking Elite</h3>
        <p>Acceso a una red de contactos y marcas de alto impacto en el sector.</p>
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
  width: 130px;
  height: 130px;
  min-width: 130px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  transition: all 0.4s ease;
  cursor: pointer;
}

.float-anim {
  animation: floatCircle 6s ease-in-out infinite;
  animation-delay: var(--f-delay);
}

@keyframes floatCircle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.logo-circle:hover {
  background: rgba(255, 184, 0, 0.1);
  border-color: #ffb800;
  transform: translateY(-20px) scale(1.1) !important;
  z-index: 10;
}

.circle-border {
  position: absolute;
  inset: -5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: all 0.4s ease;
}

.logo-circle:hover .circle-border {
  border-color: var(--primary-color);
  inset: -10px;
}

.logo-placeholder {
  font-weight: 800;
  font-size: 0.8rem;
  opacity: 0.5;
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
  font-family: var(--font-accent);
  font-size: 4rem;
  font-weight: 950;
  margin: 2rem 0;
  line-height: 1;
}

.text-block p {
  font-size: 1.3rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.text-block.secondary {
  margin-top: 4rem;
  padding-left: 3rem;
  border-left: 2px solid var(--primary-color);
}

.final-quote h3 {
  font-family: var(--font-accent);
  font-size: 1.8rem;
  font-weight: 900;
  margin-top: 6rem;
  color: var(--primary-color);
}

.text-block h2 {
  font-family: var(--font-accent);
  font-size: 4rem;
  font-weight: 950;
  margin: 2rem 0;
  line-height: 1;
}

.gradient-text {
  background: linear-gradient(to right, var(--primary-color), #ffb800);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.mission-visual {
  position: relative;
}

.visual-card {
  position: relative;
  aspect-ratio: 4/5;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4rem;
  border-radius: 60px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.aura-pulse::before {
  content: '';
  position: absolute;
  inset: -100px;
  background: radial-gradient(circle, rgba(255, 94, 0, 0.1) 0%, transparent 70%);
  animation: auraPulse 4s infinite ease-in-out;
  z-index: -1;
}

@keyframes auraPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.card-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent);
  transform: skewX(-25deg);
  animation: cardSlide 6s infinite;
}

@keyframes cardSlide {
  0% { left: -100%; }
  30% { left: 200%; }
  100% { left: 200%; }
}

.impact-stat {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-family: var(--font-accent);
  font-size: 5rem;
  font-weight: 950;
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  font-size: 1.2rem;
  opacity: 0.6;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.stat-badge {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: var(--primary-color);
  color: #000;
  padding: 0.5rem 1rem;
  font-weight: 950;
  font-size: 0.7rem;
  border-radius: 4px;
}

/* 4. VALUES GRID */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rem;
}

.value-card {
  background: rgba(255, 255, 255, 0.02);
  padding: 4rem 3rem;
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  transition: all 0.4s ease;
}

.value-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--primary-color);
  transform: translateY(-10px);
}

.value-card h3 {
  font-family: var(--font-accent);
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
}

.value-card p {
  opacity: 0.6;
  line-height: 1.6;
}

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
  background: #ffb800;
  color: #000;
  border-color: #ffb800;
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
  .visual-card { aspect-ratio: auto; padding: 3rem; }
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
  .visual-card { gap: 2.5rem; border-radius: 30px; }
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
