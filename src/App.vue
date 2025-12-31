<script setup>
import Navbar from './features/landing/components/Navbar.vue';
import Footer from './features/landing/components/Footer.vue';
import CustomCursor from './components/common/CustomCursor.vue';
</script>

<template>
  <div class="app">
    <CustomCursor />
    <Navbar />
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Footer id="ubicacion" />
  </div>
</template>

<style>
.app {
  min-height: 100vh;
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.5s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
