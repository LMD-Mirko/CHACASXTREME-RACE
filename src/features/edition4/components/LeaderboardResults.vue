<script setup>
import { ref, computed } from 'vue';
import { Trophy } from 'lucide-vue-next';

const props = defineProps({
  riders: {
    type: Array,
    required: true
  }
});

const selectedResultsCategory = ref('Elite');
const categoriesList = ['Elite', 'Junior', 'Rígidas', 'Locales'];

// Computed category-filtered leaderboard results
const finalLeaderboard = computed(() => {
  const categoryRiders = props.riders.filter(r => r.categoria_elegida.toLowerCase() === selectedResultsCategory.value.toLowerCase());
  
  const hasArrived = categoryRiders.some(r => r.estado_carrera === 'llego' || r.estado_carrera === 'DNF' || r.estado_carrera === 'DNS');
  
  if (hasArrived) {
    // Return sorted simulated results
    return [...categoryRiders].sort((a, b) => {
      const scoreA = a.estado_carrera === 'DNF' || a.estado_carrera === 'DNS' ? 3 : (a.estado_carrera === 'llego' ? 1 : 2);
      const scoreB = b.estado_carrera === 'DNF' || b.estado_carrera === 'DNS' ? 3 : (b.estado_carrera === 'llego' ? 1 : 2);
      if (scoreA !== scoreB) return scoreA - scoreB;
      if (a.estado_carrera === 'llego' && b.estado_carrera === 'llego') {
        return a.tiempo_meta.localeCompare(b.tiempo_meta);
      }
      return 0;
    });
  } else {
    // Default closed mock results for immediate professional display
    const defaults = {
      Elite: [
        { nombres_completos: "Mirko Daniel Ramos Limas", numero_dorsal: 45, procedencia: "Chacas", club_team: "Ancash Riders Team", tiempo_meta: "03:14.450", diferencia: "00:00.000", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "José Ignacio 'El Demonio'", numero_dorsal: 7, procedencia: "Chacas", club_team: "Manka Riders Elite", tiempo_meta: "03:18.120", diferencia: "+00:03.670", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Carlos Mendoza Vega", numero_dorsal: 12, procedencia: "Huaraz", club_team: "Cordillera Blanca DH", tiempo_meta: "03:22.500", diferencia: "+00:08.050", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Luigi Travi Elite", numero_dorsal: 10, procedencia: "Lima", club_team: "Manka Riders Elite", tiempo_meta: "03:25.900", diferencia: "+00:11.450", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80" }
      ],
      Junior: [
        { nombres_completos: "Diego Torres Huamán", numero_dorsal: 56, procedencia: "Carhuaz", club_team: "Carhuaz Downhill Club", tiempo_meta: "03:32.110", diferencia: "00:00.000", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Juan Pérez Guerrero", numero_dorsal: 88, procedencia: "Lima", club_team: "Independiente", tiempo_meta: null, diferencia: "--:--", estado_carrera: "DNF", foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" }
      ],
      Rígidas: [
        { nombres_completos: "Luis Alberto Vega", numero_dorsal: 72, procedencia: "Chacas", club_team: "Manka Riders Club", tiempo_meta: "03:42.180", diferencia: "00:00.000", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Mateo Cerna Ortiz", numero_dorsal: 19, procedencia: "Huaraz", club_team: "Huascarán DH", tiempo_meta: "03:51.620", diferencia: "+00:09.440", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" }
      ],
      Locales: [
        { nombres_completos: "Alejandro Tafur", numero_dorsal: 9, procedencia: "Chacas", club_team: "Chacas DH", tiempo_meta: "03:28.900", diferencia: "00:00.000", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Sebastian Cueva", numero_dorsal: 31, procedencia: "Chacas", club_team: "Manka Riders Club", tiempo_meta: null, diferencia: "--:--", estado_carrera: "DNS", foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" }
      ]
    };
    return defaults[selectedResultsCategory.value] || [];
  }
});
</script>

<template>
  <div class="results-wrapper">
    <!-- Filters panel -->
    <div class="section-toolbar">
      <div class="horizontal-selector">
        <button
          v-for="cat in categoriesList"
          :key="cat"
          class="category-selector-btn font-podium"
          :class="{ 'active': selectedResultsCategory === cat }"
          @click="selectedResultsCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      <div class="results-meta-tag font-accent">
        REGISTRO CERRADO Y OFICIALIZADO
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div class="results-table-panel">
      <table class="results-table">
        <thead>
          <tr>
            <th>POSICIÓN</th>
            <th>DORSAL</th>
            <th>PILOTO</th>
            <th>PROCEDENCIA</th>
            <th>TIEMPO TOTAL</th>
            <th>DIFERENCIA</th>
            <th>ESTADO</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(rider, idx) in finalLeaderboard" 
            :key="idx"
            :class="{ 
              'podium-1st': idx === 0 && rider.estado_carrera === 'llego',
              'podium-2nd': idx === 1 && rider.estado_carrera === 'llego',
              'podium-3rd': idx === 2 && rider.estado_carrera === 'llego'
            }"
          >
            <!-- Position with podium colors -->
            <td class="col-pos font-podium">
              <div class="podium-badge" v-if="idx < 3 && rider.estado_carrera === 'llego'">
                <Trophy :size="14" class="trophy-icon" />
                <span>{{ idx + 1 }}</span>
              </div>
              <span v-else>{{ idx + 1 }}</span>
            </td>

            <!-- Dorsal Plate -->
            <td class="col-dorsal font-podium">
              <span class="dorsal-pill">{{ rider.numero_dorsal ?? '--' }}</span>
            </td>

            <!-- Pilot Details -->
            <td class="col-pilot">
              <div class="pilot-info-wrap">
                <div class="pilot-avatar-frame">
                  <img :src="rider.foto_url" :alt="rider.nombres_completos" class="pilot-table-avatar" />
                </div>
                <div class="pilot-info">
                  <span class="pilot-name font-podium">{{ rider.nombres_completos }}</span>
                  <span class="pilot-team" v-if="rider.club_team">{{ rider.club_team }}</span>
                </div>
              </div>
            </td>

            <!-- Origin -->
            <td>{{ rider.procedencia }}</td>

            <!-- Total Time -->
            <td class="col-time font-podium">
              <span>{{ rider.tiempo_meta ?? '--:--' }}</span>
            </td>

            <!-- Difference from 1st -->
            <td class="col-diff font-podium">
              <span :class="{ 'first-place-color': idx === 0 }">{{ rider.diferencia }}</span>
            </td>

            <!-- Status -->
            <td class="col-status">
              <span v-if="rider.estado_carrera === 'llego'" class="status-pill status-pill--arrived">LLEGÓ</span>
              <span v-else-if="rider.estado_carrera === 'DNF'" class="status-pill status-pill--dnf">DNF</span>
              <span v-else-if="rider.estado_carrera === 'DNS'" class="status-pill status-pill--dns">DNS</span>
              <span v-else class="status-pill status-pill--dns">DNS</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1.5rem;
}

