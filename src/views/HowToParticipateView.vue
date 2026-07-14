<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Heart, 
  X, 
  ChevronRight,
  ChevronLeft
} from 'lucide-vue-next';
import { fetchGalleryPaginated } from '@/composables/useBackendApi';

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

const { t } = useI18n();

const localStaffImages = [
  img1, img2, img3, img4, imgChacas,
  img3_1, img3_2, img3_3, img3_4, img3_5, img3_6,
  img3_7, img3_8, img3_9, img3_10, img3_11, img3_12,
  img3_13, img3_14, img3_15, img3_16, img3_17, img3_18
].map((url, idx) => ({
  url,
  ...tributeTexts[idx % tributeTexts.length]
}));

// Remote backend images and pagination state
const remoteStaffImages = ref([]);
const remotePage = ref(1);
const remoteLastPage = ref(1);
const remoteTotal = ref(0);
const isFetchingRemote = ref(false);
const remoteFetchError = ref(false);

const staffImages = computed(() => {
  return [...localStaffImages, ...remoteStaffImages.value];
});

const doubledOrTripledImages = computed(() => {
  return [...staffImages.value, ...staffImages.value, ...staffImages.value];
});


const rolesList = [
  "APOYO TÁCTICO", "LOGÍSTICA DE PISTA", "PUNTO DE CONTROL", 
  "SEGURIDAD Y CONTROL", "ABASTECIMIENTO DE ALTURA", "SOPORTE MÉDICO",
  "FOTOGRAFÍA OFICIAL", "GUÍA DE RUTA EXTREMA"
];

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
    card.style.opacity = 1;
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
  }, 16);
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

const openLightbox = (idx) => {
  activeLightboxIdx.value = idx % staffImages.value.length;
  showLightbox.value = true;
};

const closeLightbox = () => {
  showLightbox.value = false;
};

const nextLightboxImage = () => {
  activeLightboxIdx.value = (activeLightboxIdx.value + 1) % staffImages.value.length;
};

const prevLightboxImage = () => {
  activeLightboxIdx.value = (activeLightboxIdx.value - 1 + staffImages.value.length) % staffImages.value.length;
};

// Remote background loading method
const loadRemoteImages = async (page = 1) => {
  if (isFetchingRemote.value) return;
  isFetchingRemote.value = true;
  remoteFetchError.value = false;
  try {
    const response = await fetchGalleryPaginated('staff', page, 12);
    remoteStaffImages.value = response.data || [];
    remotePage.value = response.pagination.currentPage || 1;
    remoteLastPage.value = response.pagination.lastPage || 1;
    remoteTotal.value = response.pagination.total || 0;
  } catch (error) {
    console.error('Failed to load remote staff images:', error);
    remoteFetchError.value = true;
  } finally {
    isFetchingRemote.value = false;
  }
};

const changeRemotePage = async (page) => {
  if (page < 1 || page > remoteLastPage.value || page === remotePage.value) return;
  await loadRemoteImages(page);
};

// Watch for changes in staffImages to reset carousel scroll position and layout transforms
watch(staffImages, () => {
  nextTick(() => {
    if (scrollContainer.value) {
      const singleThird = Math.round(scrollContainer.value.scrollWidth / 3);
      scrollContainer.value.scrollLeft = singleThird;
    }
    updateCardTransforms();
  });
}, { deep: true });

// Touch swipe gestures for mobile navigation
let touchStartX = 0;
let touchEndX = 0;

const onLightboxTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX;
};

const onLightboxTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const swipeThreshold = 50;
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
  
  // Load remote gallery images in the background
  loadRemoteImages(1);

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
    <!-- Decorative Grid Lines -->
    <div class="editorial-grid">
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
    </div>

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

      <!-- Large Watermark text -->
      <div class="hero-watermark font-podium">STAFF</div>
      
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
          <a href="https://wa.me/51983426996?text=Hola%2C%20me%20interesa%20unirme%20como%20voluntario%20o%20staff%20de%20Chacas%20Xtreme%20Race" target="_blank" rel="noopener noreferrer" class="whatsapp-btn-premium">
            <span class="btn-glow"></span>
            <span class="btn-text">UNIRSE AL GRUPO DE TRABAJO</span>
            <ChevronRight :size="18" class="arrow-icon" />
          </a>
        </div>
      </div>
    </section>

    <!-- 2. INTERACTIVE PHOTO ARCHIVE CAROUSEL -->
    <section class="staff-gallery-section">
      <div class="container section-heading reveal">
        <div class="heading-badge">GALERÍA DE OPERACIONES</div>
        <h2 class="heading-title font-podium">EL CORAZÓN DE <span class="primary-text">CHACAS</span></h2>
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
            <div class="card-image-wrap">
              <img :src="img.url" alt="Staff Volunteer Action" loading="lazy" />
              <div class="card-glow-overlay"></div>
            </div>
          </div>
        </div>
      </div>
 
      <div class="carousel-nav-hints">
        <span class="hint-drag">ARRASTRA O DESLIZA PARA EXPLORAR LAS IMÁGENES</span>
      </div>

      <!-- Cyberpunk Pagination Controls -->
      <div v-if="remoteLastPage > 1" class="gallery-pagination-wrapper">
        <button 
          class="pag-btn prev-page" 
          :disabled="remotePage === 1 || isFetchingRemote" 
          @click="changeRemotePage(remotePage - 1)"
          aria-label="Página anterior"
        >
          <ChevronLeft :size="16" />
        </button>
        
        <div class="pag-pages">
          <button 
            v-for="page in remoteLastPage" 
            :key="page" 
            class="pag-page-num" 
            :class="{ active: remotePage === page, loading: isFetchingRemote && remotePage === page }"
            :disabled="isFetchingRemote"
            @click="changeRemotePage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button 
          class="pag-btn next-page" 
          :disabled="remotePage === remoteLastPage || isFetchingRemote" 
          @click="changeRemotePage(remotePage + 1)"
          aria-label="Página siguiente"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </section>
 
    <!-- 4. FRIENDSHIP & TRIBUTE LIGHTBOX -->
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
          <div class="lightbox-ambient-bg" :style="{ backgroundImage: `url(${staffImages[activeLightboxIdx]?.url})` }"></div>
          <div class="lightbox-warm-leak"></div>
          
          <!-- Nav Buttons -->
          <button class="lightbox-nav prev" @click="prevLightboxImage" aria-label="Anterior">
            <ChevronLeft :size="24" />
          </button>
          <button class="lightbox-nav next" @click="nextLightboxImage" aria-label="Siguiente">
            <ChevronRight :size="24" />
          </button>
 
          <div class="lightbox-content-wrapper">
            <!-- Tribute Canvas Card -->
            <div class="tribute-canvas">
              <!-- Close Button inside the card to prevent status-bar overlay issues -->
              <button class="lightbox-close" @click="closeLightbox" aria-label="Cerrar">
                <X :size="20" />
              </button>
 
              <!-- Left side: The Photo in fine frame -->
              <div class="tribute-photo-frame">
                <img :src="staffImages[activeLightboxIdx]?.url" alt="Manka Riders Staff Action" />
                <div class="photo-fine-overlay">
                  <span class="photo-coord">[ LAT 09°15'0\"S // LON 77°22'0\"W ]</span>
                </div>
              </div>
              
              <!-- Right side: The Narrative Glassmorphism Dashboard -->
              <div class="tribute-narrative-card">
                <div class="narrative-header">
                  <!-- Friendship Union Emblem -->
                  <div class="unity-emblem">
                    <div class="emblem-ring-outer"></div>
                    <div class="emblem-ring-inner"></div>
                    <Heart class="emblem-heart" :size="16" />
                  </div>
                  
                  <div class="tribute-badge-label">
                    <span>{{ staffImages[activeLightboxIdx]?.tag || 'STAFF' }}</span>
                  </div>
                </div>
                
                <div class="narrative-body">
                  <h3 class="tribute-title font-podium">{{ staffImages[activeLightboxIdx]?.title || 'Staff Volunteer' }}</h3>
                  <div class="quote-container">
                    <span class="quote-mark">“</span>
                    <p class="tribute-quote">{{ staffImages[activeLightboxIdx]?.quote || staffImages[activeLightboxIdx]?.description || '' }}</p>
                  </div>
                </div>
                
                <div class="tribute-card-footer">
                  <div class="tribute-meta-item">
                    <span class="meta-label">COMUNIDAD</span>
                    <span class="meta-val primary-text">MANKA RIDERS</span>
                  </div>
                  <div class="tribute-meta-item">
                    <span class="meta-label">SECTOR</span>
                    <span class="meta-val">CHACAS, ANCASH</span>
                  </div>
                  <div class="tribute-meta-item">
                    <span class="meta-label">COMPROMISO</span>
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
  position: relative;
}

