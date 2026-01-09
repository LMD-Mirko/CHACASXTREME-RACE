<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Menu, X, ChevronDown } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LanguageSelector from '@/components/common/LanguageSelector.vue';

const { t } = useI18n();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const activeDropdown = ref(null);

// Computed navigation links for reactivity on language change
const navLinks = computed(() => [
  { name: t('nav.home'), to: { path: '/', hash: '#inicio' } },
  { name: 'Sobre Nosotros', to: { path: '/', hash: '#sobre-nosotros' } }, // TODO: Add key for About
  { 
    name: t('nav.participate'), 
    to: '/como-participar',
    dropdown: [
      { name: 'Auspiciadores', to: '/auspiciadores' },
      { name: 'Riders', to: '/registro/ciclista' },
      { name: 'Conoce Chacas', to: '/conoce-chacas' },
    ]
  },
  { name: 'Eventos', to: '/eventos' },
]);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <nav :class="['navbar', { 'navbar--scrolled': isScrolled, 'navbar--mobile-open': isMobileMenuOpen }]">
    <div class="container navbar__content">
      <RouterLink to="/" class="navbar__logo">
        <span class="logo-text">CHACAS</span>
        <span class="logo-accent"><span class="x-accent">X</span>TREME RACE</span>
      </RouterLink>

      <!-- Desktop Links -->
      <ul class="navbar__links">
        <li v-for="link in navLinks" :key="link.name" 
            class="nav-item"
            @mouseenter="activeDropdown = link.name"
            @mouseleave="activeDropdown = null"
        >
          <RouterLink :to="link.to" class="nav-link" :class="{ 'has-dropdown': link.dropdown }" active-class="nav-link--active">
            {{ link.name }}
            <ChevronDown v-if="link.dropdown" :size="14" class="dropdown-icon" />
          </RouterLink>

          <!-- Modern Dropdown -->
          <Transition name="dropdown-fade">
            <div v-if="link.dropdown && activeDropdown === link.name" class="navbar__dropdown">
              <ul class="dropdown__list">
                <li v-for="sublink in link.dropdown" :key="sublink.name">
                  <RouterLink :to="sublink.to" class="dropdown-link">
                    {{ sublink.name }}
                  </RouterLink>
                </li>
              </ul>
            </div>
          </Transition>
        </li>
      </ul>
      
      <!-- Desktop Language Selector -->
      <div class="desktop-lang">
        <LanguageSelector />
      </div>

      <!-- Hamburger Button -->
      <button class="navbar__mobile-toggle" @click="toggleMobileMenu" aria-label="Toggle Menu">
        <Menu v-if="!isMobileMenuOpen" :size="28" />
        <X v-else :size="28" />
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition name="fade-slide">
      <div v-if="isMobileMenuOpen" class="navbar__mobile-menu">
        <div class="mobile-lang-wrapper">
           <LanguageSelector />
        </div>
        <ul class="mobile-menu__links">
          <template v-for="(link, index) in navLinks" :key="link.name">
            <li :style="{ '--delay': index * 0.1 + 's' }">
              <RouterLink :to="link.to" class="mobile-nav-link" @click="closeMobileMenu">
                {{ link.name }}
              </RouterLink>
              <!-- Show sublinks in mobile if present -->
              <ul v-if="link.dropdown" class="mobile-sublinks">
                <li v-for="sub in link.dropdown" :key="sub.name">
                  <RouterLink :to="sub.to" class="mobile-sublink" @click="closeMobileMenu">{{ sub.name }}</RouterLink>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999; /* Max priority */
  padding: 1rem 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar--scrolled, .navbar--mobile-open {
  padding: 0.6rem 0;
  background: #000000 !important; /* Force solid black */
  border-bottom: 1px solid rgba(255, 94, 0, 0.2);
}

.navbar__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10001; /* Above mobile menu content */
}

.navbar__logo {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  cursor: pointer;
  text-decoration: none;
}

.logo-text { color: white; }
.logo-accent { color: var(--primary-color); margin-left: 0.3rem; }
.x-accent { color: var(--accent-red); }

/* Desktop Navigation */
.navbar__links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-item {
  position: relative;
}

.nav-link {
  font-family: var(--font-accent);
  font-weight: 700;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 0.6rem 1rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.nav-link:hover, .has-dropdown:hover, .nav-link--active {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.nav-link--active {
  color: var(--primary-color) !important;
}

.dropdown-icon {
  transition: transform 0.3s ease;
  opacity: 0.5;
}

.nav-item:hover .dropdown-icon {
  transform: rotate(180deg);
  opacity: 1;
}

/* Modern Dropdown Menu */
.navbar__dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 1rem;
  min-width: 220px;
  z-index: 100;
}

.dropdown__list {
  background: #111;
  border-radius: 16px;
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.dropdown-link {
  display: block;
  padding: 0.8rem 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--font-accent);
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 10px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.dropdown-link:hover {
  color: white;
  background: var(--primary-color);
  transform: translateX(5px);
}

/* Mobile Toggle */
.navbar__mobile-toggle {
  display: none;
  color: white;
  z-index: 10001; /* Same as logo, above menu */
  cursor: pointer;
  background: none;
  border: none;
}

/* Mobile Menu */
.navbar__mobile-menu {
  position: fixed;
  inset: 0;
  background-color: #000000; /* Deep absolute black */
  background-image: 
    radial-gradient(circle at bottom right, rgba(255, 94, 0, 0.1), transparent 40%),
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 100% 100%, 30px 30px, 30px 30px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
}

.mobile-menu__links {
  list-style: none;
  position: relative;
  z-index: 10002;
}

.mobile-menu__links li {
  margin-bottom: 1.5rem;
}

.mobile-nav-link {
  font-family: var(--font-accent);
  font-size: 2rem;
  font-weight: 900;
  color: white;
  text-transform: uppercase;
  text-decoration: none;
}

.mobile-sublinks {
  margin-top: 1rem;
  margin-left: 1.5rem;
  border-left: 2px solid var(--primary-color);
  padding-left: 1.5rem;
}

.mobile-sublink {
  font-family: var(--font-accent);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 0.8rem;
  text-transform: uppercase;
  text-decoration: none;
}

/* Animations */
.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.dropdown-fade-enter-from, .dropdown-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 1024px) {
  .navbar__links { display: none; }
  .desktop-lang { display: none; }
  .navbar__mobile-toggle { display: block; }
}

.desktop-lang {
  margin-left: 1rem;
}

.mobile-lang-wrapper {
  position: absolute;
  top: 2rem;
  right: 6rem; /* Left of close button */
  z-index: 10005;
}

/* Hide hamburger menu when app is installed (standalone mode) */
@media (display-mode: standalone) {
  .navbar__mobile-toggle { display: none !important; }
}
</style>
