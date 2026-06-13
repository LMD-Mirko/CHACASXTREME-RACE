<script setup>
import { useI18n } from 'vue-i18n';
import { ArrowRight } from 'lucide-vue-next';

const { t } = useI18n();
</script>

<template>
  <section class="about" id="sobre-nosotros">
    <div class="container about__grid">
      <!-- Image: slide in from left -->
      <div class="about__image-container entry-anim entry-anim--left">
        <div class="about__image-wrapper">
          <img
            src="@/assets/images/hero2.webp"
            alt="Manka Riders Competition"
            class="about__image"
            loading="lazy"
            decoding="async"
          />
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

.about__image-wrapper {
  position: relative;
  border-radius: 4px;
  overflow: visible;
}

.about__image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  filter: grayscale(0.2) contrast(1.1) brightness(0.9);
  transition: var(--transition-smooth);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.about__image-wrapper:hover .about__image {
  filter: grayscale(0) contrast(1.05) brightness(1);
  transform: scale(1.01);
  border-color: rgba(255, 94, 0, 0.2);
}

.about__experience-badge {
  position: absolute;
  bottom: -2rem;
  right: -2rem;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: white;
  padding: 1.2rem 1.8rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  border: 1px solid rgba(255, 94, 0, 0.35);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
}

.badge-border {
  position: absolute;
  inset: 2px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.about__experience-badge .number {
  font-size: 3rem;
  font-weight: 950;
  line-height: 1;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
}

.badge-text-group {
  display: flex;
  flex-direction: column;
}

.about__experience-badge .text-top {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.about__experience-badge .text-edition {
  font-size: 0.8rem;
  font-weight: 900;
  color: white;
  letter-spacing: 1px;
  margin-top: 0.2rem;
}

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
    margin: 0 auto;
    width: 100%;
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
    overflow: hidden;
    margin-bottom: 1.5rem;
  }

  .about__experience-badge {
    padding: 0.9rem 1.3rem;
    bottom: 0.75rem;
    right: 0.75rem;
  }

  .about__experience-badge .number {
    font-size: clamp(1.8rem, 5vw, 2.5rem);
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
    position: relative;
    bottom: auto;
    right: auto;
    margin-top: -2rem;
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
    max-width: 100%;
  }

  .about__image-wrapper {
    margin-bottom: 0.5rem;
  }
}
</style>

