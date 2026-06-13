<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './features/landing/components/Navbar.vue';
import Footer from './features/landing/components/Footer.vue';
import CustomCursor from './components/common/CustomCursor.vue';
import AppBottomNav from './components/common/AppBottomNav.vue';
import SplashScreen from './components/common/SplashScreen.vue';

const showSplash = ref(true);
const route = useRoute();

// Hide navigation on the teaser page
const showNavigation = computed(() => route.name !== 'countdown');

const handleSplashFinish = () => {
  showSplash.value = false;
};
</script>

<template>
  <SplashScreen v-if="showSplash" @finish="handleSplashFinish" />
  <div v-show="!showSplash" class="app">
    <CustomCursor />
    <Navbar v-if="showNavigation" />
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Footer id="ubicacion" v-if="showNavigation" />
    <AppBottomNav v-if="showNavigation" />
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

/* Spacer for Bottom Nav — solo en PWA instalada */
@media (display-mode: standalone) {
  .app {
    padding-bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