/* Background Grid Lines */
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

/* REVEAL TRANSITION */
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

/* 1. CINEMATIC HERO */
.elite-hero {
  position: relative;
  height: 90vh;
  display: flex;
  align-items: flex-end;
  padding-bottom: 4rem;
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
  height: 115%;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 1.8s ease-in-out;
  filter: contrast(1.05) brightness(0.85) saturate(0.9);
  animation: heroParallax linear both;
  animation-timeline: scroll();
  z-index: 1;
}

.bg-img.active {
  opacity: 0.82;
}

@keyframes heroParallax {
  from { transform: translateY(0); }
  to { transform: translateY(10%); }
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 94, 0, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 2;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #020202 12%, rgba(2, 2, 2, 0.2) 65%, rgba(2, 2, 2, 0.4) 100%);
  z-index: 3;
}

.hero-watermark {
  position: absolute;
  top: 15%;
  right: 5%;
  font-size: clamp(8rem, 22vw, 20rem);
  font-weight: 950;
  line-height: 0.8;
  color: rgba(255, 255, 255, 0.01);
  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.008);
  pointer-events: none;
  z-index: 2;
}

.elite-hero__content {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: clamp(1.5rem, 6vw, 6rem);
}

.hero-tag {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-family: var(--font-accent);
  font-weight: 850;
  font-size: 0.75rem;
  letter-spacing: 4px;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.hero-title {
  font-family: var(--font-podium);
  font-size: clamp(3.5rem, 9.5vw, 7.8rem);
  font-weight: 950;
  line-height: 0.9;
  letter-spacing: -2px;
  text-transform: uppercase;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.75);
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
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 580px;
  margin-top: 1.8rem;
  line-height: 1.7;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
}

.hero-actions {
  margin-top: 2.5rem;
}

/* Premium WhatsApp Capsule Button */
.whatsapp-btn-premium {
  position: relative;
  background: var(--primary-color);
  color: #000;
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.8rem;
  letter-spacing: 2px;
  padding: 1.25rem 2.5rem;
  border-radius: 100px;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 10px 30px rgba(255, 94, 0, 0.25);
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease-in-out;
}

.whatsapp-btn-premium:hover .btn-glow {
  transform: translateX(100%);
}

.whatsapp-btn-premium:hover {
  transform: scale(1.03) translateY(-2px);
  box-shadow: 0 15px 40px rgba(255, 94, 0, 0.45);
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.whatsapp-btn-premium:hover .arrow-icon {
  transform: translateX(4px);
}

/* 2. INTERACTIVE PHOTO CAROUSEL */
.staff-gallery-section {
  padding: 8rem 0;
  overflow: hidden;
  position: relative;
  width: 100%;
  z-index: 10;
}

.section-heading {
  text-align: center;
  margin-bottom: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.heading-badge {
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 800;
  letter-spacing: 3px;
  font-size: 0.7rem;
  margin-bottom: 1rem;
}

.heading-title {
  font-size: clamp(2.2rem, 5vw, 4rem);
  font-weight: 900;
  letter-spacing: -1px;
  margin-bottom: 1.2rem;
  line-height: 1;
}

.heading-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.05rem;
  max-width: 600px;
}

.carousel-viewport {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  display: flex;
  padding: 4rem 0;
  cursor: grab;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
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
  flex: 0 0 420px;
  height: 540px;
  transform-style: preserve-3d;
  will-change: transform;
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;
}

.staff-card-cyber {
  position: relative;
  background: rgba(10, 10, 10, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 0.5rem;
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.staff-card-cyber:hover {
  border-color: rgba(255, 94, 0, 0.25);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7),
              0 0 30px rgba(255, 94, 0, 0.05);
}

.card-image-wrap {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  background: #0a0a0a;
}

.card-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.05) saturate(0.85);
  transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.staff-card-cyber:hover .card-image-wrap img {
  transform: scale(1.06);
}

.card-glow-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 100%, rgba(255, 94, 0, 0.08), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.staff-card-cyber:hover .card-glow-overlay {
  opacity: 1;
}

.carousel-nav-hints {
  text-align: center;
  margin-top: 1.5rem;
  font-family: var(--font-accent);
  font-size: 0.65rem;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.25);
}

