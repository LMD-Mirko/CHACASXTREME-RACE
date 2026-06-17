<script setup>
import { ref, computed } from 'vue';
import { 
  Play, 
  RotateCcw, 
  Timer, 
  Activity,
  Heart
} from 'lucide-vue-next';

const props = defineProps({
  isSimulating: { type: Boolean, required: true },
  liveTimeMs: { type: Number, required: true },
  routeProgress: { type: Number, required: true },
  activeRiderOnMap: { type: Object, default: null },
  liveLeaderboard: { type: Array, required: true },
  simSpeed: { type: String, required: true },
  simAltimetry: { type: Number, required: true },
  simHeartRate: { type: Number, required: true },
  formattedLiveTime: { type: String, required: true }
});

const emit = defineEmits(['start', 'stop', 'reset']);

// Map node coordinates
const startCoords = { x: 40, y: 160 };
const p1Coords = { x: 180, y: 70 };
const finishCoords = { x: 340, y: 130 };

// Selected spectate rider
const spectatedRiderId = ref(null);

// Get progress of a rider based on current simulation time
const getRiderProgress = (rider) => {
  if (rider.estado_carrera === 'pre_inscrito' || rider.estado_carrera === 'DNS') return 0;
  if (rider.estado_carrera === 'llego') return 100;
  if (rider.estado_carrera === 'DNF') return 48; // Crashed at intermediate rock garden area

  // If racing: calculate progress based on time elapsed
  const currentSecs = props.liveTimeMs / 1000;
  const startTime = (rider.id - 1) * 8;
  const duration = 25 + (rider.id % 4) * 3;
  const progress = ((currentSecs - startTime) / duration) * 100;
  return Math.min(99.9, Math.max(0, progress));
};

// Interpolate coordinates on the Bezier downhill path
const getCoordsForProgress = (progressVal) => {
  const t = progressVal / 100;
  let x = 0;
  let y = 0;
  
  if (t < 0.5) {
    const tNorm = t * 2;
    const p0 = startCoords;
    const p1 = { x: 100, y: 120 };
    const p2 = { x: 150, y: 40 };
    const p3 = p1Coords;
    
    x = Math.pow(1 - tNorm, 3) * p0.x + 3 * Math.pow(1 - tNorm, 2) * tNorm * p1.x + 3 * (1 - tNorm) * Math.pow(tNorm, 2) * p2.x + Math.pow(tNorm, 3) * p3.x;
    y = Math.pow(1 - tNorm, 3) * p0.y + 3 * Math.pow(1 - tNorm, 2) * tNorm * p1.y + 3 * (1 - tNorm) * Math.pow(tNorm, 2) * p2.y + Math.pow(tNorm, 3) * p3.y;
  } else {
    const tNorm = (t - 0.5) * 2;
    const p0 = p1Coords;
    const p1 = { x: 220, y: 110 };
    const p2 = { x: 300, y: 160 };
    const p3 = finishCoords;
    
    x = Math.pow(1 - tNorm, 3) * p0.x + 3 * Math.pow(1 - tNorm, 2) * tNorm * p1.x + 3 * (1 - tNorm) * Math.pow(tNorm, 2) * p2.x + Math.pow(tNorm, 3) * p3.x;
    y = Math.pow(1 - tNorm, 3) * p0.y + 3 * Math.pow(1 - tNorm, 2) * tNorm * p1.y + 3 * (1 - tNorm) * Math.pow(tNorm, 2) * p2.y + Math.pow(tNorm, 3) * p3.y;
  }
  return { x, y };
};

// Compute dynamic list of active riders with their map coordinates
const activeRidersOnMap = computed(() => {
  if (!props.isSimulating) return [];
  return props.liveLeaderboard
    .filter(r => r.estado_carrera === 'en_carrera')
    .map(r => {
      const progress = getRiderProgress(r);
      return {
        ...r,
        progress,
        coords: getCoordsForProgress(progress)
      };
    });
});

// Currently spectated rider logic
const currentSpectatedRider = computed(() => {
  if (spectatedRiderId.value) {
    const found = props.liveLeaderboard.find(r => r.id === spectatedRiderId.value);
    if (found) return found;
  }
  
  // Defaults to leader in track
  const active = props.liveLeaderboard.find(r => r.estado_carrera === 'en_carrera');
  if (active) return active;

  // Fallback to first arrived
  const arrived = props.liveLeaderboard.find(r => r.estado_carrera === 'llego');
  if (arrived) return arrived;

  // Default to first competitor
  return props.liveLeaderboard[0] || null;
});

