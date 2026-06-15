<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Menu, X, ChevronDown, Instagram, Facebook, MessageCircle } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LanguageSelector from '@/components/common/LanguageSelector.vue';

const { t } = useI18n();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const activeDropdown = ref(null);
const isLoaded = ref(false);

// Computed navigation links for reactivity on language change
const navLinks = computed(() => [
  { name: t('nav.home'), to: { path: '/inicio', hash: '#inicio' } },
  { name: 'Sobre Nosotros', to: { path: '/inicio', hash: '#sobre-nosotros' } }, // TODO: Add key for About
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
  requestAnimationFrame(() => {
    isLoaded.value = true;
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <nav :class="['navbar', { 'navbar--scrolled': isScrolled, 'navbar--mobile-open': isMobileMenuOpen, 'navbar--loaded': isLoaded }]">
    <div class="container navbar__content">
      <RouterLink to="/inicio" class="navbar__logo nav-enter nav-enter--1">
        <span class="logo-text">CHACAS</span>
        <span class="logo-accent">
          <span class="x-accent">X</span>TREME
          <span class="logo-race">RACE</span>
        </span>
      </RouterLink>

      <!-- Desktop Links -->
      <ul class="navbar__links">
        <li v-for="(link, index) in navLinks" :key="link.name" 
            class="nav-item nav-enter"
            :class="'nav-enter--' + (index + 2)"
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
      <div class="desktop-lang nav-enter nav-enter--6">
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
        <!-- HUD backgrounds -->
        <div class="mobile-menu__grid"></div>
        <div class="mobile-menu__watermark">XTREME</div>
        
        <!-- HUD Corner Brackets -->
        <div class="hud-bracket top-left"></div>
        <div class="hud-bracket bottom-right"></div>
        

        <ul class="mobile-menu__links">
          <template v-for="(link, index) in navLinks" :key="link.name">
            <li :style="{ '--delay': index * 0.08 + 's' }">
              <RouterLink :to="link.to" class="mobile-nav-link" @click="closeMobileMenu" active-class="mobile-nav-link--active">
                <span class="link-number">0{{ index + 1 }}</span>
                <span class="link-text">{{ link.name }}</span>
              </RouterLink>
              <!-- Show sublinks in mobile if present -->
              <ul v-if="link.dropdown" class="mobile-sublinks">
                <li v-for="(sub, subIdx) in link.dropdown" :key="sub.name" 
                    :style="{ '--sub-delay': (index * 0.08 + subIdx * 0.05) + 's' }">
                  <RouterLink :to="sub.to" class="mobile-sublink" @click="closeMobileMenu" active-class="mobile-sublink--active">
                    <span class="sub-dot"></span>
                    {{ sub.name }}
                  </RouterLink>
                </li>
              </ul>
            </li>
          </template>

          <!-- Language Selector inside mobile menu list -->
          <li class="mobile-lang-item" :style="{ '--delay': (navLinks.length * 0.08) + 's' }">
            <div class="mobile-lang-divider"></div>
            <span class="mobile-lang-label">{{ t('language.select') }}</span>
            <div class="mobile-lang-selector-wrap">
              <LanguageSelector />
            </div>
          </li>
        </ul>

        <!-- Futuristic Footer with Socials & Coords -->
        <div class="mobile-menu__footer" :style="{ '--delay': (navLinks.length * 0.08 + 0.1) + 's' }">
          <div class="mobile-menu__socials">
            <a href="https://instagram.com/eldemonio.mtb" target="_blank" class="social-icon" aria-label="Instagram"><Instagram :size="18" /></a>
            <a href="https://facebook.com" target="_blank" class="social-icon" aria-label="Facebook"><Facebook :size="18" /></a>
            <a href="https://wa.me/51983426996" target="_blank" class="social-icon" aria-label="WhatsApp"><MessageCircle :size="18" /></a>
          </div>
          <div class="mobile-menu__coords font-inter">SYS.LOC // 8.52S.77.22W</div>
        </div>
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

/* Navbar load entrance */
.navbar--loaded .nav-enter {
  animation: nav-drop-in 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
}

.navbar--loaded .nav-enter--1 { animation-delay: 0.1s; }
.navbar--loaded .nav-enter--2 { animation-delay: 0.18s; }
.navbar--loaded .nav-enter--3 { animation-delay: 0.24s; }
.navbar--loaded .nav-enter--4 { animation-delay: 0.3s; }
.navbar--loaded .nav-enter--5 { animation-delay: 0.36s; }
.navbar--loaded .nav-enter--6 { animation-delay: 0.42s; }

@keyframes nav-drop-in {
  from {
    opacity: 0;
    transform: translateY(-18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .navbar--loaded .nav-enter {
    opacity: 1;
    animation: none;
    transform: none;
  }
}

.navbar__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10001; /* Above mobile menu content */
}

.navbar__logo {
  font-family: var(--font-podium);
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 0.5px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-text { color: white; }
.logo-accent {
  color: var(--primary-color);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
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
  background-color: rgba(3, 3, 3, 0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem 2rem 2rem;
  overflow: hidden;
}

.mobile-menu__grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
  z-index: 1;
}

.mobile-menu__watermark {
  position: absolute;
  bottom: 15%;
  right: -5%;
  font-family: var(--font-podium);
  font-size: clamp(6rem, 20vw, 12rem);
  font-weight: 950;
  color: rgba(255, 94, 0, 0.035);
  line-height: 1;
  pointer-events: none;
  user-select: none;
  z-index: 1;
  transform: rotate(-10deg);
}


.mobile-menu__links {
  list-style: none;
  position: relative;
  z-index: 2;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mobile-menu__links > li {
  opacity: 0;
  animation: mobileLinkSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
  will-change: transform, opacity;
}

@keyframes mobileLinkSlideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.mobile-nav-link {
  font-family: var(--font-podium);
  font-size: clamp(1.8rem, 6vw, 2.5rem);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.link-number {
  font-family: var(--font-accent);
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--primary-color);
  opacity: 0.8;
}

.mobile-nav-link:hover,
.mobile-nav-link--active {
  color: white;
  transform: translateX(8px);
}

.mobile-nav-link--active .link-text {
  text-shadow: 0 0 20px rgba(255, 94, 0, 0.3);
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.mobile-sublinks {
  margin-top: 0.8rem;
  margin-left: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-left: 1px dashed rgba(255, 94, 0, 0.25);
  padding-left: 1.2rem;
}

.mobile-sublinks li {
  margin: 0 !important;
  opacity: 0;
  animation: mobileLinkSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--sub-delay);
  will-change: transform, opacity;
}

.mobile-sublink {
  font-family: var(--font-accent);
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.3s ease;
}

.sub-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.mobile-sublink:hover,
.mobile-sublink--active {
  color: white;
}

.mobile-sublink--active .sub-dot {
  opacity: 1;
  transform: scale(1.5);
  background: var(--secondary-color);
  box-shadow: 0 0 8px var(--secondary-color);
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

/* Mobile Language Selector styling inside menu list */
.mobile-lang-item {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  opacity: 0;
  animation: mobileLinkSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}

.mobile-lang-divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.mobile-lang-label {
  font-family: var(--font-accent);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.mobile-lang-selector-wrap {
  width: fit-content;
}

/* Futuristic Footer */
.mobile-menu__footer {
  margin-top: auto;
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 2;
  opacity: 0;
  animation: mobileLinkSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}

.mobile-menu__socials {
  display: flex;
  gap: 1.2rem;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.social-icon:hover {
  background: rgba(255, 94, 0, 0.1);
  border-color: var(--primary-color);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(255, 94, 0, 0.2);
}

.mobile-menu__coords {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.25);
}

.hud-bracket {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 1.5px solid rgba(255, 94, 0, 0.15);
  pointer-events: none;
  z-index: 1;
}

.hud-bracket.top-left {
  top: 2rem;
  left: 2rem;
  border-right: none;
  border-bottom: none;
}

.hud-bracket.bottom-right {
  bottom: 2rem;
  right: 2rem;
  border-left: none;
  border-top: none;
}

/* Hide hamburger menu when app is installed (standalone mode) */
@media (display-mode: standalone) {
  .navbar__mobile-toggle { display: none !important; }
}
</style>
