<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Globe, Check } from 'lucide-vue-next';

const { locale } = useI18n();
const isOpen = ref(false);

const languages = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' }
];

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const setLanguage = (code) => {
  locale.value = code;
  isOpen.value = false;
  // Optional: Save to localStorage
  localStorage.setItem('user-locale', code);
};

// Close when clicking outside logic could be added ideally
</script>

<template>
  <div class="lang-selector">
    <button class="lang-btn" @click="toggleDropdown" :class="{ 'active': isOpen }">
      <Globe :size="18" />
      <span class="curr-lang">{{ locale.toUpperCase() }}</span>
    </button>

    <Transition name="fade-slide">
      <div v-if="isOpen" class="lang-dropdown glass-panel">
        <div 
          v-for="lang in languages" 
          :key="lang.code"
          class="lang-option"
          :class="{ 'selected': locale === lang.code }"
          @click="setLanguage(lang.code)"
        >
          <span class="flag">{{ lang.flag }}</span>
          <span class="label">{{ lang.label }}</span>
          <Check v-if="locale === lang.code" :size="14" class="check-icon" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.lang-selector {
  position: relative;
  z-index: 100;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 12px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-accent);
  font-weight: 700;
  font-size: 0.75rem;
  backdrop-filter: blur(10px);
}

.lang-btn:hover, .lang-btn.active {
  background: rgba(255, 94, 0, 0.15);
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: 0 0 15px rgba(255, 94, 0, 0.2);
}

.lang-dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  width: 150px;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.6);
  backdrop-filter: blur(20px);
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 600;
}

.lang-option:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.lang-option.selected {
  background: rgba(255, 94, 0, 0.15);
  color: var(--primary-color);
}

.check-icon {
  margin-left: auto;
}

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