// Spectated telemetry metrics calculated in sync
const spectatedTelemetry = computed(() => {
  const r = currentSpectatedRider.value;
  if (!r) return { speed: '0.0', altimetry: 3800, heartRate: 0, progress: 0 };
  
  const progress = getRiderProgress(r);
  
  if (r.estado_carrera === 'DNS') {
    return { speed: '0.0', altimetry: 3800, heartRate: 0, progress: 0 };
  }
  if (r.estado_carrera === 'DNF') {
    return { speed: '0.0', altimetry: 3550, heartRate: 0, progress: 48 };
  }
  if (r.estado_carrera === 'llego') {
    return { speed: '0.0', altimetry: 3359, heartRate: 0, progress: 100 };
  }

  // Active racing values
  const speed = (52 + Math.sin(props.liveTimeMs / 1500 + r.id) * 6 + (r.id % 3)).toFixed(1);
  const altimetry = Math.max(3359, Math.round(3800 - (3800 - 3359) * (progress / 100)));
  const heartRate = Math.round(162 + Math.sin(props.liveTimeMs / 800 + r.id) * 8 + (r.id % 2) * 4);
  
  return { speed, altimetry, heartRate, progress };
});

const selectRiderForSpectating = (riderId) => {
  spectatedRiderId.value = riderId;
};

const resetSpectating = () => {
  spectatedRiderId.value = null;
  emit('reset');
};
</script>

