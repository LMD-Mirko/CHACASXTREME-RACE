<script setup>
import HeroSlider from '@/features/landing/components/HeroSlider.vue';
import AboutSection from '@/features/landing/components/AboutSection.vue';
import ImageCarousel from '@/features/landing/components/ImageCarousel.vue';
import TheChallenge from '@/features/landing/components/TheChallenge.vue';
import ContactSection from '@/features/landing/components/ContactSection.vue';
import { onMounted } from 'vue';

onMounted(() => {
  const observerOptions = {
    threshold: 0.15
  };

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
  <main>
    <HeroSlider id="inicio" />
    <AboutSection id="sobre-nosotros" class="reveal" />
    <ImageCarousel id="galeria" class="reveal" />
    <TheChallenge id="participantes" class="reveal" />
    <ContactSection id="contacto" class="reveal" />
  </main>
</template>
