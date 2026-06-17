<script setup>
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';

const isVisible = ref(true);
const showZooming4 = ref(true);
const showTransitionStyled4 = ref(false);
const typedChacas = ref('');
const typedX = ref('');
const typedTreme = ref('');
const typedRace = ref('');

const emit = defineEmits(['finish']);

onMounted(() => {
  // Set initial states
  gsap.set('.giant-zoom-4', { scale: 0.1, opacity: 0 });
  gsap.set('.slanted-wipe-panel', { x: '120vw', opacity: 0 });
  gsap.set('.transition-logo-container', { opacity: 0 });

  const tl = gsap.timeline({
    onComplete: () => {
      isVisible.value = false;
      emit('finish');
    }
  });

  // 1. Zoom in the giant number 4
  tl.to('.giant-zoom-4', { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.2)", force3D: true })
    .to('.giant-zoom-4', { 
      scale: 20, 
      opacity: 0.95, 
      duration: 0.55, 
      ease: "power2.in",
      force3D: true,
      onComplete: () => {
        showZooming4.value = false;
      }
    }, "+=0.1");

  // 2. Wipe in slanted panel background and activate logo container overlay
  tl.to('.slanted-wipe-panel', { opacity: 1, x: '-20vw', duration: 0.75, ease: "power3.inOut" }, 0.8)
    .to('.transition-logo-container', { opacity: 1, duration: 0.15 }, 0.95);

  // Typewriter helper
  const typeText = (refVar, text, duration, selectorToPop) => {
    const obj = { val: 0 };
    return gsap.to(obj, {
      val: text.length,
      duration: duration,
      ease: "none",
      onUpdate: () => {
        refVar.value = text.slice(0, Math.ceil(obj.val));
      },
      onComplete: () => {
        if (selectorToPop) {
          gsap.fromTo(selectorToPop, 
            { scale: 1.25, rotate: selectorToPop === '.logo-x-char' ? -12 : (Math.random() - 0.5) * 6 }, 
            { scale: 1, rotate: selectorToPop === '.logo-x-char' ? -5 : 0, duration: 0.22, ease: "back.out(2)" }
          );
        }
      }
    });
  };

  // 3. Type writer animation steps
  tl.add(typeText(typedX, 'X', 0.22, '.logo-x-char'), 1.1)
    .add(typeText(typedChacas, 'CHACAS', 0.35, '.logo-row-chacas'), '+=0.02')
    .add(typeText(typedTreme, 'TREME', 0.28, '.treme-text'), '+=0.02')
    .add(typeText(typedRace, 'RACE', 0.22, '.race-text'), '+=0.02')
    
    // 4. Pop styled "4" badge next to RACE
    .add(() => {
      showTransitionStyled4.value = true;
      gsap.fromTo('.transition-styled-4',
        { scale: 0, opacity: 0, rotate: -25 },
        { scale: 1, opacity: 1, rotate: -12, duration: 0.45, ease: "back.out(2.2)" }
      );
    }, '+=0.05')
    
    .to({}, { duration: 1.3 }) // Read time
    .to('.edition4-splash', { opacity: 0, duration: 0.45, ease: "power2.out" });
});
</script>

<template>
  <div v-if="isVisible" class="edition4-splash">
    <div class="splash-bg">
      <div class="scanlines"></div>
      <div class="vignette"></div>
      
      <!-- Floating Particles -->
      <div class="particles">
        <div v-for="i in 15" :key="i" class="particle" :style="{
          '--x': Math.random() * 100 + '%',
          '--y': Math.random() * 100 + '%',
          '--delay': Math.random() * 2 + 's',
          '--duration': (Math.random() * 3 + 3) + 's'
        }"></div>
      </div>
    </div>

    <!-- STAGE 1: Zooming Big 4 -->
    <div class="zooming-intro-4" v-if="showZooming4">
      <div class="giant-zoom-4 font-podium">4</div>
    </div>

    <!-- STAGE 2: Slanted wipe panel -->
    <div class="slanted-wipe-panel"></div>

    <!-- STAGE 3: Transition Logo -->
    <div class="transition-logo-container">
      <div class="logo-x-wrapper">
        <div class="logo-x-char">{{ typedX }}</div>
      </div>
      <div class="logo-text-stack">
        <div class="logo-row-chacas">
          {{ typedChacas }}
        </div>
        <div class="logo-row-treme-race">
          <span class="treme-text">{{ typedTreme }}</span>
          <span class="race-text">{{ typedRace }}</span>
          <span class="transition-styled-4 font-podium" v-if="showTransitionStyled4">4</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edition4-splash {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #010101;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Background Effects */
.splash-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 50%, transparent 50%);
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 1;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, #000000 95%);
  z-index: 2;
}