/* 4. TRIBUTE LIGHTBOX STYLES */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 2, 2, 0.98);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
}

/* Immersive Sunset Warm Backdrop */
.lightbox-ambient-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(60px) brightness(0.12) saturate(1.5);
  opacity: 0.9;
  z-index: 1;
  transition: background-image 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  pointer-events: none;
}

.lightbox-warm-leak {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 75% 20%, rgba(255, 94, 0, 0.14) 0%, transparent 60%),
              radial-gradient(circle at 25% 80%, rgba(251, 191, 36, 0.08) 0%, transparent 60%);
  pointer-events: none;
  z-index: 2;
  animation: pulseSunset 10s infinite alternate ease-in-out;
}

@keyframes pulseSunset {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}

.lightbox-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(15, 15, 15, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10005;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  backdrop-filter: blur(10px);
}

.lightbox-close:hover {
  background: var(--primary-color);
  color: #000;
  border-color: var(--primary-color);
  transform: rotate(90deg) scale(1.05);
  box-shadow: 0 0 15px rgba(255, 94, 0, 0.4);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  width: 50px;
  height: 50px;
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

.lightbox-nav.prev { left: 2.5rem; }
.lightbox-nav.next { right: 2.5rem; }

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
  background: rgba(8, 8, 8, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  max-width: 1000px;
  width: 90vw;
  box-shadow: 0 35px 70px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  transition: all 0.4s ease;
}

/* Photo Frame on Left */
.tribute-photo-frame {
  flex: 0 0 50%;
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

.photo-fine-overlay {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  pointer-events: none;
}

.photo-coord {
  font-family: monospace;
  font-size: 0.55rem;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
}

/* Glassmorphism Narrative Card on Right */
.tribute-narrative-card {
  flex: 1;
  padding: 4rem 3.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2.5rem;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.02) 100%);
}

.narrative-header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

/* Rotating Friendship / Unity Emblem */
.unity-emblem {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 94, 0, 0.05);
  border: 1px solid rgba(255, 94, 0, 0.2);
}

.emblem-ring-outer {
  position: absolute;
  inset: -3px;
  border: 1.5px dashed rgba(255, 94, 0, 0.25);
  border-radius: 50%;
  animation: rotateCounter 15s linear infinite;
}

.emblem-ring-inner {
  position: absolute;
  inset: 2px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}

.emblem-heart {
  color: var(--primary-color);
  animation: pulseHeart 2s infinite ease-in-out;
}

@keyframes rotateCounter {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes pulseHeart {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 1px var(--primary-color)); }
  50% { transform: scale(1.15); filter: drop-shadow(0 0 5px var(--primary-color)); }
}

.tribute-badge-label {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.4rem 0.9rem;
  border-radius: 100px;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 1.5px;
}

.tribute-title {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1.15;
  color: #fff;
  margin: 0;
  text-transform: uppercase;
}

.quote-container {
  position: relative;
  margin-top: 1.5rem;
}

.quote-mark {
  position: absolute;
  top: -2.5rem;
  left: -1rem;
  font-size: 5rem;
  font-family: serif;
  color: rgba(255, 94, 0, 0.15);
  line-height: 1;
  pointer-events: none;
}

.tribute-quote {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.75);
  font-style: italic;
  font-weight: 400;
  margin: 0;
  position: relative;
  z-index: 2;
}

