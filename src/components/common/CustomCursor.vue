<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const cursor = ref(null);
const cursorOuter = ref(null);
const isHovering = ref(false);
const isClicking = ref(false);

const updateCursor = (e) => {
  const x = e.clientX;
  const y = e.clientY;
  
  if (cursor.value && cursorOuter.value) {
    cursor.value.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    cursorOuter.value.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
};

const handleMouseDown = () => isClicking.value = true;
const handleMouseUp = () => isClicking.value = false;

const handleLinkHover = (e) => {
  if (e.target.closest('a, button, .gallery__item')) {
    isHovering.value = true;
  } else {
    isHovering.value = false;
  }
};

onMounted(() => {
  window.addEventListener('mousemove', updateCursor);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mouseover', handleLinkHover);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateCursor);
  window.removeEventListener('mousedown', handleMouseDown);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mouseover', handleLinkHover);
});
</script>

<template>
  <div class="custom-cursor">
    <div 
      ref="cursor" 
      class="cursor-dot" 
      :class="{ 'is-active': isClicking, 'is-hovering': isHovering }"
    ></div>
    <div 
      ref="cursorOuter" 
      class="cursor-outer"
      :class="{ 'is-active': isClicking, 'is-hovering': isHovering }"
    ></div>
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

.cursor-dot {
  width: 8px;
  height: 8px;
  background-color: var(--primary-color);
  border-radius: 50%;
  position: fixed;
  top: -4px;
  left: -4px;
  transition: transform 0.1s ease-out, width 0.3s, height 0.3s, background-color 0.3s;
}

.cursor-outer {
  width: 40px;
  height: 40px;
  border: 1px solid var(--primary-color);
  border-radius: 50%;
  position: fixed;
  top: -20px;
  left: -20px;
  transition: transform 0.2s ease-out, width 0.3s, height 0.3s, border-color 0.3s;
}

.cursor-dot.is-active {
  transform: scale(1.5) !important;
  background-color: var(--secondary-color);
}

.cursor-outer.is-active {
  transform: scale(0.8) !important;
  border-color: var(--secondary-color);
}

.cursor-dot.is-hovering {
  width: 60px;
  height: 60px;
  top: -30px;
  left: -30px;
  background-color: rgba(255, 94, 0, 0.2);
  mix-blend-mode: overlay;
}

.cursor-outer.is-hovering {
  width: 80px;
  height: 80px;
  top: -40px;
  left: -40px;
  border-color: rgba(255, 255, 255, 0.5);
  border-width: 2px;
}

@media (max-width: 1024px) {
  .custom-cursor { display: none; }
}
</style>
