<script setup>
import { 
  Home, 
  Flag, 
  Map, 
  Users, 
  Handshake,
  Zap
} from 'lucide-vue-next';
import { RouterLink, useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const navItems = [
  { name: 'Inicio', path: '/', icon: Home },
  { name: 'Eventos', path: '/eventos', icon: Flag },
  { name: 'PARTICIPAR', path: '/como-participar', icon: Zap, isAction: true },
  { name: 'Chacas', path: '/conoce-chacas', icon: Map },
  { name: 'Sponsors', path: '/auspiciadores', icon: Handshake }
];

const isActive = (path) => {
  if (path === '/') return route.path === '/' && !route.hash;
  return route.path.startsWith(path);
};
</script>

<template>
  <nav class="bottom-nav">
    <div class="bottom-nav__container">
      <template v-for="item in navItems" :key="item.name">
        <!-- Floating Action Button (Center) -->
        <RouterLink 
          v-if="item.isAction"
          :to="item.path"
          class="nav-item nav-item--action"
          :class="{ 'is-active': isActive(item.path) }"
        >
          <div class="action-button">
            <component :is="item.icon" :size="28" />
            <div class="button-glow"></div>
          </div>
          <span class="nav-label">{{ item.name }}</span>
        </RouterLink>

        <!-- Standard Nav Items -->
        <RouterLink 
          v-else
          :to="item.path"
          class="nav-item"
          :class="{ 'is-active': isActive(item.path) }"
        >
          <div class="icon-wrap">
            <component :is="item.icon" :size="22" />
          </div>
          <span class="nav-label">{{ item.name }}</span>
        </RouterLink>
      </template>
    </div>

    <!-- Technical background decorations -->
    <div class="nav-blur-bg"></div>
    <div class="nav-border-top"></div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10000;
  height: 80px; /* Taller for better layout */
  display: none;
  pointer-events: none; /* Let clicks pass through transparent areas */
}

@media (max-width: 1024px) {
  /* Only show in browser mode for testing */
  .bottom-nav {
    display: block;
  }
}

/* Show bottom nav ONLY when app is installed (standalone mode) */
@media (display-mode: standalone) {
  .bottom-nav {
    display: block !important;
  }
}

/* Hide bottom nav in browser mode on mobile */
@media (max-width: 1024px) and (display-mode: browser) {
  .bottom-nav {
    display: none !important;
  }
}

.bottom-nav__container {
  pointer-events: auto;
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: flex-end; /* Align items to bottom */
  max-width: 500px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 100%;
  padding-bottom: 10px; /* Space for home indicator */
}

/* Standard Nav Items */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  flex: 1;
  height: 100%;
  position: relative;
  padding-bottom: 8px; 
}

.icon-wrap {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-label {
  font-family: var(--font-accent);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

/* Active State Styles */
.nav-item.is-active {
  color: var(--primary-color);
}

.nav-item.is-active .nav-label {
  opacity: 1;
  font-weight: 900;
}

/* Central Action Button Item */
.nav-item--action {
  flex: 1;
  position: relative;
  overflow: visible; /* Allow button to float out */
}

.action-button {
  position: absolute;
  top: -24px; /* Float above the bar */
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  border: 1px solid rgba(255, 94, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
  z-index: 20;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Make sure the label sits at the bottom like others */
.nav-item--action .nav-label {
  margin-top: auto; /* Push to bottom */
  color: var(--primary-color);
  font-size: 11px;
}

.action-button svg {
  color: var(--primary-color);
  transition: all 0.3s ease;
}

/* Active Action Button */
.nav-item--action.is-active .action-button {
  background: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 0 25px rgba(255, 94, 0, 0.5);
  transform: translateX(-50%) translateY(-5px);
}

.nav-item--action.is-active .action-button svg {
  color: #000;
  transform: scale(1.1);
}

/* Glow Effect behind button */
.button-glow {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0;
  filter: blur(15px);
  transition: opacity 0.3s ease;
  z-index: -1;
}

.nav-item--action.is-active .button-glow {
  opacity: 0.4;
}

/* Background & Glassmorphism */
.nav-blur-bg {
  pointer-events: auto;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px; /* Only cover the bottom part */
  background: rgba(10, 10, 10, 0.95); /* Darker, more solid for contrast */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 1;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
}

.nav-border-top {
  pointer-events: none;
  position: absolute;
  bottom: 70px; /* Match bg height */
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  opacity: 0.3;
  z-index: 5;
}

/* Safe Area Support */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    height: calc(80px + env(safe-area-inset-bottom));
  }
  .bottom-nav__container {
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
  .nav-blur-bg {
    height: calc(70px + env(safe-area-inset-bottom));
  }
  .nav-border-top {
    bottom: calc(70px + env(safe-area-inset-bottom));
  }
}
</style>
