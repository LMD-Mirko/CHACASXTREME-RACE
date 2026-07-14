<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Users, Award, ArrowLeft } from 'lucide-vue-next';

import RidersPadron from '@/features/edition4/components/RidersPadron.vue';
import LeaderboardResults from '@/features/edition4/components/LeaderboardResults.vue';
import SponsorsList from '@/features/edition4/components/SponsorsList.vue';
import Edition4SplashScreen from '@/features/edition4/components/Edition4SplashScreen.vue';
import StartTimesPanel from '@/features/edition4/components/StartTimesPanel.vue';
import DevCredit from '@/components/common/DevCredit.vue';
import { useEdition4Race } from '@/features/edition4/composables/useEdition4Race';

const showSplash = ref(true);
const route = useRoute();
const router = useRouter();

const {
  ridersList,
  categoryNames,
  activeCompetition,
  viewPhase,
  isFinalView,
  classificationRiders,
  manga,
  ridersLoading,
  resultsLoading,
  ridersError,
  resultsError,
  wsConnected,
  latestStart,
  phaseStartRows,
  phaseLabel,
  setViewPhase,
} = useEdition4Race();

const activeTab = ref('padron');
const tabs = [
  { id: 'padron', name: 'Padrón', icon: Users, hash: '#padron' },
  { id: 'resultados', name: 'Resultados', icon: Award, hash: '#resultados' },
];

watch(() => route.hash, (newHash) => {
  const matchingTab = tabs.find((tab) => tab.hash === newHash);
  if (matchingTab) {
    activeTab.value = matchingTab.id;
  } else {
    router.replace({ path: route.path, hash: '#padron' });
  }
}, { immediate: true });

const changeTab = (tabId) => {
  activeTab.value = tabId;
  router.push({ path: route.path, hash: `#${tabId}` });
};
</script>

<template>
  <div class="edition4-view-root">
    <Edition4SplashScreen v-if="showSplash" @finish="showSplash = false" />
    <div v-else class="edition4-view">
      <div class="dynamic-ambient-bg">
        <div class="ambient-blob blob-orange"></div>
        <div class="ambient-blob blob-yellow"></div>
        <div class="ambient-blob blob-red"></div>
        <div class="speed-lines-grid"></div>
      </div>

      <div class="editorial-grid">
        <div class="grid-col-line"></div>
        <div class="grid-col-line"></div>
        <div class="grid-col-line"></div>
        <div class="grid-col-line"></div>
      </div>
      <div class="carbon-mesh-overlay"></div>

      <div class="exit-container container">
        <button @click="router.push('/inicio')" class="btn-exit font-accent">
          <ArrowLeft :size="15" />
          <span>VOLVER AL INICIO</span>
        </button>
      </div>

      <header class="edition4-hero container">
        <div class="edition4-badge-wrap">
          <span class="edition4-badge">IV EDICIÓN OFICIAL</span>
          <span class="edition4-date">28 DE JULIO</span>
        </div>
        <h1 class="edition4-title font-podium">
          CHACAS <span class="primary-text">XTREME</span> RACE
        </h1>
        <p class="edition4-subtitle">
          {{ activeCompetition?.name || 'Centro de carrera' }} · Mega Avalancha, categorías,
          clasificación, final y telemetría en vivo.
        </p>

        <div class="dashboard-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn font-accent"
            :class="{ active: activeTab === tab.id }"
            @click="changeTab(tab.id)"
          >
            <component :is="tab.icon" :size="16" class="tab-icon" />
            <span>{{ tab.name }}</span>
          </button>
        </div>
      </header>

      <main class="container view-content-wrap">
        <div v-if="activeTab === 'padron'" class="animated-fade">
          <p v-if="ridersError" class="api-error-banner">{{ ridersError }}</p>
          <p v-else-if="ridersLoading" class="api-loading-banner">Cargando padrón…</p>
          <RidersPadron
            :riders="ridersList"
            :categories="categoryNames"
          />
        </div>

        <div v-else-if="activeTab === 'resultados'" class="animated-fade">
          <StartTimesPanel
            :starts="phaseStartRows"
            :latest-start="latestStart"
            :phase-label="phaseLabel"
          />
          <LeaderboardResults
            :riders="classificationRiders"
            :categories="categoryNames"
            :view-phase="viewPhase"
            :is-final-view="isFinalView"
            :manga="manga"
            :loading="resultsLoading"
            :error="resultsError"
            @update:view-phase="setViewPhase"
          />
        </div>

        <SponsorsList class="animated-fade" />
      </main>

      <footer class="edition4-footer">
        <div class="container footer-content font-inter">
          <DevCredit />
          <div class="footer-meta">
            <span>Manka Riders EIRL © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.edition4-view-root {
  width: 100%;
  min-height: 100vh;
  background: #020202;
}

.edition4-view {
  background: #020202;
  color: #fff;
  min-height: 100vh;
  padding-top: 80px; /* Space from top */
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Background lines */
.editorial-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  pointer-events: none;
  z-index: 1;
}
.grid-col-line {
  border-right: 1px solid rgba(255, 255, 255, 0.02);
  height: 100%;
}

/* Carbon overlay */
.carbon-mesh-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(rgba(255, 94, 0, 0.02) 1.5px, transparent 1.5px), 
    radial-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px);
  background-size: 20px 20px, 40px 40px;
  pointer-events: none;
  z-index: 1;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
}

