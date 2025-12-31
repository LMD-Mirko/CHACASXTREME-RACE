<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useMouseInElement } from '@vueuse/core';
import { 
  Trophy, 
  Map, 
  Mountain, 
  Heart, 
  CreditCard, 
  FileText, 
  Mail, 
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Copy
} from 'lucide-vue-next';

// Steps data
const steps = [
  {
    icon: CreditCard,
    title: 'Realizar Transferencia',
    desc: 'Asegura tu cupo realizando el depósito bancario oficial.',
    details: 'Cuenta BCP: 191-XXXXXXXX-X-XX\nCCI: 002-XXXXXXXXXXXXXXXXXX\nA nombre de: Manka Riders EIRL'
  },
  {
    icon: FileText,
    title: 'Completar Formulario',
    desc: 'Llena tus datos técnicos y médicos en el formulario oficial.',
    details: 'Link disponible en la parte inferior de esta página.'
  },
  {
    icon: Mail,
    title: 'Enviar Comprobante',
    desc: 'Manda el voucher al correo para validar tu inscripción.',
    details: 'Email: inscripciones@mankariders.com\nAsunto: INSCRIPCION - [TU NOMBRE]'
  }
];

const reasons = [
  {
    icon: Trophy,
    title: 'Pista Extrema',
    desc: 'Rutas desafiantes diseñadas para poner a prueba tus límites y habilidades técnicas.',
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?auto=format&fit=crop&q=80&w=800'
  },
  {
    icon: Map,
    title: 'Paisajes Deslumbrantes',
    desc: 'Compite rodeado de las vistas más impresionantes de la sierra central peruana.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800'
  },
  {
    icon: Mountain,
    title: 'Entorno Encantador',
    desc: 'Sumérgete en un ambiente natural único que cautivará tus sentidos en cada kilómetro.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800'
  },
  {
    icon: Heart,
    title: 'Cálida Acogida',
    desc: 'Vive la hospitalidad de la gente de Chacas, quienes te harán sentir como en casa.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800'
  }
];

