<script setup>
import { onMounted, ref, reactive, computed } from 'vue';
import { useMouseInElement } from '@vueuse/core';
import { 
  Trophy, 
  Users, 
  Handshake, 
  ChevronRight, 
  Sparkles,
  ArrowDownRight,
  CircleCheck,
  Zap,
  X,
  Send,
  Loader2,
  Image as ImageIcon
} from 'lucide-vue-next';

// Local Assets for Dome Gallery
import img1 from '@/assets/images/chacas /1.jpg';
import img2 from '@/assets/images/chacas /2.jpg';
import img3 from '@/assets/images/chacas /3.jpg';
import img4 from '@/assets/images/chacas /4.jpg';
import imgChacas from '@/assets/images/chacas /chacas.jpg';
import g1 from '@/assets/images/gallery1.png';
import g2 from '@/assets/images/gallery2.png';
import g3 from '@/assets/images/gallery3.png';
import hImg1 from '@/assets/images/hero1.png';
import hImg2 from '@/assets/images/hero2.jpg';
import hImg3 from '@/assets/images/hero3.jpg';

const domeImages = [
  img1, img2, img3, img4, imgChacas, 
  g1, g2, g3, hImg1, hImg2, hImg3,
  img1, img2, img3, img4, imgChacas,
  g1, g2, g3, hImg1, hImg2, hImg3
];

// 3D Tilt Logic for Cards
const card1 = ref(null);
const card2 = ref(null);
const card3 = ref(null);

const { elementX: x1, elementY: y1, elementWidth: w1, elementHeight: h1, isOutside: o1 } = useMouseInElement(card1);
const { elementX: x2, elementY: y2, elementWidth: w2, elementHeight: h2, isOutside: o2 } = useMouseInElement(card2);
const { elementX: x3, elementY: y3, elementWidth: w3, elementHeight: h3, isOutside: o3 } = useMouseInElement(card3);

const cardStyle1 = computed(() => {
  if (o1.value) return { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' };
  const rX = ((y1.value / h1.value) - 0.5) * -15;
  const rY = ((x1.value / w1.value) - 0.5) * 15;
  return { transform: `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)` };
});

const cardStyle2 = computed(() => {
  if (o2.value) return { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' };
  const rX = ((y2.value / h2.value) - 0.5) * -15;
  const rY = ((x2.value / w2.value) - 0.5) * 15;
  return { transform: `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)` };
});

const cardStyle3 = computed(() => {
  if (o3.value) return { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' };
  const rX = ((y3.value / h3.value) - 0.5) * -15;
  const rY = ((x3.value / w3.value) - 0.5) * 15;
  return { transform: `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)` };
});

const showStaffModal = ref(false);
const isSubmitting = ref(false);
const showSuccess = ref(false);
const staffForm = reactive({
  nombre: '',
  whatsapp: ''
});

const handleStaffSubmit = async () => {
  if (!staffForm.nombre || !staffForm.whatsapp) return;
  
  isSubmitting.value = true;
  // Simulating API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  isSubmitting.value = false;
  showSuccess.value = true;
  
  // Clear form after delay
  setTimeout(() => {
    showStaffModal.value = false;
    showSuccess.value = false;
    staffForm.nombre = '';
    staffForm.whatsapp = '';
  }, 2000);
};

onMounted(() => {
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
      }
    });
  }, observerOptions);
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
</script>

