<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { 
  Users, 
  Activity, 
  Award, 
  ArrowLeft,
  Handshake
} from 'lucide-vue-next';

// Import subcomponents
import RidersPadron from '@/features/edition4/components/RidersPadron.vue';
import LiveTelemetry from '@/features/edition4/components/LiveTelemetry.vue';
import LeaderboardResults from '@/features/edition4/components/LeaderboardResults.vue';
import SponsorsList from '@/features/edition4/components/SponsorsList.vue';
import Edition4SplashScreen from '@/features/edition4/components/Edition4SplashScreen.vue';

const showSplash = ref(true);
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// Tabs System Linked to Route Hash
const activeTab = ref('padron'); // default
const tabs = [
  { id: 'padron', name: 'Padrón', icon: Users, hash: '#padron' },
  { id: 'resultados', name: 'Resultados', icon: Award, hash: '#resultados' }
];

watch(() => route.hash, (newHash) => {
  const matchingTab = tabs.find(tab => tab.hash === newHash);
  if (matchingTab) {
    activeTab.value = matchingTab.id;
  } else {
    router.replace({ path: route.path, hash: '#padron' });
  }
}, { immediate: true });

const changeTab = (tabId) => {
  activeTab.value = tabId;
  const hash = `#${tabId}`;
  router.push({ path: route.path, hash });
};

