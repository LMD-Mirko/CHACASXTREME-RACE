<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowRight } from 'lucide-vue-next';
import { gsap } from 'gsap';
import { fetchGalleryByType } from '@/composables/useBackendApi';

// Import image assets
import hero1 from '@/assets/images/hero1.webp';
import hero2 from '@/assets/images/hero2.webp';
import hero3 from '@/assets/images/hero3.webp';

const { t } = useI18n();

const localSlideImages = [hero2, hero1, hero3];
const remoteSlideImages = ref([]);
const slideImages = computed(() => {
  // combine remote + local, dedupe and ensure at least 3 images
  const merged = [...(remoteSlideImages.value || []), ...localSlideImages];
  const seen = new Set();
  const uniq = merged.filter((u) => {
    if (!u) return false;
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });

  // Return first 3 unique images (fill with local if needed)
  const result = uniq.slice(0, 3);
  while (result.length < 3) {
    result.push(localSlideImages[result.length % localSlideImages.length]);
  }
  return result;
});
const currentActive = ref(0);
const isHovered = ref(false);
const cardRefs = ref([]);
let cycleInterval = null;

const getResponsiveValues = () => {
  const isMobile = window.innerWidth < 768;
  return {
    middleX: isMobile ? 12 : 25,
    middleY: isMobile ? -6 : -12,
    middleRot: isMobile ? 2.2 : 3.5,
    backX: isMobile ? -10 : -22,
    backY: isMobile ? 6 : 12,
    backRot: isMobile ? -2.8 : -4.5,
    swipeX: isMobile ? -110 : -260,
    swipeY: isMobile ? -15 : -25
  };
};