/* Floating Particles */
.particles {
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 50%;
  left: var(--x);
  top: var(--y);
  opacity: 0;
  box-shadow: 0 0 10px var(--primary-color);
  animation: float-particle var(--duration) ease-in-out var(--delay) infinite;
}

@keyframes float-particle {
  0% { 
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(-10vh) scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: translateY(-50vh) scale(1);
  }
  100% { 
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

/* Zooming 4 Layer on Exit */
.zooming-intro-4 {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #010101;
  z-index: 10010;
  pointer-events: none;
}

.giant-zoom-4 {
  font-family: var(--font-podium);
  font-size: clamp(15rem, 30vw, 25rem);
  font-weight: 950;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-style: italic;
  line-height: 1.25; /* Increased to prevent top and bottom clip cut-off */
  padding: 1rem 2rem; /* Added padding to prevent slanted edge clip */
  text-shadow: 0 0 35px rgba(255, 94, 0, 0.45); /* High-performance text shadow */
  will-change: transform;
}

.slanted-wipe-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 140vw;
  height: 100%;
  background: radial-gradient(circle at 75% 20%, rgba(255, 94, 0, 0.15) 0%, transparent 60%),
              radial-gradient(circle at 25% 80%, rgba(251, 191, 36, 0.08) 0%, transparent 60%),
              #0c0c0c;
  border-left: 5px solid #ff5e00;
  box-shadow: -8px 0 20px rgba(0, 0, 0, 0.6); /* Reduced shadow depth for GPU performance */
  transform: skewX(-15deg);
  will-change: transform;
}

/* Transition Text Animations */
.transition-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 3.5vw, 2.2rem);
  z-index: 10005;
  pointer-events: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: auto;
  max-width: 90%;
  will-change: transform, opacity;
}

.logo-x-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-x-char {
  font-family: 'Rubik Glitch', system-ui, var(--font-podium);
  font-size: clamp(5.5rem, 18vh, 10.5rem);
  font-weight: 950;
  color: #ff221c;
  line-height: 0.8;
  transform: rotate(-5deg);
  text-shadow: 0 0 25px rgba(255, 34, 28, 0.5);
  will-change: transform;
}

.logo-text-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.logo-row-chacas {
  font-family: var(--font-podium);
  font-size: clamp(2.8rem, 9vh, 5.2rem);
  font-weight: 950;
  line-height: 0.95;
  color: #ffcc00;
  text-transform: uppercase;
  letter-spacing: -2px;
  text-shadow: 3px 3px 0px #990000;
  will-change: transform;
}

.logo-row-treme-race {
  font-family: var(--font-podium);
  font-size: clamp(2rem, 7vh, 4rem);
  font-weight: 950;
  line-height: 0.95;
  text-transform: uppercase;
  letter-spacing: -1px;
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.treme-text {
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  will-change: transform;
}

.race-text {
  color: #ff5e00;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  will-change: transform;
}

/* Styled 4 badge next to RACE */
.transition-styled-4 {
  font-family: var(--font-podium);
  font-size: clamp(2rem, 7vh, 4rem);
  font-weight: 950;
  color: #000 !important;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: 0 0.8rem;
  margin-left: 0.6rem;
  border-radius: 6px;
  line-height: 1.15;
  transform: skewX(-12deg);
  display: inline-block;
  font-style: italic;
  box-shadow: 0 0 10px rgba(255, 94, 0, 0.35);
  will-change: transform;
  transform-origin: center;
}

@media (max-width: 480px) {
  .giant-zoom-4 { font-size: 14rem; }
  .transition-logo-container {
    gap: 0.8rem;
  }
  .logo-x-char {
    font-size: clamp(4rem, 15vh, 7rem);
  }
  .logo-row-chacas {
    font-size: clamp(2rem, 8vh, 3.5rem);
    text-shadow: 2px 2px 0px #990000;
  }
  .logo-row-treme-race {
    font-size: clamp(1.5rem, 6vh, 2.6rem);
    gap: 0.25rem;
  }
  .transition-styled-4 {
    font-size: clamp(1.5rem, 6vh, 2.6rem);
    padding: 0 0.5rem;
    margin-left: 0.4rem;
  }
}
</style>