const copyToClipboard = (text) => {
  const cleanText = text.includes(': ') ? text.split(': ')[1] : text;
  navigator.clipboard.writeText(cleanText);
  // Custom toast logic could go here, for now simple feedback
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

// Card Interaction Logic (Magnetic Tilt)
const createTiltEffect = (targetRef) => {
  const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(targetRef);
  
  return {
    transform: ref(() => {
      if (isOutside.value) return '';
      const rotateX = ((elementY.value / elementHeight.value) - 0.5) * 15;
      const rotateY = ((elementX.value / elementWidth.value) - 0.5) * -15;
      return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }),
    spotlight: ref(() => {
      return `radial-gradient(600px circle at ${elementX.value}px ${elementY.value}px, rgba(255, 94, 0, 0.15), transparent 40%)`;
    })
  };
};

const cardRefs = ref([]);
const stepRefs = ref([]);
const cardInteractions = reactive([]);
const stepInteractions = reactive([]);

onMounted(() => {
  cardRefs.value.forEach((el, i) => {
    const { transform, spotlight } = createTiltEffect(el);
    cardInteractions[i] = { transform, spotlight };
  });
  stepRefs.value.forEach((el, i) => {
    const { transform, spotlight } = createTiltEffect(el);
    stepInteractions[i] = { transform, spotlight };
  });
});
</script>

<template>
  <div class="registration-page">
    <!-- 1. HERO SECTION -->
    <section class="reg-hero">
      <div class="reg-hero__bg">
        <div class="overlay"></div>
        <img src="@/assets/images/gallery1.png" alt="Cyclist Hero" />
      </div>

      <!-- Navigation Link Back -->
      <RouterLink to="/como-participar" class="btn-back">
        <ArrowLeft :size="16" /> VOLVER
      </RouterLink>

      <div class="container relative z-10">
        <div class="badge-elite reveal">ZONA DE COMPETIDORES</div>
        <h1 class="reg-title reveal">COMPETIDORES</h1>
        <p class="reg-subtitle reveal">
          ¡No te puedes perder esta competencia! El desafío más grande de los Andes te espera.
        </p>
      </div>
    </section>

    <!-- 2. MOTIVATION GRID -->
    <section class="reg-reasons container">
      <div class="reasons-grid">
        <div v-for="(reason, index) in reasons" :key="index" 
             class="flip-card-container reveal" 
             :style="`--delay: ${index * 0.1}s`"
        >
          <div class="flip-card">
            <!-- FRONT FACE -->
            <div class="flip-card__front">
              <div class="reason-icon">
                <component :is="reason.icon" :size="32" />
              </div>
              <h3>{{ reason.title }}</h3>
              <p>{{ reason.desc }}</p>
              <div class="flip-hint">VER MÁS <ChevronRight :size="14" /></div>
            </div>
            
            <!-- BACK FACE -->
            <div class="flip-card__back">
              <img :src="reason.image" :alt="reason.title" class="back-img" />
              <div class="back-overlay"></div>
              <div class="back-content">
                 <div class="back-icon-box">
                    <component :is="reason.icon" :size="24" class="primary-text" />
                 </div>
                 <h4 class="back-title">{{ reason.title }}</h4>
                 <div class="back-badge">Manka Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. INSCRIPTION ROADMAP -->
    <section class="reg-steps">
      <div class="container">
        <div class="section-header reveal">
          <h2 class="title-tech">PASOS PARA LA <span class="primary-text">INSCRIPCIÓN</span></h2>
          <p>Sigue este proceso para asegurar tu lugar en la línea de partida.</p>
        </div>

        <div class="steps-path">
          <div v-for="(step, index) in steps" :key="index" class="step-pillar reveal" :style="`--delay: ${index * 0.15}s`">
            <div class="step-card glass-premium" 
                 :style="{ transform: stepInteractions[index]?.transform() }"
                 ref="stepRefs"
            >
              <div class="spotlight" :style="{ background: stepInteractions[index]?.spotlight() }"></div>
              <div class="step-header-context">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-icon-box">
                  <component :is="step.icon" :size="28" />
                </div>
              </div>
              
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-desc">{{ step.desc }}</p>
              
              <div class="step-details-clean">
                <div v-for="line in step.details.split('\n')" :key="line" class="detail-row" @click="copyToClipboard(line)">
                  <span class="detail-text">{{ line }}</span>
                  <Copy v-if="line.includes(':')" :size="12" class="copy-hint" />
                </div>
              </div>
            </div>
            <ArrowRight v-if="index < steps.length - 1" class="step-arrow" />
          </div>
        </div>
      </div>
    </section>

    <!-- 4. GOOGLE FORM CHAMBER -->
    <section class="form-chamber container">
      <div class="form-wrapper glass-tech reveal">
        <div class="form-header">
          <div class="chamber-badge">ZONA SEGURA DE REGISTRO</div>
          <h2>FORMULARIO <span class="primary-text">OFICIAL</span></h2>
          <p>Por favor, completa todos los campos con información verídica para el seguro y la logística.</p>
        </div>

        <div class="form-container">
          <div class="iframe-mockup">
            <div class="mockup-content">
              <div class="icon-circle">
                <FileText :size="48" class="primary-text" />
              </div>
              <h3>FORMULARIO DE INSCRIPCIÓN 2026</h3>
              <p>Haz clic en el botón para abrir el formulario oficial en una nueva ventana segura.</p>
              
              <a href="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform" target="_blank" class="btn-form">
                ABRIR FORMULARIO GOOGLE <ExternalLink :size="18" />
              </a>
              
              <p class="form-tip">
                <CheckCircle2 :size="14" /> Tu progreso se guardará automáticamente en tu cuenta de Google.
              </p>
            </div>
          </div>
        </div>

        <div class="form-footer">
          <p>¿Tienes problemas con el formulario? <RouterLink to="/contacto" class="link">Contáctanos</RouterLink></p>
        </div>
      </div>
    </section>

    <!-- 5. FINAL NOTICE -->
    <section class="reg-notice container reveal">
      <div class="notice-card glass-premium">
        <Mail :size="24" class="primary-text" />
        <p>Recuerda que tu inscripción solo será válida una vez enviado el **comprobante de pago** al correo oficial.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.registration-page {
  background: #020202;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 10rem;
  background-image: radial-gradient(circle at 50% 0%, rgba(255, 94, 0, 0.05) 0%, transparent 50%);
}

/* REVEAL SYSTEM - Clean and Subtle */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s ease-out;
  transition-delay: var(--delay, 0s);
}

.reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

.reg-hero {
  position: relative;
  height: 60vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.reg-hero__bg {
  position: absolute;
  inset: 0;
}

.reg-hero__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #020202, transparent);
  z-index: 1;
}

.btn-back {
  position: absolute;
  top: 100px;
  left: 5%;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #fff;
  text-decoration: none;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.6rem 1.2rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: var(--primary-color);
  color: #000;
  border-color: var(--primary-color);
}

.reg-title {
  font-family: var(--font-accent);
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 950;
  letter-spacing: -4px;
  line-height: 1;
  margin: 1.5rem 0;
  color: #fff;
}

.reg-subtitle {
  font-size: 1.25rem;
  color: #fff;
  opacity: 0.9;
  max-width: 600px;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.8);
}

.badge-elite {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 94, 0, 0.1);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 2px;
  border-radius: 4px;
  margin-top: 1rem;
}