// -------------------------------------------------------------
// GLOBAL MOCK DATA STATE (SHARED ACCROSS TABS)
// -------------------------------------------------------------
const baseRiders = [
  // ELITE
  {
    id: 1,
    nombres_completos: "Mirko Daniel Ramos Limas",
    dni: "72145638",
    apodo: "El Rayo de Asunción",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Ancash Riders Team",
    instagram: "mirko_ramos_dh",
    telefono_emergencia: "943882211",
    foto_url: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 45,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 2,
    nombres_completos: "Carlos Mendoza Vega",
    dni: "45871296",
    apodo: "Chemo",
    categoria_elegida: "Elite",
    procedencia: "Huaraz",
    club_team: "Cordillera Blanca DH",
    instagram: "chemo_mendoza",
    telefono_emergencia: "920114455",
    foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 12,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 9,
    nombres_completos: "José Ignacio 'El Demonio'",
    dni: "71248963",
    apodo: "El Demonio",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders Elite",
    instagram: "eldemonio.mtb",
    telefono_emergencia: "983426996",
    foto_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 7,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 10,
    nombres_completos: "Luigi Travi Elite",
    dni: "41258963",
    apodo: "Gigi",
    categoria_elegida: "Elite",
    procedencia: "Lima",
    club_team: "Manka Riders Elite",
    instagram: "luigitravi",
    telefono_emergencia: "916773344",
    foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 10,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  // JUNIOR
  {
    id: 3,
    nombres_completos: "Juan Pérez Guerrero",
    dni: "70125489",
    apodo: "El Gato",
    categoria_elegida: "Junior",
    procedencia: "Lima",
    club_team: "Independiente",
    instagram: "juan_perez_dh",
    telefono_emergencia: "916778899",
    foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 88,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 4,
    nombres_completos: "Diego Torres Huamán",
    dni: "48751236",
    apodo: "Chispita",
    categoria_elegida: "Junior",
    procedencia: "Carhuaz",
    club_team: "Carhuaz Downhill Club",
    instagram: "diego_torres_ch",
    telefono_emergencia: "952663300",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 56,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  // RIGIDAS
  {
    id: 5,
    nombres_completos: "Luis Alberto Vega",
    dni: "46981247",
    apodo: "Lucho",
    categoria_elegida: "Rígidas",
    procedencia: "Chacas",
    club_team: "Manka Riders Club",
    instagram: "lucho_vega_dh",
    telefono_emergencia: "984552211",
    foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 72,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 6,
    nombres_completos: "Mateo Cerna Ortiz",
    dni: "74125896",
    apodo: "Matu",
    categoria_elegida: "Rígidas",
    procedencia: "Huaraz",
    club_team: "Huascarán DH",
    instagram: "mateocerna_dh",
    telefono_emergencia: "943228866",
    foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 19,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  // LOCALES
  {
    id: 7,
    nombres_completos: "Alejandro Tafur",
    dni: "73254125",
    apodo: "Alex",
    categoria_elegida: "Locales",
    procedencia: "Chacas",
    club_team: "Chacas DH",
    instagram: "alex_tafur_mtb",
    telefono_emergencia: "990112233",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 9,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 8,
    nombres_completos: "Sebastian Cueva",
    dni: "75841269",
    apodo: "Seba",
    categoria_elegida: "Locales",
    procedencia: "Chacas",
    club_team: "Manka Riders Club",
    instagram: "seba_cueva_dh",
    telefono_emergencia: "925336688",
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 31,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  }
];

const ridersList = ref(JSON.parse(JSON.stringify(baseRiders)));

// -------------------------------------------------------------
// SIMULATION ENGINE (STATE HANDLED AT PARENT LEVEL)
// -------------------------------------------------------------
const isSimulating = ref(false);
const liveTimeMs = ref(0);
const liveInterval = ref(null);
const routeProgress = ref(0);
const activeRiderOnMap = ref(null);

const simSpeed = ref('0.0');
const simAltimetry = ref(3800);
const simHeartRate = ref(0);

const formattedLiveTime = computed(() => {
  const totalSeconds = liveTimeMs.value / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const ms = Math.floor((liveTimeMs.value % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
});

const liveLeaderboard = computed(() => {
  return [...ridersList.value].sort((a, b) => {
    const scoreA = a.estado_carrera === 'DNF' || a.estado_carrera === 'DNS' ? 3 : (a.estado_carrera === 'llego' ? 1 : (a.estado_carrera === 'en_carrera' ? 2 : 4));
    const scoreB = b.estado_carrera === 'DNF' || b.estado_carrera === 'DNS' ? 3 : (b.estado_carrera === 'llego' ? 1 : (b.estado_carrera === 'en_carrera' ? 2 : 4));
    
    if (scoreA !== scoreB) return scoreA - scoreB;

    if (a.estado_carrera === 'llego' && b.estado_carrera === 'llego') {
      return a.tiempo_meta.localeCompare(b.tiempo_meta);
    }
    if (a.estado_carrera === 'en_carrera' && b.estado_carrera === 'en_carrera') {
      if (a.paso_p1 && !b.paso_p1) return -1;
      if (!a.paso_p1 && b.paso_p1) return 1;
      return (a.hora_p1 || '').localeCompare(b.hora_p1 || '');
    }
    return 0;
  });
});

const startSimulation = () => {
  if (isSimulating.value) return;
  isSimulating.value = true;
  liveTimeMs.value = 0;
  routeProgress.value = 0;

  ridersList.value.forEach(r => {
    r.estado_carrera = 'pre_inscrito';
    r.paso_p1 = false;
    r.hora_p1 = null;
    r.tiempo_meta = null;
    r.diferencia = '--:--';
  });

  const dnsRider = ridersList.value.find(r => r.id === 8);
  if (dnsRider) dnsRider.estado_carrera = 'DNS';

  let tickRate = 30;
  liveInterval.value = setInterval(() => {
    liveTimeMs.value += tickRate * 4;
    routeProgress.value = (routeProgress.value + 0.15) % 100;

    const currentSecs = liveTimeMs.value / 1000;

    // Set active rider on track
    const activeRider = ridersList.value.find(r => r.estado_carrera === 'en_carrera');
    if (activeRider) {
      activeRiderOnMap.value = activeRider;
      simSpeed.value = (52 + Math.sin(liveTimeMs.value / 1500) * 8 + Math.random() * 2).toFixed(1);
      simAltimetry.value = Math.max(3359, Math.round(3800 - (3800 - 3359) * (routeProgress.value / 100)));
      simHeartRate.value = Math.round(162 + Math.sin(liveTimeMs.value / 800) * 5 + Math.random() * 3);
    } else {
      const nextRider = ridersList.value.find(r => r.estado_carrera === 'pre_inscrito');
      if (nextRider) {
        activeRiderOnMap.value = nextRider;
      }
      simSpeed.value = '0.0';
      simAltimetry.value = 3800;
      simHeartRate.value = 0;
    }

    ridersList.value.forEach(rider => {
      if (rider.estado_carrera === 'DNS') return;

      if (rider.estado_carrera === 'pre_inscrito') {
        const startDelay = (rider.id - 1) * 8;
        if (currentSecs >= startDelay) {
          rider.estado_carrera = 'en_carrera';
        }
      }

      if (rider.estado_carrera === 'en_carrera' && !rider.paso_p1) {
        const p1Delay = (rider.id - 1) * 8 + 10 + (rider.id % 3) * 2;
        if (currentSecs >= p1Delay) {
          rider.paso_p1 = true;
          const baseHours = 11;
          const mins = Math.floor(currentSecs / 60);
          const secs = Math.floor(currentSecs % 60);
          const ms = Math.floor((liveTimeMs.value % 1000));
          rider.hora_p1 = `${baseHours}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
        }
      }

      if (rider.estado_carrera === 'en_carrera' && rider.paso_p1) {
        if (rider.id === 3 && currentSecs > 30) {
          rider.estado_carrera = 'DNF';
          return;
        }

        const finishDelay = (rider.id - 1) * 8 + 25 + (rider.id % 4) * 3;
        if (currentSecs >= finishDelay) {
          rider.estado_carrera = 'llego';
          const startDelay = (rider.id - 1) * 8;
          const totalSecondsSpent = currentSecs - startDelay;
          const mins = Math.floor(totalSecondsSpent / 60);
          const secs = Math.floor(totalSecondsSpent % 60);
          const ms = Math.floor((liveTimeMs.value % 1000) / 10);
          rider.tiempo_meta = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;
          
          const firstLlego = ridersList.value
            .filter(r => r.estado_carrera === 'llego')
            .sort((a,b) => a.tiempo_meta.localeCompare(b.tiempo_meta))[0];
            
          if (firstLlego) {
            ridersList.value.filter(r => r.estado_carrera === 'llego').forEach(r => {
              if (r.id === firstLlego.id) {
                r.diferencia = '00:00.00';
              } else {
                const diffSecs = parseTimeToSeconds(r.tiempo_meta) - parseTimeToSeconds(firstLlego.tiempo_meta);
                r.diferencia = `+${formatDiffSeconds(diffSecs)}`;
              }
            });
          }
        }
      }
    });

    const allFinished = ridersList.value.every(r => 
      r.estado_carrera === 'llego' || r.estado_carrera === 'DNF' || r.estado_carrera === 'DNS'
    );
    if (allFinished) {
      stopSimulation();
    }
  }, tickRate);
};

const stopSimulation = () => {
  isSimulating.value = false;
  if (liveInterval.value) {
    clearInterval(liveInterval.value);
    liveInterval.value = null;
  }
};

const resetSimulation = () => {
  stopSimulation();
  liveTimeMs.value = 0;
  routeProgress.value = 0;
  activeRiderOnMap.value = null;
  simSpeed.value = '0.0';
  simAltimetry.value = 3800;
  simHeartRate.value = 0;
  ridersList.value = JSON.parse(JSON.stringify(baseRiders));
};

const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const mins = parseInt(parts[0], 10);
  const secsParts = parts[1].split('.');
  const secs = parseInt(secsParts[0], 10);
  const ms = parseInt(secsParts[1], 10) / 100;
  return mins * 60 + secs + ms;
};

const formatDiffSeconds = (secsVal) => {
  const mins = Math.floor(secsVal / 60);
  const secs = Math.floor(secsVal % 60);
  const ms = Math.floor((secsVal % 1) * 100);
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;
};

onUnmounted(() => {
  stopSimulation();
});
</script>

<template>
  <Edition4SplashScreen v-if="showSplash" @finish="showSplash = false" />
  <div v-else class="edition4-view">
    <!-- Dynamic Animated Background -->
    <div class="dynamic-ambient-bg">
      <div class="ambient-blob blob-orange"></div>
      <div class="ambient-blob blob-yellow"></div>
      <div class="ambient-blob blob-red"></div>
      <div class="speed-lines-grid"></div>
    </div>

    <!-- Grid editorial backgrounds -->
    <div class="editorial-grid">
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
    </div>
    <div class="carbon-mesh-overlay"></div>

    <!-- Floating Back Button (No navbar, self-contained exit) -->
    <div class="exit-container container">
      <button @click="router.push('/inicio')" class="btn-exit font-accent">
        <ArrowLeft :size="15" />
        <span>VOLVER AL INICIO</span>
      </button>
    </div>

    <!-- Header Section -->
    <header class="edition4-hero container">
      <div class="edition4-badge-wrap">
        <span class="edition4-badge">IV EDICIÓN OFICIAL</span>
        <span class="edition4-date">28 DE JULIO</span>
      </div>
      <h1 class="edition4-title font-podium">
        CHACAS <span class="primary-text">XTREME</span> RACE
      </h1>
      <p class="edition4-subtitle">
        Centro de operaciones digital. Sigue el padrón, la carrera en vivo y los resultados oficiales.
      </p>

      <!-- Dashboard Tab Control -->
      <div class="dashboard-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn font-accent"
          :class="{ 'active': activeTab === tab.id }"
          @click="changeTab(tab.id)"
        >
          <component :is="tab.icon" :size="16" class="tab-icon" />
          <span>{{ tab.name }}</span>
        </button>
      </div>
    </header>

    <main class="container view-content-wrap">
      <!-- SUB-COMPONENTS INTERFACES -->
      <RidersPadron 
        v-if="activeTab === 'padron'" 
        :riders="ridersList" 
        class="animated-fade" 
      />

      <LeaderboardResults 
        v-if="activeTab === 'resultados'" 
        :riders="ridersList" 
        class="animated-fade" 
      />

      <!-- Sponsors List permanently rendered at the bottom of the active tab -->
      <SponsorsList class="animated-fade" />
    </main>

    <!-- Technical Info Footer -->
    <footer class="edition4-footer">
      <div class="container footer-content font-inter">
        <div>SYS_STATUS // SECURE_TELEMETRY // ONLINE</div>
        <div>Manka Riders EIRL © 2026</div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
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
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.55);
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
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
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.25);
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

/* Performance optimization for mobile devices (Remove backdrop blur) */
@media (max-width: 768px) {
  .dashboard-tabs {
    backdrop-filter: none !important;
    background: rgba(15, 15, 15, 0.95) !important;
  }
}
</style>