<template>
  <div class="elite-participate">
    <!-- 1. CINEMATIC HERO -->
    <section class="elite-hero">
      <div class="elite-hero__bg">
        <div class="bg-pattern"></div>
        <div class="bg-gradient"></div>
        <img src="@/assets/images/gallery2.png" alt="" class="bg-img" />
      </div>
      
      <div class="container elite-hero__content">
        <div class="hero-tag reveal">
          <Zap :size="14" class="primary-text" /> PRE-INSCRIPCIONES 2026
        </div>
        <h1 class="hero-title reveal">
          EL DESAFÍO <br />
          <span class="text-outline">ES TUYO</span>
        </h1>
        <p class="hero-desc reveal">
          Únete a la carrera más exigente de los Andes. Una experiencia que redefine tus límites.
        </p>
        <div class="hero-scroll reveal">
          <span class="scroll-line"></span>
          <span>EXPLORA EL DESAFÍO</span>
        </div>
      </div>
    </section>


    <!-- 3. PARTICIPATION PATHS: Three Pillars of Glory -->
    <section id="participar" class="elite-paths container">
      <div class="section-heading reveal">
        <div class="heading-badge">COMPROMISO</div>
        <h2 class="heading-title">ELEGIR UN <span class="primary-text">CAMINO</span></h2>
        <p class="heading-subtitle">Tres pilares fundamentales que hacen posible la leyenda de Chacas.</p>
      </div>

      <div class="elite-paths__grid">
        <!-- Path 1: Cyclist -->
        <div class="path-pillar reveal" ref="card1" :style="cardStyle1">
      
          <div class="pillar-bg"></div>
          <div class="pillar-glow"></div>
          <div class="pillar-content">
            <div class="pillar-header">
              <div class="pillar-icon"><Trophy :size="28" /></div>
              <span class="pillar-number">01</span>
            </div>
            <h3 class="pillar-title">SOY CICLISTA</h3>
            <p class="pillar-desc">Domina las cumbres de la sierra central. Categorías Elite y Master abiertas.</p>
            <ul class="pillar-list">
              <li><CircleCheck :size="14" /> Cronometraje Pro</li>
              <li><CircleCheck :size="14" /> Kit Edición 2026</li>
              <li><CircleCheck :size="14" /> Premios en Efectivo</li>
            </ul>
            <RouterLink to="/registro/ciclista" class="pillar-btn primary no-underline">QUIERO COMPETIR</RouterLink>
          </div>
        </div>

        <!-- Path 2: Sponsor -->
        <div class="path-pillar reveal" style="--delay: 0.15s" ref="card2" :style="cardStyle2">
          <div class="pillar-bg"></div>
          <div class="pillar-glow"></div>
          <div class="pillar-content">
            <div class="pillar-header">
              <div class="pillar-icon"><Handshake :size="28" /></div>
              <span class="pillar-number">02</span>
            </div>
            <h3 class="pillar-title">SOY AUSPICIADOR</h3>
            <p class="pillar-desc">Vincula tu marca con la excelencia y el prestigio del ciclismo extremo.</p>
            <ul class="pillar-list">
              <li><CircleCheck :size="14" /> Visibilidad en Ruta</li>
              <li><CircleCheck :size="14" /> Stand en Meta Pro</li>
              <li><CircleCheck :size="14" /> Branding Nacional</li>
            </ul>
            <RouterLink to="/auspiciadores" class="pillar-btn secondary no-underline">QUIERO AUSPICIAR</RouterLink>
          </div>
        </div>

        <!-- Path 3: Staff -->
        <div class="path-pillar reveal" style="--delay: 0.3s" ref="card3" :style="cardStyle3">
          <div class="pillar-bg"></div>
          <div class="pillar-glow"></div>
          <div class="pillar-content">
            <div class="pillar-header">
              <div class="pillar-icon"><Users :size="28" /></div>
              <span class="pillar-number">03</span>
            </div>
            <h3 class="pillar-title">SOY STAFF</h3>
            <p class="pillar-desc">El motor que hace posible la magia. Únete al equipo logístico oficial.</p>
            <ul class="pillar-list">
              <li><CircleCheck :size="14" /> Uniforme Oficial</li>
              <li><CircleCheck :size="14" /> Certificación Staff</li>
              <li><CircleCheck :size="14" /> Traslados y Dieta</li>
            </ul>
            <button @click="showStaffModal = true" class="pillar-btn text-link">
              UNIRME AL EQUIPO <ChevronRight :size="18" />
            </button>
          </div>
        </div>
      </div>
    </section>


    <!-- 5. FINAL KINETIC CTA -->
    <section class="elite-cta">
      <div class="container reveal">
        <div class="cta-box">
          <div class="cta-content">
            <h2 class="cta-title">¿LISTO PARA <br/> EL <span class="primary-text">DESAFÍO?</span></h2>
            <p class="cta-subtitle">Los cupos se agotan. No dejes que te lo cuenten.</p>
          </div>
          <div class="cta-actions">
            <button class="btn-action">INSCRIBIRME AHORA</button>
            <button class="btn-outline">DESCARGAR BASES</button>
          </div>
          <!-- Background Decoration -->
          <div class="cta-decor">CHACAS</div>
        </div>
      </div>
    </section>

    <!-- 6. STAFF REGISTRATION MODAL -->
    <Teleport to="body">
      <Transition name="modal-bounce">
        <div v-if="showStaffModal" class="staff-modal-overlay" @click.self="showStaffModal = false">
          <div class="staff-modal glass-premium reveal--visible">
            <!-- Close Button -->
            <button class="modal-close" @click="showStaffModal = false">
              <X :size="24" />
            </button>

            <!-- Success State -->
            <div v-if="showSuccess" class="success-content">
              <div class="success-icon-wrap">
                <CircleCheck :size="60" class="primary-text" />
              </div>
              <h3 class="modal-title">¡REGISTRO EXITOSO!</h3>
              <p class="modal-subtitle">Nos pondremos en contacto contigo pronto por WhatsApp.</p>
            </div>

            <!-- Form State -->
            <div v-else class="modal-body">
              <div class="modal-header">
                <Users :size="32" class="primary-text" />
                <h3 class="modal-title">REGISTRO STAFF</h3>
                <p class="modal-subtitle">Forma parte de la organización oficial de Manka Riders.</p>
              </div>

              <form @submit.prevent="handleStaffSubmit" class="staff-form">
                <div class="form-group">
                  <label>NOMBRE COMPLETO</label>
                  <div class="input-wrap">
                    <input 
                      v-model="staffForm.nombre" 
                      type="text" 
                      placeholder="nombres apellidos" 
                      required 
                    />
                    <div class="input-focus-line"></div>
                  </div>
                </div>

                <div class="form-group">
                  <label>WHATSAPP</label>
                  <div class="input-wrap">
                    <input 
                      v-model="staffForm.whatsapp" 
                      type="tel" 
                      placeholder="+51 987 654 321" 
                      required 
                    />
                    <div class="input-focus-line"></div>
                  </div>
                </div>

                <button type="submit" class="submit-btn" :disabled="isSubmitting">
                  <span v-if="isSubmitting">
                    <Loader2 class="animate-spin" :size="20" />
                    PROCESANDO...
                  </span>
                  <span v-else>
                    ENVIAR SOLICITUD <Send :size="18" />
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- 7. DOME GALLERY SECTION -->
    <section class="elite-dome reveal">
      <div class="container">
        <div class="section-heading">
          <div class="heading-badge">GALERÍA</div>
          <h2 class="heading-title">MUNDO <span class="primary-text">CHACAS</span></h2>
          <p class="heading-subtitle">Sumérgete en la atmósfera visual de nuestra expedición.</p>
        </div>

        <div class="dome-container">
          <div class="dome-grid">
            <div 
              v-for="(img, idx) in domeImages" 
              :key="idx" 
              class="dome-item"
              :style="{ '--delay': (idx * 0.05) + 's' }"
            >
              <img :src="img" alt="Chacas Gallery" loading="lazy" />
              <div class="dome-item-overlay"></div>
            </div>
          </div>
          <!-- Spherical Overlay Effect -->
          <div class="dome-lens-effect"></div>
        </div>
      </div>
    </section>

    <!-- 8. FINAL FOOTER DECORATION -->
    <div class="footer-bottom-line"></div>
  </div>