.reg-reasons {
  margin-top: -5rem;
  position: relative;
  z-index: 10;
}

.reasons-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

/* FLIP CARDS */
.flip-card-container {
  height: 380px;
  perspective: 1500px;
}

.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  cursor: pointer;
}

.flip-card-container:hover .flip-card {
  transform: rotateY(180deg);
}

.flip-card__front, .flip-card__back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.flip-card__front {
  background: rgba(15, 15, 15, 0.9);
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  z-index: 2;
  backdrop-filter: blur(20px);
}

.flip-card__back {
  background: #000;
  transform: rotateY(180deg);
  z-index: 1;
}

.back-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.flip-card-container:hover .back-img {
  transform: scale(1.1);
}

.back-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #000 0%, transparent 60%);
}

.back-content {
  position: absolute;
  inset: 0;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  z-index: 5;
}

.back-icon-box {
  width: 50px;
  height: 50px;
  background: rgba(255, 94, 0, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 0.3s;
}

.flip-card-container:hover .back-icon-box,
.flip-card-container:active .back-icon-box {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.back-title {
  font-family: var(--font-accent);
  font-size: 1.5rem;
  font-weight: 950;
  color: #fff;
  margin-top: auto; /* Push to bottom like front hint area */
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
  transition-delay: 0.4s;
}

.flip-card-container:hover .back-title,
.flip-card-container:active .back-title {
  opacity: 1;
  transform: translateY(0);
}

.back-badge {
  font-family: var(--font-accent);
  font-size: 0.6rem;
  color: var(--primary-color);
  letter-spacing: 2px;
  margin-top: 0.5rem;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.5s ease;
  transition-delay: 0.5s;
}

.flip-card-container:hover .back-badge,
.flip-card-container:active .back-badge {
  opacity: 1;
  transform: translateY(0);
}

.flip-hint {
  margin-top: auto;
  font-family: var(--font-accent);
  font-size: 0.7rem;
  letter-spacing: 2px;
  color: var(--primary-color);
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.6;
}

.reason-icon {
  width: 60px;
  height: 60px;
  min-width: 60px; /* Force geometry */
  min-height: 60px;
  background: rgba(255, 94, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  margin-bottom: 2rem;
  flex-shrink: 0;
  border: 1px solid rgba(255, 94, 0, 0.2);
}

.flip-card__front h3 {
  font-family: var(--font-accent);
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #fff;
}

.flip-card__front p {
  color: #fff;
  opacity: 0.7;
  font-size: 0.95rem;
  line-height: 1.6;
}

.reg-steps {
  padding: 12rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 6rem;
}

.section-header p {
  color: #fff;
  opacity: 0.8;
  font-size: 1.1rem;
}

.title-tech {
  font-family: var(--font-accent);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 950;
  margin-bottom: 1rem;
  color: #fff;
}

.steps-path {
  display: flex;
  justify-content: center;
  gap: 3rem;
  position: relative;
}

.step-pillar {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1; /* Allow pillars to take equal space */
}

.step-card {
  position: relative;
  padding: 4rem 2.5rem;
  border-radius: 40px;
  text-align: center;
  height: 100%;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.1s ease-out, border-color 0.3s ease;
  overflow: hidden;
}

.step-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 94, 0, 0.1);
}

.step-header-context {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  flex-shrink: 0;
  background: var(--primary-color);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-accent);
  font-weight: 950;
  font-size: 0.9rem;
  box-shadow: 0 0 20px rgba(255, 94, 0, 0.4);
}

.step-icon-box {
  color: var(--primary-color);
  opacity: 0.9;
}

.step-title {
  position: relative;
  z-index: 2;
  font-family: var(--font-accent);
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #fff;
}

.step-desc {
  position: relative;
  z-index: 2;
  color: #fff;
  opacity: 0.85;
  margin-bottom: 2rem;
}

.step-details-clean {
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.4);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 94, 0, 0.15);
  width: 100%;
  margin-top: auto;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: center; /* CENTERED */
  gap: 1rem;
  margin-bottom: 0.8rem;
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  transition: all 0.2s;
  text-align: center;
}