.tribute-card-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1.8rem;
}

.tribute-meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.meta-label {
  font-family: var(--font-accent);
  font-size: 0.55rem;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 800;
}

.meta-val {
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
}

/* Transitions */
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
    transform: scale(0.96) translateY(12px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* RESPONSIVE SYSTEM */
@media (max-width: 1024px) {
  .lightbox-nav.prev { left: 1.5rem; }
  .lightbox-nav.next { right: 1.5rem; }
  .lightbox-nav { width: 44px; height: 44px; }
  .tribute-narrative-card { padding: 3rem 2.2rem; gap: 2rem; }
  .tribute-title { font-size: 1.8rem; }
}

@media (max-width: 900px) {
  .tribute-canvas {
    flex-direction: column;
    max-width: 480px;
    height: auto;
    max-height: 85vh;
    overflow-y: auto;
  }
  .tribute-photo-frame {
    flex: 0 0 auto;
    width: 100%;
  }
  .tribute-narrative-card {
    padding: 2.5rem 1.8rem;
  }
}

@media (max-width: 768px) {
  .elite-hero { height: auto; padding: 130px 0 50px; }
  .elite-hero__content {
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
  }
  .hero-title { letter-spacing: -2px; line-height: 0.95; }
  .hero-desc { font-size: 1.05rem; }
  
  .bg-gradient {
    background: linear-gradient(to top, #020202 8%, rgba(2, 2, 2, 0.4) 50%, rgba(2, 2, 2, 0.6) 98%),
                linear-gradient(to right, #020202 8%, rgba(2, 2, 2, 0.3) 50%, transparent 95%) !important;
  }
  .bg-img {
    opacity: 0;
  }
  .bg-img.active {
    opacity: 0.55;
  }
  .hero-watermark { display: none; }
  
  .staff-gallery-section { padding: 5rem 0; }
  .carousel-card {
    flex: 0 0 320px;
    height: 440px;
  }
  .carousel-track {
    gap: 1.8rem;
    padding: 0 calc(50vw - 160px);
  }
  .heading-title { font-size: 2.2rem; }
  .heading-subtitle { font-size: 0.95rem; }
  
  .lightbox-overlay { padding: 1rem; }
  .lightbox-nav { display: none; }
  .lightbox-close { 
    top: 1rem; 
    right: 1rem; 
    width: 38px; 
    height: 38px; 
  }
}

@media (max-width: 480px) {
  .hero-title { font-size: 3.2rem; }
  .carousel-card {
    flex: 0 0 270px;
    height: 370px;
  }
  .carousel-track {
    gap: 1.2rem;
    padding: 0 calc(50vw - 135px);
  }
  .tribute-canvas {
    border-radius: 16px;
  }
  .tribute-narrative-card {
    padding: 2rem 1.25rem;
    gap: 1.5rem;
  }
  .tribute-title {
    font-size: 1.4rem;
  }
  .tribute-quote {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  .tribute-card-footer {
    gap: 0.8rem;
    padding-top: 1.5rem;
  }
  .meta-val {
    font-size: 0.7rem;
  }
}

/* Cyberpunk Pagination Styles */
.gallery-pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 3rem;
  z-index: 15;
  position: relative;
}

.pag-btn {
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  backdrop-filter: blur(10px);
}

.pag-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(255, 94, 0, 0.1);
  box-shadow: 0 0 10px rgba(255, 94, 0, 0.2);
  transform: scale(1.05);
}

.pag-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pag-pages {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.pag-page-num {
  background: rgba(20, 20, 20, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.8rem;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.pag-page-num:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.pag-page-num.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #000;
  box-shadow: 0 0 15px rgba(255, 94, 0, 0.35);
  transform: translateY(-2px);
}

.pag-page-num.loading {
  animation: pagPulse 1.2s infinite ease-in-out;
}

@keyframes pagPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@media (max-width: 768px) {
  .gallery-pagination-wrapper {
    gap: 1rem;
    margin-top: 2rem;
  }
  .pag-btn {
    width: 36px;
    height: 36px;
  }
  .pag-page-num {
    min-width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
}
</style>