<template>
  <div class="telemetry-grid">
    <!-- Left side: Live Leaderboard -->
    <div class="live-leaderboard-panel">
      <div class="panel-header">
        <div class="panel-title-wrap">
          <div class="live-badge">🔴 EN VIVO</div>
          <h2 class="panel-title font-podium">TABLA GENERAL LIVE</h2>
        </div>
        <!-- Telemetry Timer -->
        <div class="telemetry-timer">
          <Timer :size="16" class="timer-icon" />
          <span class="timer-digits font-podium">{{ formattedLiveTime }}</span>
        </div>
      </div>

      <!-- Simulation Controls -->
      <div class="simulation-controls">
        <button 
          v-if="!isSimulating" 
          @click="emit('start')" 
          class="sim-btn sim-btn--primary font-accent"
        >
          <Play :size="16" />
          <span>INICIAR TRANSMISIÓN</span>
        </button>
        <button 
          v-else 
          @click="emit('stop')" 
          class="sim-btn sim-btn--danger font-accent"
        >
          <Timer :size="16" />
          <span>PAUSAR TRANSMISIÓN</span>
        </button>
        <button 
          @click="resetSpectating" 
          class="sim-btn sim-btn--secondary font-accent"
        >
          <RotateCcw :size="16" />
          <span>REINICIAR</span>
        </button>
      </div>

      <div class="spectate-tip font-accent">
        💡 Haz clic en la fila de un piloto para ver su telemetría en tiempo real.
      </div>

      <!-- Leaderboard Table -->
      <div class="live-table-container">
        <table class="live-table">
          <thead>
            <tr>
              <th>POS</th>
              <th>DORSAL</th>
              <th>PILOTO</th>
              <th>CAT</th>
              <th>P1 (HALF)</th>
              <th>META (FINISH)</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <TransitionGroup name="list" tag="tbody">
            <tr 
              v-for="(rider, index) in liveLeaderboard" 
              :key="rider.id"
              class="clickable-row"
              :class="{ 
                'row-active': rider.estado_carrera === 'en_carrera', 
                'row-finished': rider.estado_carrera === 'llego',
                'row-dnf': rider.estado_carrera === 'DNF',
                'row-dns': rider.estado_carrera === 'DNS',
                'row-spectating': currentSpectatedRider?.id === rider.id
              }"
              @click="selectRiderForSpectating(rider.id)"
            >
              <!-- Index column -->
              <td class="col-pos font-podium">
                <span v-if="rider.estado_carrera === 'llego'">{{ index + 1 }}</span>
                <span v-else-if="rider.estado_carrera === 'en_carrera'" class="pos-pulse">▶</span>
                <span v-else>--</span>
              </td>

              <!-- Dorsal number -->
              <td class="col-dorsal font-podium">
                <span class="dorsal-pill">{{ rider.numero_dorsal ?? '--' }}</span>
              </td>

              <!-- Pilot Info -->
              <td class="col-pilot">
                <div class="pilot-info-wrap">
                  <div class="pilot-avatar-frame" :class="rider.estado_carrera">
                    <img :src="rider.foto_url" :alt="rider.nombres_completos" class="pilot-table-avatar" />
                  </div>
                  <div class="pilot-info">
                    <span class="pilot-name">{{ rider.nombres_completos }}</span>
                    <span class="pilot-team" v-if="rider.club_team">{{ rider.club_team }}</span>
                  </div>
                </div>
              </td>

              <!-- Category -->
              <td class="col-cat font-accent">{{ rider.categoria_elegida }}</td>

              <!-- Checkpoint 1 Time -->
              <td class="col-p1 font-podium">
                <span v-if="rider.paso_p1" class="check-time check-time--p1">{{ rider.hora_p1.substring(3, 11) }}</span>
                <span v-else-if="rider.estado_carrera === 'en_carrera'" class="live-blink">CRUZANDO...</span>
                <span v-else class="status-mute">PENDIENTE</span>
              </td>

              <!-- Meta Finish Time -->
              <td class="col-meta font-podium">
                <div class="meta-finish-wrap" v-if="rider.estado_carrera === 'llego'">
                  <span class="final-time">{{ rider.tiempo_meta }}</span>
                  <span class="diff-time" :class="{ 'gold-text': rider.diferencia === '00:00.00' }">{{ rider.diferencia }}</span>
                </div>
                <span v-else-if="rider.estado_carrera === 'en_carrera' && rider.paso_p1" class="live-blink active">EN TRAMO FINAL...</span>
                <span v-else-if="rider.estado_carrera === 'DNF'" class="status-badge status-badge--dnf">DNF</span>
                <span v-else-if="rider.estado_carrera === 'DNS'" class="status-badge status-badge--dns">DNS</span>
                <span v-else class="status-mute">--</span>
              </td>

              <!-- Carrera Status -->
              <td class="col-status">
                <span v-if="rider.estado_carrera === 'llego'" class="status-tag arrived">LLEGÓ</span>
                <span v-else-if="rider.estado_carrera === 'en_carrera'" class="status-tag racing">RACING</span>
                <span v-else-if="rider.estado_carrera === 'DNF'" class="status-tag dnf">DNF</span>
                <span v-else-if="rider.estado_carrera === 'DNS'" class="status-tag dns">DNS</span>
                <span v-else class="status-tag pre">HOLD</span>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </div>

    <!-- Right side: Vector Route Map -->
    <div class="live-map-panel">
      <div class="panel-header">
        <h2 class="panel-title font-podium">RECORRIDO VECTORIAL (DH CHACAS)</h2>
      </div>
      
      <div class="map-viewport">
        <!-- Futuristic Live Telemetry Overlay -->
        <div class="map-overlay-telemetry font-accent" v-if="currentSpectatedRider">
          <div class="telemetry-header">TELEMETRÍA EN VIVO</div>
          
          <div class="telemetry-pilot-card">
            <div class="telemetry-pilot-photo-wrap">
              <img :src="currentSpectatedRider.foto_url" class="telemetry-pilot-photo" />
              <span class="telemetry-dorsal-badge font-podium">#{{ currentSpectatedRider.numero_dorsal }}</span>
            </div>
            <div class="telemetry-pilot-meta">
              <span class="telemetry-pilot-name font-podium">{{ currentSpectatedRider.nombres_completos.split(' ')[0] }} {{ currentSpectatedRider.nombres_completos.split(' ')[1] || '' }}</span>
              <span class="telemetry-pilot-team">{{ currentSpectatedRider.club_team || currentSpectatedRider.procedencia }}</span>
              <span class="telemetry-state-pill" :class="currentSpectatedRider.estado_carrera">
                {{ currentSpectatedRider.estado_carrera === 'en_carrera' ? 'EN PISTA' : currentSpectatedRider.estado_carrera.toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Progress Bar in HUD -->
          <div class="telemetry-progress-wrap">
            <div class="telemetry-progress-lbl">
              <span>PROGRESO RUTA</span>
              <span>{{ spectatedTelemetry.progress.toFixed(0) }}%</span>
            </div>
            <div class="telemetry-progress-bar-bg">
              <div class="telemetry-progress-bar-fill" :style="{ width: spectatedTelemetry.progress + '%' }"></div>
            </div>
          </div>

          <div class="telemetry-metrics">
            <div class="tel-metric">
              <span class="tel-lbl">VELOCIDAD</span>
              <span class="tel-val text-yellow">{{ spectatedTelemetry.speed }} km/h</span>
            </div>
            <div class="tel-metric">
              <span class="tel-lbl">ALTITUD</span>
              <span class="tel-val text-orange">{{ spectatedTelemetry.altimetry }} msnm</span>
            </div>
            <div class="tel-metric">
              <span class="tel-lbl">PULSACIONES</span>
              <span class="tel-val text-red">
                <Heart :size="12" class="heart-pulse-icon" />
                {{ spectatedTelemetry.heartRate }} bpm
              </span>
            </div>
          </div>
        </div>

        <svg width="100%" height="100%" viewBox="0 0 400 250" class="svg-map">
          <!-- Grid telemetry background inside SVG -->
          <defs>
            <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" stroke-width="1" />
            </pattern>
            <linearGradient id="route-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ff5e00" />
              <stop offset="50%" stop-color="#fbbf24" />
              <stop offset="100%" stop-color="#ff0044" />
            </linearGradient>
            <!-- Glow filter for nodes -->
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <!-- Grid fill -->
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />

          <!-- SVG Downhill Path representation -->
          <path 
            d="M 40,160 C 100,120 150,40 180,70 C 220,110 300,160 340,130" 
            fill="none" 
            stroke="rgba(255,255,255,0.06)" 
            stroke-width="8" 
            stroke-linecap="round"
          />
          
          <!-- Active glowing route path -->
          <path 
            d="M 40,160 C 100,120 150,40 180,70 C 220,110 300,160 340,130" 
            fill="none" 
            stroke="url(#route-gradient)" 
            stroke-width="4" 
            stroke-linecap="round"
            class="svg-map__route-active"
            :style="{ strokeDasharray: 600, strokeDashoffset: isSimulating ? 600 - (600 * routeProgress / 100) : 600 }"
          />

          <!-- Checkpoint/Trail Labels -->
          <g font-size="5" fill="rgba(255, 255, 255, 0.35)" font-weight="900" class="font-accent">
            <text x="100" y="140" text-anchor="middle">CURVA DEL DIABLO</text>
            <text x="270" y="160" text-anchor="middle">RAMPA DE ROCAS</text>
          </g>

          <!-- Checkpoint Nodes -->
          <!-- START NODE -->
          <g class="map-node">
            <circle :cx="startCoords.x" :cy="startCoords.y" r="14" fill="#111" stroke="#ff5e00" stroke-width="2" />
            <circle :cx="startCoords.x" :cy="startCoords.y" r="6" fill="#ff5e00" class="pulse-node" />
            <text :x="startCoords.x" :y="startCoords.y - 22" fill="#fff" font-size="7" font-weight="900" text-anchor="middle" class="font-accent">PARTIDA</text>
            <text :x="startCoords.x" :y="startCoords.y - 12" fill="rgba(255,255,255,0.4)" font-size="5.5" text-anchor="middle">3,800 msnm</text>
          </g>

          <!-- CHECKPOINT 1 NODE (SALTO DEL GATO) -->
          <g class="map-node">
            <circle :cx="p1Coords.x" :cy="p1Coords.y" r="14" fill="#111" stroke="#fbbf24" stroke-width="2" />
            <circle 
              :cx="p1Coords.x" 
              :cy="p1Coords.y" 
              r="6" 
              fill="#fbbf24" 
              :class="{ 'pulse-node': isSimulating }" 
            />
            <text :x="p1Coords.x" :y="p1Coords.y - 22" fill="#fff" font-size="7" font-weight="900" text-anchor="middle" class="font-accent">P1 (EL SALTO)</text>
            <text :x="p1Coords.x" :y="p1Coords.y - 12" fill="rgba(255,255,255,0.4)" font-size="5.5" text-anchor="middle">3,550 msnm</text>
          </g>

          <!-- FINISH NODE -->
          <g class="map-node">
            <circle :cx="finishCoords.x" :cy="finishCoords.y" r="14" fill="#111" stroke="#ff0044" stroke-width="2" />
            <circle 
              :cx="finishCoords.x" 
              :cy="finishCoords.y" 
              r="6" 
              fill="#ff0044" 
              :class="{ 'pulse-node': isSimulating }"
            />
            <text :x="finishCoords.x" :y="finishCoords.y - 22" fill="#fff" font-size="7" font-weight="900" text-anchor="middle" class="font-accent">META (PLAZA)</text>
            <text :x="finishCoords.x" :y="finishCoords.y - 12" fill="rgba(255,255,255,0.4)" font-size="5.5" text-anchor="middle">3,359 msnm</text>
          </g>

          <!-- Simulated Rider Dots on Track (Multi-rider tracking) -->
          <g v-for="rider in activeRidersOnMap" :key="rider.id" filter="url(#neon-glow)">
            <circle 
              :cx="rider.coords.x" 
              :cy="rider.coords.y" 
              r="10" 
              :fill="rider.id === currentSpectatedRider?.id ? '#ff5e00' : '#ffffff'" 
              stroke="#ff5e00" 
              stroke-width="2.5" 
            />
            <circle :cx="rider.coords.x" :cy="rider.coords.y" r="3" fill="#000000" />
            
            <rect 
              :x="rider.coords.x - 18" 
              :y="rider.coords.y + 12" 
              width="36" 
              height="11" 
              rx="3" 
              fill="rgba(5,5,5,0.9)" 
              stroke="rgba(255,255,255,0.2)" 
              stroke-width="0.5" 
            />
            <text 
              :x="rider.coords.x" 
              :y="rider.coords.y + 20" 
              fill="#fff" 
              font-size="6" 
              font-weight="900" 
              text-anchor="middle" 
              class="font-accent"
            >
              #{{ rider.numero_dorsal }}
            </text>
          </g>
        </svg>
      </div>
      
      <!-- Map Telemetry Details panel -->
      <div class="map-telemetry-specs">
        <div class="spec-tile">
          <span class="spec-label">DIFICULTAD RUTA</span>
          <span class="spec-value text-red">EXTREMA ELITE</span>
        </div>
        <div class="spec-tile">
          <span class="spec-label">DESNIVEL NEGATIVO</span>
          <span class="spec-value">-441m</span>
        </div>
        <div class="spec-tile">
          <span class="spec-label">LONGITUD TOTAL</span>
          <span class="spec-value">3.2 KM</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.telemetry-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2.5rem;
  margin-bottom: 5rem;
  align-items: start;
}

.live-leaderboard-panel, .live-map-panel {
  background: rgba(8, 8, 8, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.8rem;
  backdrop-filter: blur(20px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.panel-title {
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: 1px;
  margin: 0;
}

.live-badge {
  font-family: var(--font-accent);
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 1px;
  background: rgba(255, 0, 68, 0.1);
  color: #ff0044;
  border: 1px solid rgba(255, 0, 68, 0.2);
  padding: 0.15rem 0.5rem;
  border-radius: 100px;
  width: fit-content;
  margin-bottom: 0.4rem;
  animation: blinkFast 1.2s infinite;
}

@keyframes blinkFast {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.telemetry-timer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.45rem 1rem;
  border-radius: 8px;
}

.timer-icon {
  color: var(--primary-color);
  animation: rotateSlow 4s linear infinite;
}

@keyframes rotateSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.timer-digits {
  font-size: 1.3rem;
  color: #fff;
}

.spectate-tip {
  font-size: 0.72rem;
  color: var(--secondary-color);
  margin-bottom: 1.2rem;
  background: rgba(251, 191, 36, 0.06);
  border: 1px dashed rgba(251, 191, 36, 0.2);
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
}

/* Simulation buttons */
.simulation-controls {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}

.sim-btn {
  border: none;
  padding: 0.7rem 1.2rem;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 1px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.sim-btn--primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #000;
}

.sim-btn--primary:hover {
  background: #fff;
  box-shadow: 0 0 15px rgba(255, 94, 0, 0.45);
}

.sim-btn--danger {
  background: #ff0044;
  color: #fff;
}

.sim-btn--danger:hover {
  background: #cc0033;
  box-shadow: 0 0 15px rgba(255, 0, 68, 0.4);
}

.sim-btn--secondary {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
}

.sim-btn--secondary:hover {
  background: rgba(255,255,255,0.08);
}

/* Table live reordering styling */
.live-table-container {
  overflow-x: auto;
}

.live-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.live-table th {
  font-family: var(--font-accent);
  font-size: 0.65rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 1px;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.live-table td {
  padding: 0.95rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

/* Clickable rows */
.clickable-row {
  cursor: pointer;
  transition: all 0.25s ease;
}

.clickable-row:hover {
  background: rgba(255, 255, 255, 0.02) !important;
}

/* Row states */
.live-table tr.row-active {
  background: rgba(255, 94, 0, 0.02);
}

.live-table tr.row-finished {
  background: rgba(251, 191, 36, 0.01);
}

.live-table tr.row-dnf, .live-table tr.row-dns {
  opacity: 0.35;
}

/* Spectating Row Highlighting */
.live-table tr.row-spectating {
  background: rgba(255, 94, 0, 0.08) !important;
  border-left: 3px solid var(--primary-color);
}

.live-table tr.row-spectating td {
  color: #fff;
}

.col-pos {
  font-size: 0.95rem;
  font-weight: 900;
  color: rgba(255,255,255,0.7);
}

.pos-pulse {
  color: var(--primary-color);
  animation: blinkSlow 1.5s infinite;
}

@keyframes blinkSlow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

.dorsal-pill {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: #fff;
}

.row-active .dorsal-pill {
  background: rgba(255, 94, 0, 0.15);
  border-color: rgba(255, 94, 0, 0.3);
  color: var(--primary-color);
}

.row-finished .dorsal-pill {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.row-spectating .dorsal-pill {
  box-shadow: 0 0 10px rgba(255, 94, 0, 0.4);
}

.pilot-info {
  display: flex;
  flex-direction: column;
}

.pilot-name {
  font-weight: 700;
  color: #fff;
  font-size: 0.85rem;
}

.pilot-team {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.35);
  margin-top: 0.15rem;
}

.check-time {
  background: rgba(255,255,255,0.03);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.check-time--p1 {
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.live-blink {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  animation: blinkSlow 1.5s infinite;
}

.live-blink.active {
  color: var(--primary-color);
  font-weight: 700;
}

.meta-finish-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.final-time {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 800;
}

.diff-time {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
}

.gold-text {
  color: #fbbf24 !important;
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.status-badge--dnf {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-badge--dns {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

.status-mute {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.15);
}

.status-tag {
  font-family: var(--font-accent);
  font-size: 0.58rem;
  font-weight: 900;
  padding: 0.2rem 0.6rem;
  border-radius: 100px;
  display: inline-block;
}

.status-tag.arrived {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-tag.racing {
  background: rgba(255, 94, 0, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(255, 94, 0, 0.2);
  animation: blinkSlow 1.5s infinite;
}

.status-tag.dnf {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-tag.dns {
  background: rgba(156, 163, 175, 0.1);
  color: #9ca3af;
}

.status-tag.pre {
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.3);
}

/* LIST TRANSITIONS (FLIP MOVE) */
.list-move {
  transition: transform 0.6s ease;
}

/* Map Panel view */
.map-viewport {
  width: 100%;
  aspect-ratio: 1.6;
  background: radial-gradient(circle at center, #0b0b0c 0%, #020202 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: inset 0 10px 30px rgba(0,0,0,0.8);
  position: relative;
}

.svg-map {
  display: block;
}

.svg-map__route-active {
  filter: drop-shadow(0 0 4px rgba(255, 94, 0, 0.5));
  transition: stroke-dashoffset 0.05s linear;
}

.pulse-node {
  animation: nodePulse 1.8s infinite;
  transform-origin: center;
}

@keyframes nodePulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}

.map-telemetry-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.spec-tile {
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.spec-label {
  font-family: var(--font-accent);
  font-size: 0.52rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.5px;
  margin-bottom: 0.3rem;
}

.spec-value {
  font-family: var(--font-podium);
  font-size: 0.9rem;
  font-weight: 900;
  color: #fff;
}

.text-red {
  color: #ff0044;
}

/* Pilot Table Avatars - Enlarged & state color frames */
.pilot-info-wrap {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.pilot-avatar-frame {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 2px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pilot-avatar-frame.en_carrera {
  border-color: var(--primary-color);
  box-shadow: 0 0 10px rgba(255, 94, 0, 0.4);
}

.pilot-avatar-frame.llego {
  border-color: var(--secondary-color);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
}

.pilot-avatar-frame.DNF {
  border-color: #ef4444;
}

.pilot-table-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* Map HUD telemetry overlay card */
.map-overlay-telemetry {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(5, 5, 5, 0.88);
  border: 1.5px solid rgba(255, 94, 0, 0.35);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(25px);
  width: 220px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.85), 0 0 15px rgba(255, 94, 0, 0.05);
  z-index: 100;
  pointer-events: none;
  animation: tabFadeIn 0.3s ease-out;
}

.telemetry-header {
  font-size: 0.55rem;
  font-weight: 950;
  color: var(--primary-color);
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.3rem;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

/* Telemetry Pilot Profile Card */
.telemetry-pilot-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.telemetry-pilot-photo-wrap {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.telemetry-pilot-photo {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  border: 1.5px solid var(--primary-color);
}

.telemetry-dorsal-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: var(--secondary-color);
  color: #000;
  font-size: 0.55rem;
  font-weight: 900;
  padding: 0.05rem 0.25rem;
  border-radius: 3px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
}

.telemetry-pilot-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.telemetry-pilot-name {
  font-size: 0.75rem;
  font-weight: 900;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.telemetry-pilot-team {
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.1rem;
}

.telemetry-state-pill {
  font-size: 0.5rem;
  font-weight: 900;
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
  width: fit-content;
  margin-top: 0.2rem;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

.telemetry-state-pill.en_carrera {
  background: rgba(255, 94, 0, 0.15);
  color: var(--primary-color);
}

.telemetry-state-pill.llego {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.telemetry-state-pill.DNF {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.telemetry-state-pill.DNS {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

/* Progress bar inside HUD */
.telemetry-progress-wrap {
  margin-bottom: 0.8rem;
}

.telemetry-progress-lbl {
  display: flex;
  justify-content: space-between;
  font-size: 0.5rem;
  color: rgba(255,255,255,0.4);
  margin-bottom: 0.2rem;
  font-weight: 800;
}

.telemetry-progress-bar-bg {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 100px;
  overflow: hidden;
}

.telemetry-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.1s linear;
}

.telemetry-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 0.6rem;
}

.tel-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tel-lbl {
  font-size: 0.5rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.tel-val {
  font-size: 0.78rem;
  font-weight: 900;
  color: #fff;
  font-family: var(--font-podium);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.heart-pulse-icon {
  animation: heartBeat 0.8s infinite;
  color: #ef4444;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}

.text-yellow {
  color: #fbbf24 !important;
}
.text-orange {
  color: #ff7300 !important;
}
.text-red {
  color: #ef4444 !important;
}

@media (max-width: 1024px) {
  .telemetry-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .live-map-panel {
    order: -1;
  }

  .map-viewport {
    aspect-ratio: 1.8;
  }
}

@media (max-width: 768px) {
  .live-table th {
    padding: 0.6rem;
    font-size: 0.6rem;
  }

  .live-table td {
    padding: 0.75rem 0.6rem;
    font-size: 0.78rem;
  }

  .pilot-name {
    font-size: 0.78rem;
  }

  .pilot-team {
    font-size: 0.6rem;
  }

  .final-time {
    font-size: 0.78rem;
  }

  .spec-value {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .map-viewport {
    aspect-ratio: 1.5;
  }

  .simulation-controls {
    flex-direction: column;
  }

  .sim-btn {
    width: 100%;
    justify-content: center;
  }

  .live-table th:nth-child(4),
  .live-table td:nth-child(4) {
    display: none;
  }
  
  .map-overlay-telemetry {
    top: 0.5rem;
    right: 0.5rem;
    width: 160px;
    padding: 0.6rem 0.8rem;
  }
  .telemetry-pilot-photo {
    width: 35px;
    height: 35px;
  }
  .telemetry-pilot-name {
    font-size: 0.68rem;
  }
  .tel-val {
    font-size: 0.68rem;
  }
}
</style>