.detail-row:hover {
  background: rgba(255, 94, 0, 0.08);
  transform: scale(1.02);
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-text {
  flex: 0 1 auto;
  line-height: 1.4;
}

.copy-hint {
  opacity: 0.3;
}

.detail-row:hover .copy-hint {
  opacity: 1;
}

.step-arrow {
  position: absolute;
  top: 50%;
  right: -12%;
  color: rgba(255, 94, 0, 0.2);
  transform: translateY(-50%) scale(1.5);
  pointer-events: none;
}

.form-chamber {
  padding: 4rem 0;
}

.glass-tech {
  background: rgba(10, 10, 10, 0.6);
  border: 2px solid rgba(255, 94, 0, 0.2);
  border-radius: 60px;
  padding: 6rem;
  backdrop-filter: blur(40px);
}

.form-header {
  text-align: center;
  margin-bottom: 5rem;
}

.chamber-badge {
  display: inline-block;
  font-family: var(--font-accent);
  font-size: 0.7rem;
  letter-spacing: 3px;
  color: #fff;
  opacity: 0.4;
  margin-bottom: 1.5rem;
}

.form-header h2 {
  font-family: var(--font-accent);
  font-size: 3rem;
  font-weight: 950;
  margin-bottom: 1rem;
  color: #fff;
}

.iframe-mockup {
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 6rem 2rem;
}

.mockup-content {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.icon-circle {
  width: 90px;
  height: 90px;
  min-width: 90px;
  min-height: 90px;
  flex-shrink: 0;
  background: rgba(255, 94, 0, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 3rem;
  border: 1px solid rgba(255, 94, 0, 0.1);
}

.mockup-content h3 {
  font-family: var(--font-accent);
  font-size: 1.8rem;
  font-weight: 900;
  margin: 2rem 0 1rem;
  color: #fff;
}

.mockup-content p {
  color: #fff;
  opacity: 0.7;
  margin-bottom: 3rem;
}

.btn-form {
  display: inline-flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--primary-color);
  color: #000;
  padding: 1.5rem 3rem;
  border-radius: 100px;
  font-family: var(--font-accent);
  font-weight: 950;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 40px rgba(255, 94, 0, 0.4);
}

.btn-form:hover {
  transform: scale(1.03);
}

.form-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-size: 0.8rem;
  margin-top: 3rem;
  color: var(--primary-color);
  font-weight: 700;
}

.form-footer {
  margin-top: 4rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 700;
}

.notice-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem 3rem;
  border-radius: 20px;
  background: rgba(255, 94, 0, 0.05);
  border: 1px solid rgba(255, 94, 0, 0.2);
}

.notice-card p {
  font-size: 0.95rem;
  color: #fff;
  opacity: 0.9;
}

/* RESPONSIVE DESIGN - MOBILE FIRST REFINEMENTS */
@media (max-width: 1200px) {
  .steps-path {
    gap: 1.5rem;
  }
  .step-arrow {
    display: none;
  }
}

@media (max-width: 1024px) {
  .reasons-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .steps-path {
    flex-direction: column;
    gap: 2rem;
  }

  .glass-tech {
    padding: 3rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .reg-hero {
    height: auto;
    min-height: 70vh;
    padding-top: 140px; /* More space for the fixed navbar */
    padding-bottom: 6rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .btn-back {
    top: 100px; /* Positioned below navbar */
    left: 2rem;
    font-size: 0.65rem;
    padding: 0.5rem 1.2rem;
  }

  .reg-title {
    font-size: clamp(3.5rem, 18vw, 5.5rem); /* Significantly larger */
    margin: 1rem 0 0.5rem;
    letter-spacing: -3px; /* Tighter for more impact */
    line-height: 0.85;
    text-transform: uppercase;
  }

  .reg-subtitle {
    font-size: 1.1rem;
    line-height: 1.4;
    margin-bottom: 2rem;
  }

  .reasons-grid {
    grid-template-columns: 1fr;
    margin-top: 0; /* Align with natural flow */
    gap: 2rem;
    padding-top: 2rem;
  }

  .flip-card-container {
    height: 350px; 
  }

  .reg-steps {
    padding: 6rem 0;
  }

  .title-tech {
    font-size: 2rem;
  }

  .step-card {
    padding: 3rem 1.5rem;
  }

  .step-title {
    font-size: 1.3rem;
  }

  .step-desc {
    font-size: 0.95rem;
  }

  .detail-row {
    font-size: 0.75rem;
    padding: 0.6rem;
  }

  .form-header h2 {
    font-size: 2.2rem;
  }

  .iframe-mockup {
    padding: 4rem 1rem;
  }

  .icon-circle {
    width: 70px;
    height: 70px;
    margin-bottom: 2rem;
  }

  .btn-form {
    width: 100%;
    padding: 1.2rem;
    font-size: 0.9rem;
    justify-content: center;
  }

  .notice-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .reg-title {
    font-size: 2.8rem;
  }
  
  .badge-elite {
    font-size: 0.6rem;
    letter-spacing: 1px;
  }

  .flip-card-container {
    height: 300px;
  }

  .step-card {
    border-radius: 25px;
  }

  .detail-text {
    word-break: break-all;
    font-size: 0.7rem;
  }
}

/* Disable Tilt on Mobile for better UX */
@media (hover: none) {
  .flip-card-container:active .flip-card {
    transform: rotateY(180deg);
  }
}
</style>
