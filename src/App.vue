<script setup>
import { ref } from 'vue';
import Navbar from './features/landing/components/Navbar.vue';
import Footer from './features/landing/components/Footer.vue';
import CustomCursor from './components/common/CustomCursor.vue';
import AppBottomNav from './components/common/AppBottomNav.vue';
import SplashScreen from './components/common/SplashScreen.vue';

const showSplash = ref(true);

const handleSplashFinish = () => {
  showSplash.value = false;
};
</script>

<template>
  <SplashScreen v-if="showSplash" @finish="handleSplashFinish" />
  <div v-show="!showSplash" class="app">
    <CustomCursor />
    <Navbar />
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Footer id="ubicacion" />
    <AppBottomNav />
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

/* Spacer for Bottom Nav on Mobile */
@media (max-width: 1024px) {
  .app {
    padding-bottom: 80px; /* Adjust based on BottomNav height */
  }
}
</style>