/* Exit Button Styling */
.exit-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.btn-exit {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.6rem 1.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 2px;
  border-radius: 100px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.btn-exit:hover {
  background: var(--primary-color);
  color: #000;
  border-color: var(--primary-color);
  box-shadow: 0 0 15px rgba(255, 94, 0, 0.35);
  transform: translateY(-2px);
}

/* Hero section */
.edition4-hero {
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.edition4-badge-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}

.edition4-badge {
  padding: 0.3rem 0.9rem;
  background: rgba(255, 94, 0, 0.1);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.65rem;
  letter-spacing: 2.5px;
  border-radius: 100px;
}

.edition4-date {
  color: rgba(255, 255, 255, 0.45);
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 2px;
}

.edition4-title {
  font-size: clamp(2.4rem, 5vw, 4.4rem);
  font-weight: 950;
  line-height: 0.95;
  margin: 0 0 1rem 0;
  letter-spacing: -1.5px;
}

.primary-text {
  color: var(--primary-color);
}

.edition4-subtitle {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.52);
  max-width: 720px;
  margin: 0 auto 2.5rem;
  line-height: 1.65;
}

.edition4-title {
  text-shadow: 0 0 40px rgba(255, 94, 0, 0.18);
}

.dashboard-tabs {
  animation: tabsIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes tabsIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

/* Dashboard Tab Controls */
.dashboard-tabs {
  display: flex;
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid rgba(255, 94, 0, 0.25);
  padding: 0.35rem;
  border-radius: 14px;
  backdrop-filter: blur(25px);
  gap: 0.4rem;
  width: fit-content;
  margin-bottom: 1.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 94, 0, 0.08);
}

.tab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.8rem 1.8rem;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 2px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-transform: uppercase;
}

.tab-btn:hover {
  color: #fff;
  background: rgba(255, 94, 0, 0.05);
}

.tab-btn.active {
  color: #020202;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 5px 15px rgba(255, 94, 0, 0.35), 0 0 20px rgba(251, 191, 36, 0.15);
}

/* Tab Sections Animations */
.animated-fade {
  animation: tabFadeIn 0.5s ease-out;
}

@keyframes tabFadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* View Content wrapper */
.view-content-wrap {
  min-height: 50vh;
  flex: 1;
}

/* Telemetries info footer */
.edition4-footer {
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding: 1.5rem 0;
  margin-top: 5rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.25);
}

.footer-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-left: auto;
}

/* RESPONSIVE LAYOUT */
@media (max-width: 1024px) {
  .edition4-view {
    padding-top: 50px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1.2rem;
  }

  .exit-container {
    margin-bottom: 0.5rem;
  }

  .btn-exit {
    padding: 0.5rem 1rem;
    font-size: 0.65rem;
  }

  .edition4-hero {
    margin-bottom: 1.5rem;
  }

  .edition4-title {
    font-size: 2.2rem;
  }

  .edition4-subtitle {
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  .tab-btn {
    padding: 0.6rem 1.1rem;
    font-size: 0.7rem;
    gap: 0.4rem;
  }
}

@media (max-width: 480px) {
  .dashboard-tabs {
    flex-wrap: wrap;
    justify-content: center;
    border-radius: 16px;
    padding: 0.3rem;
  }

  .tab-btn {
    flex: 1 1 40%;
    justify-content: center;
    padding: 0.5rem 0.8rem;
  }
}

/* Dynamic Ambient Background Styles */
.dynamic-ambient-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  background: #020203;
}

.ambient-blob {
  position: absolute;
  border-radius: 50%;
  will-change: transform;
  pointer-events: none;
  opacity: 0.9;
}

.blob-orange {
  top: 5%;
  left: -15%;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(255, 94, 0, 0.22) 0%, rgba(255, 94, 0, 0.08) 50%, transparent 75%);
  animation: floatBlob1 28s ease-in-out infinite alternate;
}

.blob-yellow {
  bottom: -5%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.16) 0%, rgba(251, 191, 36, 0.05) 50%, transparent 75%);
  animation: floatBlob2 32s ease-in-out infinite alternate;
}

.blob-red {
  top: 35%;
  left: 25%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.14) 0%, rgba(239, 68, 68, 0.04) 50%, transparent 75%);
  animation: floatBlob3 24s ease-in-out infinite alternate;
}

@keyframes floatBlob1 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(8%, 12%, 0) scale(1.1); }
  100% { transform: translate3d(-4%, -5%, 0) scale(0.95); }
}

@keyframes floatBlob2 {
  0% { transform: translate3d(0, 0, 0) scale(1.05); }
  50% { transform: translate3d(-10%, -6%, 0) scale(0.95); }
  100% { transform: translate3d(6%, 8%, 0) scale(1.08); }
}

@keyframes floatBlob3 {
  0% { transform: translate3d(0, 0, 0) scale(0.95); }
  50% { transform: translate3d(6%, -12%, 0) scale(1.05); }
  100% { transform: translate3d(-8%, 6%, 0) scale(1); }
}

/* Speed lines grid scrolling overlay - GPU Optimized 2D translate, no perspective/rotateX */
.speed-lines-grid {
  position: absolute;
  inset: -80px;
  width: calc(100% + 160px);
  height: calc(100% + 160px);
  background: 
    linear-gradient(45deg, rgba(255, 94, 0, 0.008) 25%, transparent 25%), 
    linear-gradient(-45deg, rgba(255, 94, 0, 0.008) 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, rgba(255, 94, 0, 0.008) 75%), 
    linear-gradient(-45deg, transparent 75%, rgba(255, 94, 0, 0.008) 75%);
  background-size: 80px 80px;
  animation: scrollSpeedGrid 16s linear infinite;
  will-change: transform;
}

@keyframes scrollSpeedGrid {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(80px, 80px, 0);
  }
}

.api-error-banner,
.api-loading-banner {
  text-align: center;
  margin-bottom: 1.25rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
}
.api-error-banner {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}
.api-loading-banner {
  background: rgba(255, 94, 0, 0.08);
  border: 1px solid rgba(255, 94, 0, 0.25);
  color: rgba(255,255,255,0.7);
}

</style>
