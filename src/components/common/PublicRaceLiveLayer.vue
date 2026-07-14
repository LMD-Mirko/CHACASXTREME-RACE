<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { MapPin, Trophy } from 'lucide-vue-next';
import RaceStartCountdownOverlay from '@/features/edition4/components/RaceStartCountdownOverlay.vue';
import { usePublicRaceSocket } from '@/composables/usePublicRaceSocket';

usePublicRaceSocket();

const showStartCountdown = ref(false);
const startCountdownVal = ref(null);
const startCountdownCategory = ref('');
const startCountdownPhase = ref('');
const activePassedAlert = ref(null);
const activeFinishedAlert = ref(null);

let passedTimer = null;
let finishedTimer = null;
let countdownInterval = null;
let lastCountdownAt = 0;

const playTickSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (_) { /* ignore */ }
};

const playGoSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }, idx * 70);
    });
  } catch (_) { /* ignore */ }
};

const playVictoryArpeggio = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }, idx * 100);
    });
  } catch (_) { /* ignore */ }
};

const dismissStartCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  showStartCountdown.value = false;
  startCountdownVal.value = null;
};

const onCountdownStarted = (e) => {
  const now = Date.now();
  if (now - lastCountdownAt < 800) return;
  lastCountdownAt = now;

  const d = e.detail || {};
  const seconds = Number(d.duration_seconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return;

  const rawCat = String(d.category_name || '').trim();
  const catUpper = rawCat.toUpperCase();
  startCountdownCategory.value =
    (catUpper.includes('MEGA') && catUpper.includes('AVALANCHA'))
    || catUpper.includes('(TODAS)')
    || catUpper === 'ALL'
    || catUpper === 'TODAS'
      ? 'Mega Avalancha'
      : rawCat;
  startCountdownPhase.value = d.phase === 'final' ? 'Final' : 'Clasificación';
  startCountdownVal.value = seconds;
  showStartCountdown.value = true;
  playTickSound();

  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    if (typeof startCountdownVal.value !== 'number') return;
    if (startCountdownVal.value <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      setTimeout(() => dismissStartCountdown(), 1400);
      return;
    }
    const next = startCountdownVal.value - 1;
    startCountdownVal.value = next;
    if (next === 0) playGoSound();
    else playTickSound();
  }, 1000);
};

const onRiderPassed = (e) => {
  const d = e.detail || {};
  if (String(d.checkpoint_name || '').toUpperCase() === 'META') return;
  playTickSound();
  clearTimeout(passedTimer);
  activePassedAlert.value = {
    plate_number: d.plate_number,
    full_name: d.full_name,
    elapsed_time: d.elapsed_time || '—',
    category: d.category_name || '—',
    checkpoint: d.checkpoint_name || 'INTERMEDIO',
  };
  passedTimer = setTimeout(() => { activePassedAlert.value = null; }, 4000);
};

const onRiderFinished = (e) => {
  const d = e.detail || {};
  playVictoryArpeggio();
  clearTimeout(finishedTimer);
  activeFinishedAlert.value = {
    plate_number: d.plate_number,
    full_name: d.full_name,
    net_time: d.net_time || '—',
    category: d.category_name || '—',
    position: d.current_position || '—',
  };
  finishedTimer = setTimeout(() => { activeFinishedAlert.value = null; }, 4200);
};

onMounted(() => {
  window.addEventListener('public-countdown-started', onCountdownStarted);
  window.addEventListener('public-rider-passed', onRiderPassed);
  window.addEventListener('public-rider-finished', onRiderFinished);
});

onUnmounted(() => {
  window.removeEventListener('public-countdown-started', onCountdownStarted);
  window.removeEventListener('public-rider-passed', onRiderPassed);
  window.removeEventListener('public-rider-finished', onRiderFinished);
  clearTimeout(passedTimer);
  clearTimeout(finishedTimer);
  dismissStartCountdown();
});
</script>