</template>

<style scoped>
.elite-participate {
  background: #020202;
  /* Deep Atmospheric Gradient */
  background-image: 
    radial-gradient(circle at 50% -20%, rgba(255, 94, 0, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 0% 40%, rgba(255, 94, 0, 0.03) 0%, transparent 40%),
    radial-gradient(circle at 100% 80%, rgba(255, 94, 0, 0.05) 0%, transparent 40%);
  background-attachment: fixed;
  color: #fff;
  overflow-x: hidden;
}

/* 1. HERO */
.elite-hero {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 80px;
  overflow: hidden;
}

.elite-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

.bg-img {
  width: 100%;
  height: 120%; /* Extra height for parallax */
  object-fit: cover;
  opacity: 0.3;
  filter: grayscale(1);
  transform: translateZ(0); /* Force GPU */
  animation: heroParallax linear both;
  animation-timeline: scroll();
}

@keyframes heroParallax {
  from { transform: translateY(0); }
  to { transform: translateY(15%); }
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 94, 0, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 2;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #020202, transparent 50%),
              linear-gradient(to right, #020202 30%, transparent);
  z-index: 3;
}

.elite-hero__content {
  position: relative;
  z-index: 10;
}

.hero-tag {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 4px;
  margin-bottom: 2rem;
}

.hero-title {
  font-family: var(--font-accent);
  font-size: clamp(3.5rem, 12vw, 10rem);
  font-weight: 950;
  line-height: 0.85;
  letter-spacing: -6px;
}

.text-outline {
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
  color: transparent;
}

.hero-desc {
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 600px;
  margin-top: 2rem;
  line-height: 1.6;
}

.hero-scroll {
  margin-top: 5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  opacity: 0.5;
}

.scroll-line {
  width: 40px;
  height: 1px;
  background: #fff;
}


/* 3. PARTICIPATION PILLARS */
.elite-paths {
  padding-bottom: 12rem;
}

.section-heading {
  text-align: center;
  margin-bottom: 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.heading-badge {
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 800;
  letter-spacing: 5px;
  font-size: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--primary-color);
  padding-bottom: 0.5rem;
}

.heading-title {
  font-family: var(--font-accent);
  font-size: clamp(2.5rem, 5vw, 5rem);
  font-weight: 950;
  letter-spacing: -2px;
  margin-bottom: 1.5rem;
}

.elite-paths__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
}

.path-pillar {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 40px;
  padding: 4rem 3rem;
  overflow: visible; /* Allow tilt clipping */
  transition: transform 0.15s ease-out, background 0.5s ease, border-color 0.5s ease;
  display: flex;
  flex-direction: column;
  transform-style: preserve-3d;
  will-change: transform;
}

.pillar-spots-tag {
  position: absolute;
  top: -15px;
  right: 30px;
  background: var(--primary-color);
  color: #000;
  padding: 0.4rem 1.2rem;
  border-radius: 100px;
  font-family: var(--font-accent);
  font-weight: 950;
  font-size: 0.65rem;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(255, 94, 0, 0.3);
  z-index: 20;
  transform: translateZ(30px); /* Lift element in 3D */
}

.path-pillar:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 94, 0, 0.3);
}