.horizontal-selector {
  display: flex;
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid rgba(255, 94, 0, 0.25);
  border-radius: 12px;
  overflow: hidden;
  padding: 0.25rem;
}

.category-selector-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.6rem 1.4rem;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.category-selector-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.03);
}

.category-selector-btn.active {
  color: #020202;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  box-shadow: 0 4px 12px rgba(255, 94, 0, 0.35);
}

.results-meta-tag {
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 2px;
  background: rgba(34, 197, 94, 0.08);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  padding: 0.45rem 1rem;
  border-radius: 8px;
}

.results-table-panel {
  background: rgba(8, 8, 8, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.8rem;
  margin-bottom: 5rem;
  overflow-x: auto;
}

@media (min-width: 769px) {
  .results-table-panel {
    backdrop-filter: blur(12px);
  }
}

@media (max-width: 768px) {
  .results-table-panel {
    background: rgba(12, 12, 12, 0.95);
  }
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.results-table th {
  font-family: var(--font-accent);
  font-size: 0.65rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 1px;
  padding: 0.85rem 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.results-table td {
  padding: 1rem 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

/* Podium highlights */
.podium-1st {
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.04), transparent);
  border-left: 3px solid #fbbf24;
}

.podium-2nd {
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.04), transparent);
  border-left: 3px solid #94a3b8;
}

.podium-3rd {
  background: linear-gradient(90deg, rgba(180, 83, 9, 0.04), transparent);
  border-left: 3px solid #b45309;
}

.podium-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 900;
  font-size: 0.85rem;
}

.podium-1st .podium-badge {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.25);
}

.podium-2nd .podium-badge {
  background: rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.podium-3rd .podium-badge {
  background: rgba(180, 83, 9, 0.15);
  color: #fb923c;
  border: 1px solid rgba(180, 83, 9, 0.25);
}

.trophy-icon {
  animation: wobble 2s infinite;
}

@keyframes wobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}

.first-place-color {
  color: #fbbf24;
  font-weight: 800;
}

.col-time {
  font-size: 0.9rem;
  color: #fff;
  font-weight: 800;
}

.status-pill {
  font-family: var(--font-accent);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 0.15rem 0.5rem;
  border-radius: 100px;
}

.status-pill--arrived {
  background: rgba(34, 197, 94, 0.08);
  color: #22c55e;
}

.status-pill--dnf {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.status-pill--dns {
  background: rgba(156, 163, 175, 0.08);
  color: #9ca3af;
}

/* Table avatars */
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

.podium-1st .pilot-avatar-frame {
  border-color: #fbbf24;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.45);
}

.podium-2nd .pilot-avatar-frame {
  border-color: #cbd5e1;
  box-shadow: 0 0 10px rgba(203, 213, 225, 0.45);
}

.podium-3rd .pilot-avatar-frame {
  border-color: #fb923c;
  box-shadow: 0 0 10px rgba(251, 146, 60, 0.45);
}

.pilot-table-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .section-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .horizontal-selector {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .category-selector-btn {
    padding: 0.6rem 1.1rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .results-table th:nth-child(4),
  .results-table td:nth-child(4) {
    display: none;
  }
}
</style>