<template>
  <div class="public-race-live-layer" aria-live="polite">
    <RaceStartCountdownOverlay
      :show="showStartCountdown"
      :countdown="startCountdownVal"
      :category-name="startCountdownCategory"
      :phase-label="startCountdownPhase"
      @dismiss="dismissStartCountdown"
    />

    <Transition name="toast-slide">
      <div v-if="activePassedAlert" class="ws-checkpoint-toast font-inter">
        <div class="toast-glow-strip"></div>
        <div class="toast-content">
          <div class="toast-icon-badge">
            <MapPin :size="20" class="animate-pulse text-orange" />
          </div>
          <div class="toast-info">
            <div class="toast-title font-accent">
              <MapPin :size="12" class="sym-inline" />
              {{ activePassedAlert.checkpoint }}
            </div>
            <div class="toast-desc">
              Placa <strong class="plate">#{{ activePassedAlert.plate_number }}</strong> — {{ activePassedAlert.full_name }}
            </div>
            <div class="toast-meta">
              <span>TIEMPO PARCIAL:</span>
              <strong class="time">{{ activePassedAlert.elapsed_time }}</strong>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade-overlay">
      <div v-if="activeFinishedAlert" class="ws-finished-overlay" @click="activeFinishedAlert = null">
        <div class="overlay-grid-bg"></div>
        <div class="overlay-slanted-wipe"></div>
        <div class="overlay-content">
          <div class="glow-pulse-ring">
            <div class="giant-plate-number">#{{ activeFinishedAlert.plate_number }}</div>
          </div>
          <div class="meta-card font-inter">
            <div class="meta-status font-symbols">
              <Trophy :size="14" class="sym-inline" />
              ¡CORREDOR EN META!
            </div>
            <h2 class="meta-name font-podium">{{ activeFinishedAlert.full_name }}</h2>
            <div class="meta-details">
              <div class="detail-box">
                <span class="lbl">CATEGORÍA</span>
                <span class="val font-symbols">{{ activeFinishedAlert.category }}</span>
              </div>
              <div class="detail-box box-highlight">
                <span class="lbl">TIEMPO META</span>
                <span class="val font-symbols">{{ activeFinishedAlert.net_time }}</span>
              </div>
              <div class="detail-box box-puesto-highlight">
                <span class="lbl">PUESTO</span>
                <span class="val font-symbols">
                  <Trophy :size="14" class="sym-inline" />
                  <span>PUESTO {{ activeFinishedAlert.position }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.public-race-live-layer {
  pointer-events: none;
}

.public-race-live-layer :deep(.countdown-overlay),
.ws-checkpoint-toast,
.ws-finished-overlay {
  pointer-events: auto;
}

.ws-checkpoint-toast {
  position: fixed;
  top: 90px;
  right: 24px;
  width: 320px;
  background: rgba(10, 10, 10, 0.95);
  border: 1.5px solid var(--primary-color, #ff5e00);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 94, 0, 0.25);
  z-index: 100000;
  backdrop-filter: blur(10px);
}

.toast-glow-strip {
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color, #ff5e00), var(--secondary-color, #ffc107));
  width: 100%;
}

.toast-content {
  display: flex;
  padding: 1rem;
  gap: 0.8rem;
  align-items: center;
}

.toast-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 94, 0, 0.1);
  border: 1px solid var(--primary-color, #ff5e00);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color, #ff5e00);
}

.toast-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.toast-title {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  color: var(--secondary-color, #ffc107);
  margin-bottom: 0.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.sym-inline {
  display: inline-block;
  vertical-align: -0.12em;
  flex-shrink: 0;
}

.toast-desc {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.2rem;
}

.toast-desc .plate {
  color: var(--primary-color, #ff5e00);
}

.toast-meta {
  font-size: 0.7rem;
  color: #a0aec0;
}

.toast-meta .time {
  color: #ffffff;
  margin-left: 0.3rem;
  font-family: monospace;
}

.toast-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-slide-leave-active {
  transition: all 0.25s ease-in;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
  filter: blur(4px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(120%) translateY(-20px);
}

.ws-finished-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 2, 2, 0.96);
  z-index: 100010;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  backdrop-filter: blur(15px);
}

.overlay-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 94, 0, 0.015) 1.5px, transparent 1.5px),
    linear-gradient(90deg, rgba(255, 94, 0, 0.015) 1.5px, transparent 1.5px);
  background-size: 30px 30px;
  z-index: 1;
}