.pillar-content {
  position: relative;
  transform: translateZ(20px); /* Lift content in 3D */
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pillar-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255, 94, 0, 0.05), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.path-pillar:hover .pillar-bg {
  opacity: 1;
}

.pillar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
}

.pillar-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 94, 0, 0.1);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.pillar-number {
  font-family: var(--font-accent);
  font-size: 0.8rem;
  font-weight: 900;
  opacity: 0.2;
}

.pillar-title {
  font-family: var(--font-accent);
  font-size: 1.8rem;
  font-weight: 950;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
}

.pillar-desc {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2.5rem;
  flex-grow: 1;
}

.pillar-list {
  list-style: none;
  margin-bottom: 3.5rem;
}

.pillar-list li {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.pillar-list :deep(svg) {
  color: var(--primary-color);
}

.pillar-btn {
  width: 100%;
  padding: 1.2rem;
  border-radius: 100px;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pillar-btn.primary {
  background: var(--primary-color);
  color: #000;
  border: none;
}

.pillar-btn.secondary {
  background: #fff;
  color: #000;
  border: none;
}

.pillar-btn.text-link {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.pillar-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}


/* 5. CTA */
.elite-cta {
  padding-bottom: 12rem;
}

.cta-box {
  position: relative;
  background: var(--accent-gradient);
  border-radius: 60px;
  padding: 6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #000;
  overflow: hidden;
}

.cta-title {
  font-family: var(--font-accent);
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 950;
  line-height: 1;
}

.cta-subtitle {
  font-size: 1.4rem;
  font-weight: 700;
  opacity: 0.7;
  margin-top: 1rem;
}

.cta-actions {
  display: flex;
  gap: 1.5rem;
}

.btn-action {
  background: #000;
  color: #fff;
  padding: 1.6rem 3.5rem;
  border-radius: 100px;
  border: none;
  font-family: var(--font-accent);
  font-weight: 900;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-outline {
  background: transparent;
  border: 2px solid rgba(0, 0, 0, 0.2);
  padding: 1.6rem 3.5rem;
  border-radius: 100px;
  font-family: var(--font-accent);
  font-weight: 900;
  cursor: pointer;
}

.cta-decor {
  position: absolute;
  top: 50%;
  right: -5%;
  transform: translateY(-50%);
  font-family: var(--font-accent);
  font-size: 14rem;
  font-weight: 950;
  color: rgba(0, 0, 0, 0.03);
  letter-spacing: 40px;
  pointer-events: none;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .elite-paths__grid { grid-template-columns: 1fr; }
  
  .cta-box { 
    flex-direction: column; 
    text-align: center; 
    padding: 4rem 2rem;
    gap: 3rem; 
  }

  .cta-actions { width: 100%; flex-direction: column; }
  .btn-action, .btn-outline { width: 100%; }
}

@media (max-width: 768px) {
  .elite-hero { height: auto; padding: 120px 0 80px; }
  .hero-title { letter-spacing: -3px; line-height: 0.9; margin-bottom: 2rem; }
  .hero-desc { font-size: 1.1rem; }
  
  .elite-manifesto, .elite-paths, .elite-cta { padding: 6rem 0; }
  
  .altar-circle { width: 240px; height: 240px; }
  .trophy-icon-gold { width: 80px; height: 80px; }
  
  .manifesto-headline { font-size: 1.8rem; margin-bottom: 2rem; }
  .manifesto-separator { margin-bottom: 2rem; }
  .manifesto-paragraph { font-size: 1.1rem; margin: 0 auto; }

  .path-pillar { padding: 3rem 2rem; }
  .pillar-title { font-size: 1.6rem; }

  /* Disable Tilt on Mobile for UX */
  .path-pillar { transform: none !important; }
}

@media (max-width: 480px) {
  .hero-title { font-size: 3.5rem; }
  .manifesto-card { border-radius: 40px; }
  .path-pillar { border-radius: 35px; }
  .cta-box { border-radius: 40px; }
  .cta-decor { display: none; }
  .cta-title { font-size: 2.2rem; }
}

/* Base Primary Color */
.primary-text {
  color: var(--primary-color);
}

/* 6. MODAL STYLES */
.staff-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.staff-modal {
  width: 100%;
  max-width: 500px;
  background: #0a0a0a;
  border: 1px solid rgba(255, 94, 0, 0.2);
  border-radius: 40px;
  padding: 4rem 3rem;
  position: relative;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8), 
              0 0 40px rgba(255, 94, 0, 0.05);
}

.modal-close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  color: #fff;
  transform: rotate(90deg);
}

.modal-header {
  text-align: center;
  margin-bottom: 3rem;
}

.modal-title {
  font-family: var(--font-accent);
  font-size: 2.5rem;
  font-weight: 950;
  margin: 1rem 0 0.5rem;
  letter-spacing: -1px;
}

.modal-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
  line-height: 1.5;
}

