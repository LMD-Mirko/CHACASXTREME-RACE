<script setup>
import { onMounted, ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useI18n } from 'vue-i18n';

gsap.registerPlugin(ScrollTrigger);

const { t } = useI18n();
const sectionRef = ref(null);
const imageRef = ref(null);
const textRef = ref(null);

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
    }
  });

  tl.from(imageRef.value, {
    x: -100,
    opacity: 0,
    duration: 1.2,
    ease: 'power4.out'
  })
  .from(textRef.value.children, {
    x: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power4.out'
  }, '-=0.8');
});
</script>

<template>
  <section class="about" id="sobre-nosotros" ref="sectionRef">
    <div class="container about__grid">
      <div class="about__image-container" ref="imageRef">
        <div class="about__image-wrapper">
          <img src="@/assets/images/hero2.jpg" alt="Manka Riders Competition" class="about__image" />
          <div class="about__experience-badge">
            <span class="number">1+</span>
            <span class="text">{{ t('about.badge_text') }}</span>
          </div>
        </div>
      </div>
      
      <div class="about__text-content" ref="textRef">
        <h2 class="section-title">{{ t('about.section_title') }}</h2>
        <div class="accent-line"></div>
        <h3 class="about__subheadline">{{ t('about.headline') }}</h3>
        <p class="about__description" v-html="t('about.p1')"></p>
        <p class="about__description" v-html="t('about.p2')"></p>
        <div class="about__stats">
          <div class="stat-item">
            <span class="stat-number">3</span>
            <span class="stat-label">{{ t('about.events_label') }}</span>
          </div>
        </div>
        <button class="btn-more">{{ t('about.cta') }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  padding: 10rem 0;
  background: var(--bg-color);
  overflow: hidden;
}

.about__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;
}

.about__image-wrapper {
  position: relative;
  border-radius: 20px;
  overflow: visible;
}

.about__image {
  width: 100%;
  height: auto;
  border-radius: 20px;
  filter: grayscale(0.5) contrast(1.2);
  transition: var(--transition-smooth);
}

.about__image-wrapper:hover .about__image {
  filter: grayscale(0) contrast(1);
  transform: scale(1.02);
}

.about__experience-badge {
  position: absolute;
  bottom: -2rem;
  right: -2rem;
  background: var(--accent-gradient);
  color: black;
  padding: 2rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20px 40px rgba(0, 255, 136, 0.3);
}

.about__experience-badge .number {
  font-size: 2.5rem;
  font-weight: 900;
  line-height: 1;
}

.about__experience-badge .text {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 4px;
  margin-bottom: 0.5rem;
}

.accent-line {
  width: 60px;
  height: 4px;
  background: var(--primary-color);
  margin-bottom: 2rem;
}

.about__subheadline {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 2rem;
}

.about__description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.about__stats {
  display: flex;
  gap: 3rem;
  margin-top: 3rem;
  margin-bottom: 3rem;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.btn-more {
  background: transparent;
  color: white;
  border: 1px solid white;
  padding: 0.8rem 2rem;
  font-weight: 700;
  transition: var(--transition-smooth);
}

.btn-more:hover {
  background: white;
  color: black;
}

@media (max-width: 992px) {
  .about {
    padding: 6rem 0;
  }

  .about__grid {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
  
  .about__image-container {
    order: 2;
  }
  
  .about__text-content {
    order: 1;
  }

  .about__subheadline {
    font-size: 2.2rem;
  }

  .about__experience-badge {
    padding: 1.2rem;
    bottom: -1rem;
    right: 0;
  }

  .about__experience-badge .number {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .about { padding: 4rem 0; }
  .about__subheadline { font-size: 1.8rem; }
  .about__description { font-size: 1rem; }
  .about__stats { margin: 2rem 0; justify-content: center; }
}
</style>
