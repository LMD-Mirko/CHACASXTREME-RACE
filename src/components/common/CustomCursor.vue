<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const cursor = ref(null);
const cursorOuter = ref(null);
const isHovering = ref(false);
const isClicking = ref(false);

let targetX = 0;
let targetY = 0;
let dotX = 0;
let dotY = 0;
let outerX = 0;
let outerY = 0;
let rafId = null;
let hasMoved = false;

const updateCursor = (e) => {
  targetX = e.clientX;
  targetY = e.clientY;
  
  if (!hasMoved) {
    dotX = targetX;
    dotY = targetY;
    outerX = targetX;
    outerY = targetY;
    hasMoved = true;
  }
};

const handleMouseDown = () => isClicking.value = true;
const handleMouseUp = () => isClicking.value = false;

const handleLinkHover = (e) => {
  if (e.target && typeof e.target.closest === 'function') {
    if (e.target.closest('a, button, input, select, textarea, [role="button"], .gallery__item, .tab-btn, .category-selector-btn, .link-pill, .btn-exit')) {
      isHovering.value = true;
      return;
    }
  }
  isHovering.value = false;
};

const tick = () => {
  if (hasMoved) {
    // Smooth interpolation (lerp)
    // Dot follows fast for high responsiveness
    dotX += (targetX - dotX) * 0.45;
    dotY += (targetY - dotY) * 0.45;
    
    // Outer ring follows with a slight elegant delay
    outerX += (targetX - outerX) * 0.18;
    outerY += (targetY - outerY) * 0.18;
    
    if (cursor.value) {
      cursor.value.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
    }
    if (cursorOuter.value) {
      cursorOuter.value.style.transform = `translate3d(${outerX}px, ${outerY}px, 0)`;
    }
  }
  rafId = requestAnimationFrame(tick);
};

onMounted(() => {
  // Only enable on non-touch devices to save cycles
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) {
    window.addEventListener('mousemove', updateCursor, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('mouseover', handleLinkHover, { passive: true });
    tick();
  }
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateCursor);
  window.removeEventListener('mousedown', handleMouseDown);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mouseover', handleLinkHover);
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
});
</script>

<template>
  <div class="custom-cursor">
    <div 
      ref="cursor" 
      class="cursor-dot-wrapper"
    >
      <div 
        class="cursor-dot"
        :class="{ 'is-active': isClicking, 'is-hovering': isHovering }"
      ></div>
    </div>
    <div 
      ref="cursorOuter" 
      class="cursor-outer-wrapper"
    >
      <div 
        class="cursor-outer"
        :class="{ 'is-active': isClicking, 'is-hovering': isHovering }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.custom-cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10000;
}

.cursor-dot-wrapper,
.cursor-outer-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
  pointer-events: none;
}

.cursor-dot {
  width: 8px;
  height: 8px;
  background-color: var(--primary-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.2s;
  pointer-events: none;
}

.cursor-outer {
  width: 40px;
  height: 40px;
  border: 1px solid var(--primary-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.2s, background-color 0.2s;
  pointer-events: none;
}

/* Hovering active element states - Scale via transform */
.cursor-dot.is-hovering {
  transform: translate(-50%, -50%) scale(7.5); /* Scales to 60px equivalent */
  background-color: rgba(255, 94, 0, 0.25);
  mix-blend-mode: overlay;
}

.cursor-outer.is-hovering {
  transform: translate(-50%, -50%) scale(2); /* Scales to 80px equivalent */
  border-color: rgba(255, 255, 255, 0.6);
  border-width: 2px;
}

/* Clicking states */
.cursor-dot.is-active {
  transform: translate(-50%, -50%) scale(1.5) !important;
  background-color: var(--secondary-color) !important;
}

.cursor-outer.is-active {
  transform: translate(-50%, -50%) scale(0.8) !important;
  border-color: var(--secondary-color) !important;
}

@media (max-width: 1024px) {
  .custom-cursor { display: none; }
}
</style>