.staff-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.form-group label {
  font-family: var(--font-accent);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.4);
}

.input-wrap {
  position: relative;
}

.input-wrap input {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.25rem;
  border-radius: 12px;
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-wrap input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 94, 0, 0.4);
}

.input-focus-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.input-wrap input:focus + .input-focus-line {
  width: 100%;
}

.submit-btn {
  margin-top: 1rem;
  background: var(--primary-color);
  color: #000;
  border: none;
  padding: 1.4rem;
  border-radius: 15px;
  font-family: var(--font-accent);
  font-weight: 950;
  font-size: 0.85rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(255, 94, 0, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Success State */
.success-content {
  text-align: center;
  padding: 2rem 0;
  animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.success-icon-wrap {
  margin-bottom: 2rem;
}

/* Transitions */
.modal-bounce-enter-active {
  animation: modalIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-bounce-leave-active {
  animation: modalIn 0.3s reverse ease-in;
}

@keyframes modalIn {
  0% { opacity: 0; transform: scale(0.9) translateY(40px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .staff-modal {
    padding: 3rem 1.5rem;
    border-radius: 30px;
  }
  .modal-title { font-size: 1.8rem; }
}
/* 7. DOME GALLERY */
.elite-dome {
  padding-bottom: 15rem;
  overflow: hidden;
}

.dome-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  perspective: 2000px; /* Strong perspective for dome effect */
  padding: 4rem 0;
}

.dome-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.5rem;
  transform: rotateX(15deg) rotateY(0deg) scale(1.1);
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dome-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #000;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  opacity: 0.8;
  transform: translateZ(0);
}

.dome-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.dome-item:hover {
  opacity: 1;
  transform: translateZ(50px) scale(1.1);
  border-color: var(--primary-color);
  z-index: 10;
  box-shadow: 0 20px 40px rgba(255, 94, 0, 0.3);
}

.dome-item:hover img {
  transform: scale(1.2);
}

.dome-item-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%);
  pointer-events: none;
}

.dome-lens-effect {
  position: absolute;
  inset: -10%;
  background: radial-gradient(circle, transparent 20%, rgba(2, 2, 2, 0.8) 80%);
  pointer-events: none;
  z-index: 20;
}

.footer-bottom-line {
  height: 1px;
  width: 100%;
  background: linear-gradient(to right, transparent, var(--primary-color), transparent);
  opacity: 0.2;
}

@media (max-width: 1024px) {
  .dome-grid { grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  .dome-container { padding: 2rem 0; }
}

@media (max-width: 768px) {
  .elite-dome { padding-bottom: 8rem; }
  .dome-grid { grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }
  .dome-item { border-radius: 12px; }
}

@media (max-width: 480px) {
  .dome-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
