<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Heart, 
  X, 
  ChevronRight,
  ChevronLeft
} from 'lucide-vue-next';

import imgStaffHero from '@/assets/images/staff .jpg';
import imgStaffHero1 from '@/assets/images/staff1.jpg';

const heroBackgrounds = [imgStaffHero, imgStaffHero1];
const currentHeroBgIdx = ref(0);
let heroBgInterval = null;

const textLine1Goal = "EL ALMA DE";
const textLine2Goal = "LA RUTA";
const currentTextLine1 = ref("");
const currentTextLine2 = ref("");

const typeText = async () => {
  currentTextLine1.value = "";
  currentTextLine2.value = "";
  
  // Type Line 1
  for (let i = 0; i <= textLine1Goal.length; i++) {
    currentTextLine1.value = textLine1Goal.slice(0, i);
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  // Type Line 2
  for (let i = 0; i <= textLine2Goal.length; i++) {
    currentTextLine2.value = textLine2Goal.slice(0, i);
    await new Promise(resolve => setTimeout(resolve, 180));
  }
  
  // Hold for 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Delete Line 2
  for (let i = textLine2Goal.length; i >= 0; i--) {
    currentTextLine2.value = textLine2Goal.slice(0, i);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Delete Line 1
  for (let i = textLine1Goal.length; i >= 0; i--) {
    currentTextLine1.value = textLine1Goal.slice(0, i);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Pause before typing again
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  typeText();
};

// Local Assets for Staff Gallery
import img1 from '@/assets/images/chacas /1.webp';
import img2 from '@/assets/images/chacas /2.webp';
import img3 from '@/assets/images/chacas /3.webp';
import img4 from '@/assets/images/chacas /4.webp';
import imgChacas from '@/assets/images/chacas /chacas.webp';

// Action Images from Folder 3
import img3_1 from '@/assets/images/chacas /3/X94A1553.webp';
import img3_2 from '@/assets/images/chacas /3/X94A1559.webp';
import img3_3 from '@/assets/images/chacas /3/X94A1561.webp';
import img3_4 from '@/assets/images/chacas /3/X94A1575.webp';
import img3_5 from '@/assets/images/chacas /3/X94A1598.webp';
import img3_6 from '@/assets/images/chacas /3/X94A1600.webp';
import img3_7 from '@/assets/images/chacas /3/X94A1617.webp';
import img3_8 from '@/assets/images/chacas /3/X94A1635.webp';
import img3_9 from '@/assets/images/chacas /3/X94A1650.webp';
import img3_10 from '@/assets/images/chacas /3/X94A1695.webp';
import img3_11 from '@/assets/images/chacas /3/X94A1757.webp';
import img3_12 from '@/assets/images/chacas /3/X94A1778.webp';
import img3_13 from '@/assets/images/chacas /3/X94A1796.webp';
import img3_14 from '@/assets/images/chacas /3/X94A1817.webp';
import img3_15 from '@/assets/images/chacas /3/X94A1861.webp';
import img3_16 from '@/assets/images/chacas /3/X94A1864.webp';
import img3_17 from '@/assets/images/chacas /3/X94A1869.webp';
import img3_18 from '@/assets/images/chacas /3/X94A1892.webp';

const { t } = useI18n();

const staffImages = [
  img1, img2, img3, img4, imgChacas,
  img3_1, img3_2, img3_3, img3_4, img3_5, img3_6,
  img3_7, img3_8, img3_9, img3_10, img3_11, img3_12,
  img3_13, img3_14, img3_15, img3_16, img3_17, img3_18
];

const doubledOrTripledImages = computed(() => {
  return [...staffImages, ...staffImages, ...staffImages];
});

const rolesList = [
  "APOYO TÁCTICO", "LOGÍSTICA DE PISTA", "PUNTO DE CONTROL", 
  "SEGURIDAD Y CONTROL", "ABASTECIMIENTO DE ALTURA", "SOPORTE MÉDICO",
  "FOTOGRAFÍA OFICIAL", "GUÍA DE RUTA EXTREMA"
];

const getRole = (idx) => {
  return rolesList[idx % rolesList.length];
};

const scrollContainer = ref(null);
const cardsRefs = ref([]);

const updateCardTransforms = () => {
  if (!scrollContainer.value) return;
  const containerRect = scrollContainer.value.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  const isMobile = window.innerWidth <= 768;

  cardsRefs.value.forEach((card) => {
    if (!card) return;
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    
    // Calculate distance from center of viewport (-1.5 to 1.5)
    const distanceFromCenter = (cardCenter - containerCenter) / (containerRect.width / 2);
    
    // Clamp to range
    const clampedDistance = Math.min(Math.max(distanceFromCenter, -1.8), 1.8);
    
    // 3D rotation angle based on distance (softer on mobile)
    const rotateY = clampedDistance * (isMobile ? -8 : -15);
    
    // SIDES LARGER, CENTER SMALLER (adjusted dynamically on mobile to prevent overlaps)
    const baseScale = isMobile ? 0.92 : 0.85;
    const maxScaleAdd = isMobile ? 0.12 : 0.3;
    const scaleFactor = isMobile ? 0.12 : 0.22;
    const scale = baseScale + Math.min(Math.abs(clampedDistance) * scaleFactor, maxScaleAdd);
    const translateZ = (1.5 - Math.abs(clampedDistance)) * (isMobile ? -25 : -60);
    
    // Apply transform
    card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`;
    card.style.opacity = 1; // Keep images fully visible
  });
};

// Autoplay loop setup
let autoplayInterval = null;
let isUserInteracting = false;
let interactionTimeout = null;

const handleUserInteraction = () => {
  isUserInteracting = true;
  if (interactionTimeout) clearTimeout(interactionTimeout);
  interactionTimeout = setTimeout(() => {
    isUserInteracting = false;
  }, 3500); // Resume auto scroll 3.5 seconds after last interaction
};

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    if (isUserInteracting || isDragging || !scrollContainer.value) return;
    scrollContainer.value.scrollLeft += 1.2;
  }, 16); // Smooth ~60fps autoplay scroll
};

const stopAutoplay = () => {
  if (autoplayInterval) clearInterval(autoplayInterval);
};

// Mouse Drag scroll emulation for desktop
let isDragging = false;
let startX = 0;
let scrollLeft = 0;

const onMouseDown = (e) => {
  handleUserInteraction();
  isDragging = true;
  scrollContainer.value.classList.add('dragging');
  startX = e.pageX - scrollContainer.value.offsetLeft;
  scrollLeft = scrollContainer.value.scrollLeft;
};

const onMouseMove = (e) => {
  if (!isDragging) return;
  handleUserInteraction();
  e.preventDefault();
  const x = e.pageX - scrollContainer.value.offsetLeft;
  const walk = (x - startX) * 1.5;
  scrollContainer.value.scrollLeft = scrollLeft - walk;
};

const onMouseUpOrLeave = () => {
  isDragging = false;
  if (scrollContainer.value) {
    scrollContainer.value.classList.remove('dragging');
  }
};

const onScroll = () => {
  if (!scrollContainer.value) return;
  const container = scrollContainer.value;
  const singleThird = Math.round(container.scrollWidth / 3);
  
  if (container.scrollLeft >= singleThird * 2) {
    container.scrollLeft -= singleThird;
  } else if (container.scrollLeft <= 0) {
    container.scrollLeft += singleThird;
  }
  
  updateCardTransforms();
};



// Lightbox logic
const showLightbox = ref(false);
const activeLightboxIdx = ref(0);

const tributeTexts = [
  {
    title: "La Unión en las Cumbres",
    quote: "En el punto más alto de la cordillera, la fuerza del viento se supera con la sonrisa y el apoyo de un compañero de ruta.",
    tag: "AMISTAD Y CONFIANZA"
  },
  {
    title: "Logística con Pasión",
    quote: "No es solo entregar agua o asistencia; es transmitir al ciclista que hay toda una familia cuidando sus pasos.",
    tag: "EQUIPO DE CORAZÓN"
  },
  {
    title: "Hermandad Manka Riders",
    quote: "Nuestra pasión por las dos ruedas nos unió, pero el Chacas Xtreme nos convirtió en una hermandad indomable.",
    tag: "LEALTAD EN RUTA"
  },
  {
    title: "El Alma Detrás del Evento",
    quote: "Cada voluntario dona su tiempo y su energía con un único propósito: ver a otros conquistar sus propios imposibles.",
    tag: "ENTREGA ABSOLUTA"
  },
  {
    title: "Seguridad y Compañerismo",
    quote: "Cuidar la ruta es un compromiso silencioso. Nos respaldamos mutuamente para que cada rider regrese a casa con gloria.",
    tag: "CUIDADO MUTUO"
  },
  {
    title: "Risas en la Adversidad",
    quote: "Incluso bajo la lluvia o el frío andino, el staff siempre tiene una palabra de aliento y un abrazo listo para calentar el alma.",
    tag: "ESPÍRITU INQUEBRANTABLE"
  },
  {
    title: "Legado de Chacas",
    quote: "Hacemos esto de forma 100% gratuita por el amor a nuestro pueblo, a nuestras montañas y a esta hermosa comunidad ciclista.",
    tag: "AMOR POR LA TIERRA"
  },
  {
    title: "Guardias del Camino",
    quote: "Vigilando los senderos más duros de los Andes, la verdadera recompensa es el saludo sincero y el agradecimiento del competidor.",
    tag: "OROPEL DE LA RUTA"
  }
];

const getTributeData = (idx) => {
  return tributeTexts[idx % tributeTexts.length];
};

const openLightbox = (idx) => {
  activeLightboxIdx.value = idx % staffImages.length;
  showLightbox.value = true;
};

const closeLightbox = () => {
  showLightbox.value = false;
};

const nextLightboxImage = () => {
  activeLightboxIdx.value = (activeLightboxIdx.value + 1) % staffImages.length;
};

const prevLightboxImage = () => {
  activeLightboxIdx.value = (activeLightboxIdx.value - 1 + staffImages.length) % staffImages.length;
};

// Touch swipe gestures for mobile navigation
let touchStartX = 0;
let touchEndX = 0;

const onLightboxTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX;
};

const onLightboxTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const swipeThreshold = 50; // pixels
  if (touchEndX < touchStartX - swipeThreshold) {
    nextLightboxImage();
  } else if (touchEndX > touchStartX + swipeThreshold) {
    prevLightboxImage();
  }
};

const handleKeyDown = (e) => {
  if (!showLightbox.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextLightboxImage();
  if (e.key === 'ArrowLeft') prevLightboxImage();
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

  heroBgInterval = setInterval(() => {
    currentHeroBgIdx.value = (currentHeroBgIdx.value + 1) % heroBackgrounds.length;
  }, 6000);

  typeText();

  setTimeout(() => {
    if (scrollContainer.value) {
      const singleThird = Math.round(scrollContainer.value.scrollWidth / 3);
      scrollContainer.value.scrollLeft = singleThird;
    }
    updateCardTransforms();
  }, 150);
  window.addEventListener('resize', updateCardTransforms);
  window.addEventListener('keydown', handleKeyDown);
  
  startAutoplay();
});

onUnmounted(() => {
  if (heroBgInterval) clearInterval(heroBgInterval);
  window.removeEventListener('resize', updateCardTransforms);
  window.removeEventListener('keydown', handleKeyDown);
  stopAutoplay();
});
</script>

<template>
  <div class="elite-participate">
    <!-- 1. CINEMATIC HERO -->
    <section class="elite-hero">
      <div class="elite-hero__bg">
        <div class="bg-pattern"></div>
        <div class="bg-gradient"></div>
        <img 
          v-for="(bg, idx) in heroBackgrounds"
          :key="idx"
          :src="bg"
          alt="Staff Background"
          class="bg-img"
          :class="{ active: currentHeroBgIdx === idx }"
        />
      </div>
      
      <div class="container elite-hero__content">
        <div class="hero-tag reveal">
          <Heart :size="14" class="primary-text" /> {{ t('participate.gallery.badge') }}
        </div>
        <h1 class="hero-title reveal">
          {{ currentTextLine1 }}<br />
          <span class="text-outline">{{ currentTextLine2 }}</span><span class="type-cursor">_</span>
        </h1>
        <p class="hero-desc reveal">
          Detrás de cada cumbre conquistada y cada récord batido, hay un equipo incansable. Un homenaje a nuestro staff y voluntarios locales que operan el evento de manera 100% gratuita, con pura pasión y de corazón.
        </p>
        <div class="hero-actions reveal">
          <a href="https://chat.whatsapp.com/placeholder" target="_blank" rel="noopener noreferrer" class="btn-primary">
            UNIRSE AL EQUIPO <ChevronRight :size="16" />
          </a>
        </div>
      </div>
    </section>

    <!-- 2. CYBER-TACTICAL GALLERY CAROUSEL -->
    <section class="staff-gallery-section">
      <div class="container section-heading reveal">
        <div class="heading-badge">TACTICAL ARCHIVE</div>
        <h2 class="heading-title">OPERACIONES EN <span class="primary-text">RUTA</span></h2>
        <p class="heading-subtitle">Archivo fotográfico de la tripulación en cumbres, abastecimiento y logística de seguridad.</p>
      </div>

      <!-- Edge to Edge Carousel Track -->
      <div 
        ref="scrollContainer"
        class="carousel-viewport"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUpOrLeave"
        @mouseleave="onMouseUpOrLeave"
        @touchstart="handleUserInteraction"
        @scroll="onScroll"
      >
        <div class="carousel-track">
          <div 
            v-for="(img, idx) in doubledOrTripledImages" 
            :key="idx" 
            :ref="el => { if (el) cardsRefs[idx] = el }"
            class="staff-card-cyber carousel-card"
            @click="openLightbox(idx)"
          >
            <!-- Tactical Brackets -->
            <div class="tech-bracket top-left"></div>
            <div class="tech-bracket top-right"></div>
            <div class="tech-bracket bottom-left"></div>
            <div class="tech-bracket bottom-right"></div>

            <div class="card-image-wrap">
              <img :src="img" alt="Staff Volunteer Action" loading="lazy" />
              <div class="card-scanline"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="carousel-nav-hints">
        <span class="hint-drag">ARRASTRA O DESLIZA PARA EXPLORAR</span>
      </div>
    </section>

    <!-- Registration modal removed as WhatsApp group link is used directly -->

    <!-- 4. ELABORATE FRIENDSHIP & TRIBUTE LIGHTBOX -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div 
          v-if="showLightbox" 
          class="lightbox-overlay" 
          @click.self="closeLightbox"
          @touchstart="onLightboxTouchStart"
          @touchend="onLightboxTouchEnd"
        >
          <!-- Ambient Blurred Backdrop Photo for Emotional Depth -->
          <div class="lightbox-ambient-bg" :style="{ backgroundImage: `url(${staffImages[activeLightboxIdx]})` }"></div>
          <div class="lightbox-warm-leak"></div>
          
          <!-- Nav Buttons -->
          <button class="lightbox-nav prev" @click="prevLightboxImage">
            <ChevronLeft :size="30" />
          </button>
          <button class="lightbox-nav next" @click="nextLightboxImage">
            <ChevronRight :size="30" />
          </button>

          <div class="lightbox-content-wrapper">
            <!-- Tribute Canvas Card -->
            <div class="tribute-canvas">
              <!-- Close Button inside the card to align perfectly on all screens -->
              <button class="lightbox-close" @click="closeLightbox" aria-label="Cerrar">
                <X :size="20" />
              </button>

              <!-- Left side: The Photo -->
              <div class="tribute-photo-frame">
                <img :src="staffImages[activeLightboxIdx]" alt="Manka Riders Staff Action" />
                <div class="lightbox-scanlines"></div>
              </div>
              
              <!-- Right side: The Narrative -->
              <div class="tribute-narrative-card">
                <!-- Corner brackets -->
                <div class="hud-bracket top-left"></div>
                <div class="hud-bracket top-right"></div>
                <div class="hud-bracket bottom-left"></div>
                <div class="hud-bracket bottom-right"></div>

                <div class="tribute-card-header">
                  <div class="tribute-heart-badge">
                    <Heart class="heart-pulse-icon" :size="14" />
                    <span>{{ getTributeData(activeLightboxIdx).tag }}</span>
                  </div>
                  <h3 class="tribute-title">{{ getTributeData(activeLightboxIdx).title }}</h3>
                </div>
                
                <div class="tribute-quote-body">
                  <p class="tribute-quote">"{{ getTributeData(activeLightboxIdx).quote }}"</p>
                </div>
                
                <div class="tribute-card-footer">
                  <div class="tribute-meta-item">
                    <span class="meta-label">COMUNIDAD</span>
                    <span class="meta-val font-accent primary-text">MANKA RIDERS</span>
                  </div>
                  <div class="tribute-meta-item">
                    <span class="meta-label">UBICACIÓN</span>
                    <span class="meta-val">CHACAS, ANCASH</span>
                  </div>
                  <div class="tribute-meta-item">
                    <span class="meta-label">PASIÓN</span>
                    <span class="meta-val">100% CORAZÓN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.elite-participate {
  background: #020202;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 8rem;
  overflow-x: hidden;
}

/* 1. CINEMATIC HERO */
.elite-hero {
  position: relative;
  height: 92vh;
  display: flex;
  align-items: flex-end;
  padding-bottom: 1rem;
  overflow: hidden;
}

.elite-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 120%;
  object-fit: cover;
  object-position: left center;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
  filter: contrast(1.05) brightness(0.9);
  animation: heroParallax linear both;
  animation-timeline: scroll();
  z-index: 1;
}

.bg-img.active {
  opacity: 0.75;
}

@keyframes heroParallax {
  from { transform: translateY(0); }
  to { transform: translateY(12%); }
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 94, 0, 0.08) 1px, transparent 1px);
  background-size: 30px 30px;
  z-index: 2;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #020202 2%, rgba(2, 2, 2, 0.05) 50%, rgba(2, 2, 2, 0.4) 100%),
              linear-gradient(to right, #020202 15%, rgba(2, 2, 2, 0.1) 45%, transparent 80%);
  z-index: 3;
}

.elite-hero__content {
  position: relative;
  z-index: 10;
  max-width: 100% !important;
  margin-left: 0 !important;
  padding-left: clamp(1.5rem, 6vw, 7rem) !important;
}

.hero-tag {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-family: var(--font-accent);
  font-weight: 850;
  font-size: 0.8rem;
  letter-spacing: 4px;
  margin-bottom: 2rem;
}

.hero-title {
  font-family: var(--font-accent);
  font-size: clamp(3.5rem, 10vw, 8.5rem);
  font-weight: 950;
  line-height: 0.85;
  letter-spacing: -5px;
}

.text-outline {
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.25);
  color: transparent;
}

.type-cursor {
  display: inline-block;
  color: var(--primary-color);
  margin-left: 6px;
  animation: cursorBlink 0.9s infinite;
  font-weight: 300;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.hero-desc {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin-top: 2rem;
  line-height: 1.7;
}

.hero-actions {
  margin-top: 3rem;
}

.btn-primary {
  background: var(--primary-color);
  color: #000;
  font-family: var(--font-accent);
  font-weight: 950;
  font-size: 0.85rem;
  letter-spacing: 1.5px;
  padding: 1.3rem 2.8rem;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 10px 30px rgba(255, 94, 0, 0.3);
  transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

.btn-primary:hover {
  transform: scale(1.04) translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 94, 0, 0.45);
}

/* 2. CYBER-TACTICAL GALLERY CAROUSEL */
.staff-gallery-section {
  padding: 8rem 0;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.section-heading {
  text-align: center;
  margin-bottom: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.heading-badge {
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 900;
  letter-spacing: 4px;
  font-size: 0.75rem;
  margin-bottom: 1.2rem;
  border-bottom: 1px dashed var(--primary-color);
  padding-bottom: 0.3rem;
}

.heading-title {
  font-family: var(--font-accent);
  font-size: clamp(2.2rem, 5vw, 4.2rem);
  font-weight: 950;
  letter-spacing: -2px;
  margin-bottom: 1.2rem;
  line-height: 1;
}

.heading-subtitle {
  color: rgba(255, 255, 255, 0.55);
  font-size: 1.1rem;
  max-width: 600px;
}

.carousel-viewport {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  display: flex;
  padding: 5rem 0;
  cursor: grab;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: none;
  scrollbar-width: none;
}

.carousel-viewport::-webkit-scrollbar {
  display: none;
}

.carousel-viewport.dragging {
  cursor: grabbing;
}

.carousel-track {
  display: flex;
  gap: 3.5rem;
  padding: 0 calc(50vw - 220px);
}

.carousel-card {
  flex: 0 0 440px;
  height: 580px;
  transform-style: preserve-3d;
  will-change: transform, opacity;
  transition: transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.4s ease, background 0.4s ease;
}

.carousel-nav-hints {
  text-align: center;
  margin-top: 2.5rem;
  font-family: var(--font-accent);
  font-size: 0.7rem;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
}

.staff-card-cyber {
  position: relative;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 0.4rem;
  overflow: hidden;
  transition: all 0.45s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
}

.staff-card-cyber:hover {
  border-color: var(--primary-color);
  background: rgba(255, 94, 0, 0.03);
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6),
              0 0 20px rgba(255, 94, 0, 0.08);
}

.card-image-wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: #111;
}

.card-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.05) saturate(0.9);
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

.staff-card-cyber:hover .card-image-wrap img {
  transform: scale(1.08);
}

.card-scanline {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 90%,
    rgba(255, 94, 0, 0.08) 95%,
    transparent 100%
  );
  background-size: 100% 8px;
  pointer-events: none;
  opacity: 0.45;
}

/* Tech Brackets */
.tech-bracket {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  pointer-events: none;
  transition: border-color 0.4s ease;
}

.staff-card-cyber:hover .tech-bracket {
  border-color: var(--primary-color);
}

.tech-bracket.top-left { top: 8px; left: 8px; border-right: none; border-bottom: none; }
.tech-bracket.top-right { top: 8px; right: 8px; border-left: none; border-bottom: none; }
.tech-bracket.bottom-left { bottom: 8px; left: 8px; border-right: none; border-top: none; }
.tech-bracket.bottom-right { bottom: 8px; right: 8px; border-left: none; border-top: none; }

/* 4. ELABORATE FRIENDSHIP & TRIBUTE LIGHTBOX STYLES */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 2, 2, 0.97);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
}

.lightbox-ambient-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(50px) brightness(0.2) saturate(1.4);
  opacity: 0.9;
  z-index: 1;
  transition: background-image 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  pointer-events: none;
}

.lightbox-warm-leak {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255, 94, 0, 0.12) 0%, transparent 60%),
              radial-gradient(circle at 20% 80%, rgba(255, 184, 0, 0.08) 0%, transparent 60%);
  pointer-events: none;
  z-index: 2;
}

.lightbox-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.85);
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10005;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.lightbox-close:hover {
  background: var(--primary-color);
  color: #000;
  border-color: var(--primary-color);
  transform: rotate(90deg) scale(1.05);
  box-shadow: 0 0 15px var(--primary-color);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(10, 10, 10, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10002;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.lightbox-nav:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(255, 94, 0, 0.1);
  box-shadow: 0 0 15px rgba(255, 94, 0, 0.2);
}

.lightbox-nav.prev {
  left: 2.5rem;
}

.lightbox-nav.next {
  right: 2.5rem;
}

.lightbox-content-wrapper {
  position: relative;
  z-index: 10001;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tribute-canvas {
  position: relative;
  display: flex;
  flex-direction: row;
  background: rgba(10, 10, 10, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
  max-width: 1050px;
  width: 90vw;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.8),
              0 0 40px rgba(255, 94, 0, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.4s ease;
}

.tribute-photo-frame {
  flex: 0 0 52%;
  position: relative;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tribute-photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 4/3;
  display: block;
}

.tribute-narrative-card {
  flex: 1;
  padding: 3.5rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.02) 100%);
}

.tribute-heart-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 94, 0, 0.1);
  border: 1px solid rgba(255, 94, 0, 0.25);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 100px;
  font-family: var(--font-accent);
  font-weight: 850;
  font-size: 0.7rem;
  letter-spacing: 2px;
  width: max-content;
}

.heart-pulse-icon {
  animation: heartBeat 1.4s infinite ease-in-out;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}

.tribute-title {
  font-family: var(--font-accent);
  font-size: 2.2rem;
  font-weight: 950;
  letter-spacing: -1px;
  line-height: 1.15;
  margin-top: 1.2rem;
  color: #fff;
}

.tribute-quote-body {
  position: relative;
  padding-left: 1.5rem;
  border-left: 2px solid var(--primary-color);
}

.tribute-quote {
  font-size: 1.15rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  font-style: italic;
  font-weight: 400;
}

.tribute-card-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 2rem;
}

.tribute-meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.meta-label {
  font-family: var(--font-accent);
  font-size: 0.6rem;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 800;
}

.meta-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

/* Lightbox Transitions */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

.lightbox-fade-enter-active .tribute-canvas {
  animation: hudSlideIn 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes hudSlideIn {
  from {
    transform: scale(0.95) translateY(15px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.lightbox-scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 92%,
    rgba(255, 94, 0, 0.03) 96%,
    transparent 100%
  );
  background-size: 100% 10px;
  pointer-events: none;
  opacity: 0.4;
}

/* HUD Brackets inside lightbox */
.hud-bracket {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1.5px solid rgba(255, 94, 0, 0.3);
  pointer-events: none;
}

.hud-bracket.top-left { top: 15px; left: 15px; border-right: none; border-bottom: none; }
.hud-bracket.top-right { top: 15px; right: 15px; border-left: none; border-bottom: none; }
.hud-bracket.bottom-left { bottom: 15px; left: 15px; border-right: none; border-top: none; }
.hud-bracket.bottom-right { bottom: 15px; right: 15px; border-left: none; border-top: none; }

@media (min-width: 901px) {
  /* Hide top-right bracket on desktop to make space for close button */
  .tribute-narrative-card .hud-bracket.top-right {
    display: none;
  }
}

@media (max-width: 1024px) {
  .lightbox-nav.prev { left: 1.5rem; }
  .lightbox-nav.next { right: 1.5rem; }
  .lightbox-nav { width: 50px; height: 50px; }
  .tribute-narrative-card { padding: 2.5rem 2rem; gap: 1.5rem; }
  .tribute-title { font-size: 1.8rem; }
}

@media (max-width: 900px) {
  .tribute-canvas {
    flex-direction: column;
    max-width: 500px;
    height: auto;
    max-height: 85vh;
    overflow-y: auto;
  }
  .tribute-photo-frame {
    flex: 0 0 auto;
    width: 100%;
  }
  .tribute-narrative-card {
    padding: 2.2rem 1.8rem;
  }
}

@media (max-width: 768px) {
  .lightbox-overlay { padding: 1rem; }
  .lightbox-nav { display: none; }
  .lightbox-close { 
    top: 1rem; 
    right: 1rem; 
    width: 38px; 
    height: 38px; 
    background: rgba(0, 0, 0, 0.7);
    border-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
}

@media (max-width: 480px) {
  .lightbox-overlay { padding: 0.5rem; }
  .lightbox-close {
    top: 0.75rem;
    right: 0.75rem;
  }
  .tribute-canvas {
    border-radius: 12px;
  }
  .tribute-narrative-card {
    padding: 1.8rem 1.2rem;
    gap: 1.2rem;
  }
  .tribute-title {
    font-size: 1.5rem;
  }
  .tribute-quote {
    font-size: 1rem;
    line-height: 1.5;
  }
  .tribute-card-footer {
    gap: 0.8rem;
    padding-top: 1.5rem;
  }
  .meta-val {
    font-size: 0.75rem;
  }
}

/* REVEAL COMPONENT TRANSITIONS */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

.primary-text {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .elite-hero { height: auto; padding: 140px 0 60px; }
  .elite-hero__content {
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
  }
  .bg-gradient {
    background: linear-gradient(to top, #020202 8%, rgba(2, 2, 2, 0.45) 50%, rgba(2, 2, 2, 0.6) 98%),
                linear-gradient(to right, #020202 8%, rgba(2, 2, 2, 0.3) 50%, transparent 95%) !important;
  }
  .bg-img {
    opacity: 0;
    object-position: left 15% center;
  }
  .bg-img.active {
    opacity: 0.65;
  }
  .hero-title { letter-spacing: -3px; line-height: 0.9; margin-bottom: 2rem; }
  .hero-desc { font-size: 1.1rem; }
  
  .staff-gallery-section { padding: 5rem 0; }
  .carousel-card {
    flex: 0 0 340px;
    height: 460px;
  }
  .carousel-track {
    gap: 1.8rem;
    padding: 0 calc(50vw - 170px);
  }
  .heading-title { font-size: 2.2rem; }
  .heading-subtitle { font-size: 1rem; }
}

@media (max-width: 480px) {
  .hero-title { font-size: 3.5rem; }
  .carousel-card {
    flex: 0 0 280px;
    height: 380px;
  }
  .carousel-track {
    gap: 1.2rem;
    padding: 0 calc(50vw - 140px);
  }
}
</style>
