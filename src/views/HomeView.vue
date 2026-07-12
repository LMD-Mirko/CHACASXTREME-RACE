<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HeroSlider from '@/features/landing/components/HeroSlider.vue';
import AboutSection from '@/features/landing/components/AboutSection.vue';
import ImageCarousel from '@/features/landing/components/ImageCarousel.vue';
import TheChallenge from '@/features/landing/components/TheChallenge.vue';
import ContactSection from '@/features/landing/components/ContactSection.vue';
import { useScrollReveal } from '@/composables/useScrollReveal';

const router = useRouter();
const showRiderListModal = ref(false);

useScrollReveal();

onMounted(() => {
  const hasShown = sessionStorage.getItem('extreme-modal-shown');
  if (!hasShown) {
    setTimeout(() => {
      showRiderListModal.value = true;
    }, 1000);
  }
});

const closeModal = () => {
  showRiderListModal.value = false;
  sessionStorage.setItem('extreme-modal-shown', 'true');
};

const goToEdition4 = () => {
  showRiderListModal.value = false;
  sessionStorage.setItem('extreme-modal-shown', 'true');
  router.push('/edicion-4#resultados');
};
</script>

<template>
  <main>
    <HeroSlider id="inicio" />
    <AboutSection id="sobre-nosotros" class="reveal-stagger" />
    <ImageCarousel id="galeria" class="reveal-stagger" />
    <TheChallenge id="participantes" class="reveal-stagger" />
    <ContactSection id="contacto" class="reveal-stagger" />

    <!-- Extreme Pop-up Modal -->
    <div v-if="showRiderListModal" class="extreme-modal-overlay" @click.self="closeModal">
      <div class="extreme-modal-card">
        <!-- Hazard Stripe Header Decor -->
        <div class="modal-hazard-tape">
          <div class="stripes-track"></div>
        </div>

        <div class="modal-body">
          <div class="modal-badge">EVENTO OFICIAL</div>
          <h2 class="modal-title font-podium">
            ¿QUIERES VER EL <span class="highlight">PADRÓN DE LA 4TA EDICIÓN</span>?
          </h2>
          <p class="modal-desc font-inter">
            Revisa el listado oficial de competidores inscritos y las estadísticas en tiempo real del evento de ciclismo de montaña definitivo.
          </p>

          <div class="modal-actions">
            <button @click="goToEdition4" class="modal-btn btn-confirm">
              <span>VER RESULTADOS Y PADRÓN</span>
              <span class="arrow-icon">🏁</span>
            </button>
            <button @click="closeModal" class="modal-btn btn-cancel">
              SEGUIR EN EL INICIO
            </button>
          </div>
        </div>

        <!-- Corner marks for premium industrial aesthetic -->
        <div class="corner-mark top-left"></div>
        <div class="corner-mark top-right"></div>
        <div class="corner-mark bottom-left"></div>
        <div class="corner-mark bottom-right"></div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.extreme-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: modal-fade-in 0.40s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.extreme-modal-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: radial-gradient(circle at 75% 20%, rgba(255, 94, 0, 0.08) 0%, transparent 60%),
              #0c0c0c;
  border: 1px solid rgba(255, 94, 0, 0.25);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7),
              0 0 30px rgba(255, 94, 0, 0.15);
  animation: modal-slide-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* Hazard Tape Header */
.modal-hazard-tape {
  height: 12px;
  background: #ff5e00;
  width: 100%;
  overflow: hidden;
}

.stripes-track {
  width: 200%;
  height: 100%;
  background: repeating-linear-gradient(
    -45deg,
    #000,
    #000 8px,
    #ff5e00 8px,
    #ff5e00 16px
  );
  animation: stripe-scroll 10s linear infinite;
}

@keyframes stripe-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.modal-body {
  padding: 2.2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.modal-badge {
  font-family: var(--font-accent, 'Inter', sans-serif);
  font-size: 0.72rem;
  font-weight: 900;
  color: #ff5e00;
  border: 1px solid rgba(255, 94, 0, 0.4);
  padding: 0.2rem 0.8rem;
  border-radius: 30px;
  letter-spacing: 2px;
  margin-bottom: 1.2rem;
  background: rgba(255, 94, 0, 0.05);
}

.modal-title {
  font-size: clamp(1.8rem, 5vw, 2.4rem);
  font-weight: 950;
  line-height: 1.05;
  color: #ffffff;
  margin-bottom: 1rem;
  letter-spacing: -1px;
}

.modal-title .highlight {
  color: #ff5e00;
  text-shadow: 0 0 15px rgba(255, 94, 0, 0.3);
}

.modal-desc {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
}

.modal-btn {
  font-family: var(--font-accent, 'Inter', sans-serif);
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 1.5px;
  padding: 0.9rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  text-transform: uppercase;
}

.btn-confirm {
  background: #ff5e00;
  color: #000;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 8px 20px rgba(255, 94, 0, 0.3);
}

.btn-confirm:hover {
  background: #ffffff;
  color: #000;
  box-shadow: 0 12px 25px rgba(255, 94, 0, 0.45);
  transform: translateY(-2px);
}

.btn-confirm .arrow-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.btn-confirm:hover .arrow-icon {
  transform: translateX(4px) scale(1.1);
}

.btn-cancel {
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-cancel:hover {
  color: #ffffff;
  border-color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

/* Corner marks */
.extreme-modal-card .corner-mark {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid #ff5e00;
  pointer-events: none;
  opacity: 0.7;
}

.extreme-modal-card .corner-mark.top-left { top: 16px; left: 16px; border-right: none; border-bottom: none; }
.extreme-modal-card .corner-mark.top-right { top: 16px; right: 16px; border-left: none; border-bottom: none; }
.extreme-modal-card .corner-mark.bottom-left { bottom: 16px; left: 16px; border-right: none; border-top: none; }
.extreme-modal-card .corner-mark.bottom-right { bottom: 16px; right: 16px; border-left: none; border-top: none; }

/* Keyframe Animations */
@keyframes modal-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