.overlay-slanted-wipe {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 32%, rgba(255, 94, 0, 0.18) 0%, transparent 55%),
    #0c0c0c;
  z-index: 2;
  animation: slideSlantedIn 0.55s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  pointer-events: none;
  overflow: hidden;
}

.overlay-slanted-wipe::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 50%;
  width: 4px;
  height: 140%;
  margin-left: -2px;
  background: var(--primary-color, #ff5e00);
  box-shadow: 0 0 28px rgba(255, 94, 0, 0.45);
  transform: skewX(-12deg) translateX(-18vw);
  opacity: 0.85;
}

@keyframes slideSlantedIn {
  from { opacity: 0; transform: scale(1.04); }
  to { opacity: 1; transform: scale(1); }
}

.overlay-content {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  width: 100%;
  margin: 0;
  padding: 1rem;
  box-sizing: border-box;
  text-align: center;
  pointer-events: none;
}

.overlay-content > * {
  pointer-events: auto;
}

.glow-pulse-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulseFinishRing 2s ease-in-out infinite;
}

@keyframes pulseFinishRing {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(255, 94, 0, 0.3)); }
  50% { transform: scale(1.03); filter: drop-shadow(0 0 30px rgba(255, 94, 0, 0.6)); }
}

.giant-plate-number {
  font-family: 'Poppins', 'Impact', sans-serif !important;
  font-size: clamp(6rem, 18vw, 13rem);
  font-weight: 950;
  line-height: 1.1;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-color, #ff5e00) 0%, var(--secondary-color, #ffc107) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-style: italic;
  transform: rotate(-4deg);
  filter: drop-shadow(0 0 35px rgba(255, 94, 0, 0.45));
  animation: zoomPlateIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.45s forwards;
  opacity: 0;
  scale: 0.3;
}

@keyframes zoomPlateIn {
  to { opacity: 1; scale: 1; }
}

.meta-card {
  width: 100%;
  max-width: 500px;
  background: rgba(10, 10, 10, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  animation: slideMetaUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.75s forwards;
  opacity: 0;
  transform: translateY(40px);
}

@keyframes slideMetaUp {
  to { opacity: 1; transform: translateY(0); }
}

.meta-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: var(--primary-color, #ff5e00);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
}

.meta-name {
  font-size: clamp(1.6rem, 5vw, 2.5rem);
  font-weight: 950;
  color: #ffffff;
  margin: 0 0 1.2rem;
  text-transform: uppercase;
  letter-spacing: -1px;
}

.meta-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.detail-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.7rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-box .lbl {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: #94a3b8;
}

.detail-box .val {
  font-size: 0.95rem;
  color: #fff;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.box-highlight {
  border-color: rgba(255, 94, 0, 0.45);
  background: rgba(255, 94, 0, 0.08);
}

.box-highlight .lbl {
  color: var(--primary-color, #ff5e00);
}

.box-puesto-highlight {
  border-color: rgba(74, 222, 128, 0.35);
  background: rgba(74, 222, 128, 0.08);
}

.box-puesto-highlight .lbl {
  color: #4ade80;
}

.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .ws-checkpoint-toast {
    top: auto;
    bottom: calc(120px + env(safe-area-inset-bottom, 0px));
    right: 12px;
    left: 12px;
    width: auto;
  }

  .meta-details {
    grid-template-columns: 1fr;
  }
}
</style>
