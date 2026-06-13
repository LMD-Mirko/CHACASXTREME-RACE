<script setup>
import HeroSlider from '@/features/landing/components/HeroSlider.vue';
import AboutSection from '@/features/landing/components/AboutSection.vue';
import ImageCarousel from '@/features/landing/components/ImageCarousel.vue';
import TheChallenge from '@/features/landing/components/TheChallenge.vue';
import ContactSection from '@/features/landing/components/ContactSection.vue';
import { useScrollReveal } from '@/composables/useScrollReveal';

useScrollReveal();
</script>

<template>
  <main>
    <HeroSlider id="inicio" />
    <AboutSection id="sobre-nosotros" class="reveal-stagger" />
    <ImageCarousel id="galeria" class="reveal-stagger" />
    <TheChallenge id="participantes" class="reveal-stagger" />
    <ContactSection id="contacto" class="reveal-stagger" />
  </main>
</template>