const animateStack = (nextActive, immediate = false) => {
  const frontIdx = nextActive;
  const middleIdx = (nextActive + 1) % 3;
  const backIdx = (nextActive + 2) % 3;

  const hoverOffset = isHovered.value ? 1.5 : 1;
  const cfg = getResponsiveValues();

  // Front card animation
  if (cardRefs.value[frontIdx]) {
    gsap.to(cardRefs.value[frontIdx], {
      zIndex: 3,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      filter: 'grayscale(0) brightness(1)',
      duration: immediate ? 0 : 0.85,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  // Middle card animation
  if (cardRefs.value[middleIdx]) {
    gsap.to(cardRefs.value[middleIdx], {
      zIndex: 2,
      x: cfg.middleX * hoverOffset,
      y: cfg.middleY * hoverOffset,
      scale: 0.96,
      rotation: isHovered.value ? cfg.middleRot * 1.4 : cfg.middleRot,
      opacity: isHovered.value ? 0.85 : 0.65,
      filter: `grayscale(${isHovered.value ? 0.15 : 0.3}) brightness(${isHovered.value ? 0.85 : 0.65})`,
      duration: immediate ? 0 : 0.85,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  // Back card animation (the one swiping out)
  const backCard = cardRefs.value[backIdx];
  if (backCard) {
    if (immediate) {
      gsap.set(backCard, {
        zIndex: 1,
        x: cfg.backX * hoverOffset,
        y: cfg.backY * hoverOffset,
        scale: 0.92,
        rotation: isHovered.value ? cfg.backRot * 1.4 : cfg.backRot,
        opacity: isHovered.value ? 0.55 : 0.35,
        filter: `grayscale(${isHovered.value ? 0.3 : 0.5}) brightness(${isHovered.value ? 0.6 : 0.45})`
      });
    } else {
      const tl = gsap.timeline({ overwrite: 'auto' });
      tl.to(backCard, {
        zIndex: 4, // Keep it visually on top during swipe phase
        x: cfg.swipeX * hoverOffset,
        y: cfg.swipeY,
        rotation: -10,
        scale: 1.02,
        opacity: 0.9,
        duration: 0.35,
        ease: 'power2.out'
      })
      .call(() => {
        gsap.set(backCard, { zIndex: 1 });
      })
      .to(backCard, {
        x: cfg.backX * hoverOffset,
        y: cfg.backY * hoverOffset,
        rotation: isHovered.value ? cfg.backRot * 1.4 : cfg.backRot,
        scale: 0.92,
        opacity: isHovered.value ? 0.55 : 0.35,
        filter: `grayscale(${isHovered.value ? 0.3 : 0.5}) brightness(${isHovered.value ? 0.6 : 0.45})`,
        duration: 0.45,
        ease: 'power2.inOut'
      });
    }
  }
};

const handleMouseEnter = () => {
  isHovered.value = true;
  const middleIdx = (currentActive.value + 1) % 3;
  const backIdx = (currentActive.value + 2) % 3;
  const cfg = getResponsiveValues();

  if (cardRefs.value[middleIdx]) {
    gsap.to(cardRefs.value[middleIdx], {
      x: cfg.middleX * 1.5,
      y: cfg.middleY * 1.5,
      rotation: cfg.middleRot * 1.4,
      opacity: 0.85,
      filter: 'grayscale(0.15) brightness(0.85)',
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  if (cardRefs.value[backIdx]) {
    gsap.to(cardRefs.value[backIdx], {
      x: cfg.backX * 1.5,
      y: cfg.backY * 1.5,
      rotation: cfg.backRot * 1.4,
      opacity: 0.55,
      filter: 'grayscale(0.3) brightness(0.6)',
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }
};

const handleMouseLeave = () => {
  isHovered.value = false;
  const middleIdx = (currentActive.value + 1) % 3;
  const backIdx = (currentActive.value + 2) % 3;
  const cfg = getResponsiveValues();

  if (cardRefs.value[middleIdx]) {
    gsap.to(cardRefs.value[middleIdx], {
      x: cfg.middleX,
      y: cfg.middleY,
      rotation: cfg.middleRot,
      opacity: 0.65,
      filter: 'grayscale(0.3) brightness(0.65)',
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  if (cardRefs.value[backIdx]) {
    gsap.to(cardRefs.value[backIdx], {
      x: cfg.backX,
      y: cfg.backY,
      rotation: cfg.backRot,
      opacity: 0.35,
      filter: 'grayscale(0.5) brightness(0.45)',
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }
};

const loadAboutGallery = async () => {
  try {
    const [competidores, staff] = await Promise.all([
      fetchGalleryByType('competidores', 12),
      fetchGalleryByType('staff', 12)
    ]);

    const combined = [...(competidores || []), ...(staff || [])].filter(Boolean);
    // Merge remote with local, dedupe and store (we keep all remote but the computed will use first 3)
    const merged = [...combined, ...localSlideImages];
    const seen = new Set();
    const uniq = merged.filter((u) => {
      if (!u) return false;
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });

    if (uniq.length) {
      remoteSlideImages.value = uniq;
      animateStack(currentActive.value, true);
    }
  } catch (error) {
    console.warn('About section gallery unavailable:', error.message);
  }
};

onMounted(() => {
  // Initialize card positions with local content
  animateStack(currentActive.value, true);
  loadAboutGallery();

  // Rotate slide stack positions every 4 seconds
  cycleInterval = setInterval(() => {
    currentActive.value = (currentActive.value + 1) % slideImages.value.length;
    animateStack(currentActive.value);
  }, 4000);
});

onUnmounted(() => {
  if (cycleInterval) clearInterval(cycleInterval);
});
</script>

<template>
  <section class="about" id="sobre-nosotros">
    <div class="container about__grid">
      <!-- Overlapping Stacked Image Collage -->
      <div class="about__image-container entry-anim entry-anim--left">
        <div 
          class="about__image-wrapper stack-container"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <!-- Active cycling cards -->
          <div 
            v-for="(img, idx) in slideImages" 
            :key="idx"
            :ref="el => { if (el) cardRefs[idx] = el }"
            class="stack-card"
            :style="{ backgroundImage: `url(${img})` }"
          ></div>

          <!-- Slanted Experience Badge overlapping on top -->
          <div class="about__experience-badge">
            <div class="badge-border"></div>
            <span class="number font-podium">04</span>
            <div class="badge-text-group">
              <span class="text-top">{{ t('about.badge_text') }}</span>
              <span class="text-edition">EDICIÓN 2026</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Text: staggered slide from right via CSS -->
      <div class="about__text-content">
        <div class="section-tag-wrapper entry-anim entry-anim--right" style="--stagger: 0s">
          <span class="section-title font-inter">{{ t('about.section_title') }}</span>
          <div class="accent-line"></div>
        </div>
        
        <h3 class="about__subheadline font-podium entry-anim entry-anim--right" style="--stagger: 0.1s">{{ t('about.headline') }}</h3>
        
        <p class="about__description font-inter entry-anim entry-anim--right" style="--stagger: 0.2s" v-html="t('about.p1')"></p>
        <p class="about__description font-inter entry-anim entry-anim--right" style="--stagger: 0.28s" v-html="t('about.p2')"></p>
        
        <div class="about__stats entry-anim entry-anim--right" style="--stagger: 0.36s">
          <div class="stat-item">
            <span class="stat-number font-podium">03</span>
            <span class="stat-label font-inter">{{ t('about.events_label') }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number font-podium">3.3k</span>
            <span class="stat-label font-inter">ALTIMETRÍA</span>
          </div>
        </div>
        
        <button class="btn-more font-inter entry-anim entry-anim--right" style="--stagger: 0.44s">
          <span>{{ t('about.cta') }}</span>
          <ArrowRight :size="16" class="btn-icon" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  padding: var(--section-py) 0;
  background: var(--bg-color);
  position: relative;
  overflow: hidden;
}

.about::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 10% 20%, rgba(255, 94, 0, 0.03) 0%, transparent 60%);
  pointer-events: none;
}

.about__grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}

/* OVERLAPPING STACK CAROUSEL SYSTEM */
.stack-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  height: auto;
  overflow: visible;
  padding-right: 30px;
  padding-bottom: 20px;
}

.stack-card {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.55);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* EXPERIENCE BADGE OVERLAP */
.about__experience-badge {
  position: absolute;
  bottom: -1rem;
  right: 1rem;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid rgba(255, 94, 0, 0.35);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  z-index: 5;
}

.badge-border {
  position: absolute;
  inset: 2px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.about__experience-badge .number {
  font-size: 2rem;
  font-weight: 950;
  line-height: 1;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.badge-text-group {
  display: flex;
  flex-direction: column;
}

.about__experience-badge .text-top {
  font-size: 0.55rem;
  font-weight: 850;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.about__experience-badge .text-edition {
  font-size: 0.68rem;
  font-weight: 900;
  color: white;
  letter-spacing: 0.5px;
  margin-top: 0.1rem;
}

/* TEXT CONTENT */
.section-tag-wrapper {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: 4px;
  text-transform: uppercase;
}

.accent-line {
  flex-grow: 1;
  max-width: 80px;
  height: 1px;
  background: rgba(255, 94, 0, 0.5);
}

.about__subheadline {
  font-size: clamp(1.75rem, 4.5vw, 3.2rem);
  font-weight: 900;
  line-height: 0.95;
  margin-bottom: clamp(1.25rem, 3vw, 2rem);
  letter-spacing: -2px;
  color: white;
}

.about__description {
  font-size: 1.05rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.7;
  font-weight: 400;
}

.about__description :deep(strong) {
  color: white;
  font-weight: 600;
}

.about__stats {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  margin-top: 2.5rem;
  margin-bottom: 2.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 950;
  color: white;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.stat-divider {
  width: 1px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
}

.btn-more {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 1.1rem 2.5rem;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-radius: 4px;
  transition: var(--transition-smooth);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.btn-more::before {
  content: '';
  position: absolute;
  inset: 0;
  background: white;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.btn-more:hover {
  color: black;
  border-color: white;
}

.btn-more:hover::before {
  transform: scaleX(1);
  transform-origin: left;
}

.btn-icon {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-more:hover .btn-icon {
  transform: translateX(6px);
}

@media (max-width: 992px) {
  .about__grid {
    grid-template-columns: 1fr;
    gap: clamp(2.5rem, 6vw, 3.5rem);
  }
  
  .about__image-container {
    order: 2;
    max-width: 560px;
    margin: 3.5rem auto 0;
    width: 100%;
    padding: 0 24px;
    box-sizing: border-box;
  }
  
  .about__text-content {
    order: 1;
    text-align: center;
  }

  .section-tag-wrapper {
    justify-content: center;
  }

  .about__stats {
    justify-content: center;
  }

  .btn-more {
    width: 100%;
    justify-content: center;
  }

  .about__image-wrapper {
    margin-bottom: 1.5rem;
  }

  .about__experience-badge {
    padding: 0.5rem 0.8rem;
    bottom: 0.5rem;
    right: 0.5rem;
  }

  .about__experience-badge .number {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .about__description {
    font-size: clamp(0.92rem, 3.5vw, 1rem);
  }

  .about__stats {
    gap: 1.5rem;
    margin-top: 1.75rem;
    margin-bottom: 1.75rem;
  }

  .stat-divider {
    height: 40px;
  }

  .section-title {
    letter-spacing: 2.5px;
    font-size: 0.72rem;
  }

  .btn-more {
    padding: 1rem 1.5rem;
    font-size: 0.78rem;
    letter-spacing: 1.5px;
  }
}

@media (max-width: 480px) {
  .about__experience-badge {
    position: absolute;
    bottom: -0.75rem;
    right: 50%;
    transform: translateX(50%);
    margin: 0;
    width: max-content;
    padding: 0.4rem 0.7rem;
  }
  
  .about__experience-badge .number {
    font-size: 1.4rem;
  }
  
  .about__experience-badge .text-top {
    font-size: 0.48rem;
    letter-spacing: 1px;
  }
  
  .about__experience-badge .text-edition {
    font-size: 0.58rem;
    letter-spacing: 0.5px;
  }

  .about__image-wrapper {
    margin-bottom: 0.5rem;
  }
}
</style>
