<script setup>
import { ref, computed } from 'vue';
import { Trophy, Clock, Award, MapPin, BarChart2, Table as TableIcon } from 'lucide-vue-next';
import LeaderboardChart from './LeaderboardChart.vue';

const props = defineProps({
  riders: {
    type: Array,
    required: true
  }
});

const selectedResultsCategory = ref('Elite');
const categoriesList = ['Elite', 'Junior', 'Rígidas', 'Locales'];
const viewMode = ref('chart'); // 'chart' by default, switchable to 'table'


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
        { nombres_completos: "Luigi Travi Elite", numero_dorsal: 10, procedencia: "Lima", club_team: "Manka Riders Elite", tiempo_meta: "03:25.900", diferencia: "+00:11.450", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Sergio Balanza Huaraz", numero_dorsal: 101, procedencia: "Huaraz", club_team: "Ancash Riders", tiempo_meta: "03:27.150", diferencia: "+00:12.700", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Mateo Ganoza Trujillo", numero_dorsal: 102, procedencia: "Trujillo", club_team: "Chimu Downhill", tiempo_meta: "03:28.800", diferencia: "+00:14.350", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Julio Cesar Cueva", numero_dorsal: 103, procedencia: "Chacas", club_team: "Manka Riders", tiempo_meta: "03:29.950", diferencia: "+00:15.500", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Fabricio Peralta Arequipa", numero_dorsal: 104, procedencia: "Arequipa", club_team: "Misti DH", tiempo_meta: "03:31.200", diferencia: "+00:16.750", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Gonzalo Chavez Lima", numero_dorsal: 105, procedencia: "Lima", club_team: "Lima Downhill Club", tiempo_meta: "03:32.400", diferencia: "+00:17.950", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Nicolas Lopez Chacas", numero_dorsal: 106, procedencia: "Chacas", club_team: "Manka Riders", tiempo_meta: "03:33.600", diferencia: "+00:19.150", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Gabriel Ruiz Caraz", numero_dorsal: 107, procedencia: "Caraz", club_team: "Callejon de Huaylas DH", tiempo_meta: "03:35.100", diferencia: "+00:20.650", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Sebastian Valdivia Cusco", numero_dorsal: 108, procedencia: "Cusco", club_team: "Inka Riders Cusco", tiempo_meta: "03:36.450", diferencia: "+00:22.000", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Rodrigo Rivas Huaraz", numero_dorsal: 109, procedencia: "Huaraz", club_team: "Ancash Riders", tiempo_meta: "03:38.200", diferencia: "+00:23.750", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Adrian Fernandez Chacas", numero_dorsal: 110, procedencia: "Chacas", club_team: "Manka Riders", tiempo_meta: "03:39.500", diferencia: "+00:25.050", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Daniel Torres Yungay", numero_dorsal: 111, procedencia: "Yungay", club_team: "Huascaran Extreme", tiempo_meta: "03:41.120", diferencia: "+00:26.670", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Marcos Estrada Huaraz", numero_dorsal: 112, procedencia: "Huaraz", club_team: "Cordillera Blanca DH", tiempo_meta: "03:42.400", diferencia: "+00:27.950", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Franco Merino Lima", numero_dorsal: 113, procedencia: "Lima", club_team: "Lima Downhill Club", tiempo_meta: "03:43.700", diferencia: "+00:29.250", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Lucas Espinoza Caraz", numero_dorsal: 114, procedencia: "Caraz", club_team: "Callejon de Huaylas DH", tiempo_meta: "03:45.000", diferencia: "+00:30.550", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Joaquin Salazar Trujillo", numero_dorsal: 115, procedencia: "Trujillo", club_team: "Chimu Downhill", tiempo_meta: "03:46.300", diferencia: "+00:31.850", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Bruno Caceres Chacas", numero_dorsal: 116, procedencia: "Chacas", club_team: "Manka Riders", tiempo_meta: "03:47.800", diferencia: "+00:33.350", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Alejandro Flores Arequipa", numero_dorsal: 117, procedencia: "Arequipa", club_team: "Misti DH", tiempo_meta: "03:49.200", diferencia: "+00:34.750", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Santiago Ramos Chacas", numero_dorsal: 118, procedencia: "Chacas", club_team: "Manka Riders", tiempo_meta: "03:50.500", diferencia: "+00:36.050", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Mauricio Delgado Lima", numero_dorsal: 119, procedencia: "Lima", club_team: "Lima Downhill Club", tiempo_meta: "03:51.850", diferencia: "+00:37.400", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Ricardo Ortiz Huaraz", numero_dorsal: 120, procedencia: "Huaraz", club_team: "Cordillera Blanca DH", tiempo_meta: "03:53.200", diferencia: "+00:38.750", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Leonardo Vega Yungay", numero_dorsal: 121, procedencia: "Yungay", club_team: "Huascaran Extreme", tiempo_meta: "03:54.600", diferencia: "+00:40.150", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Javier Mendoza Caraz", numero_dorsal: 122, procedencia: "Caraz", club_team: "Callejon de Huaylas DH", tiempo_meta: "03:55.900", diferencia: "+00:41.450", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Alvaro Pinedo Lima", numero_dorsal: 123, procedencia: "Lima", club_team: "Lima Downhill Club", tiempo_meta: "03:57.300", diferencia: "+00:42.850", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Hugo Vasquez Chacas", numero_dorsal: 124, procedencia: "Chacas", club_team: "Manka Riders", tiempo_meta: "03:58.800", diferencia: "+00:44.350", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Fernando Castro Huaraz", numero_dorsal: 125, procedencia: "Huaraz", club_team: "Ancash Riders", tiempo_meta: "04:00.120", diferencia: "+00:45.670", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Matias Gomez Yungay", numero_dorsal: 126, procedencia: "Yungay", club_team: "Huascaran Extreme", tiempo_meta: "04:01.500", diferencia: "+00:47.050", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Cristian Rojas Caraz", numero_dorsal: 127, procedencia: "Caraz", club_team: "Callejon de Huaylas DH", tiempo_meta: "04:03.000", diferencia: "+00:48.550", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Felipe Herrera Trujillo", numero_dorsal: 128, procedencia: "Trujillo", club_team: "Chimu Downhill", tiempo_meta: "04:04.500", diferencia: "+00:50.050", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Samuel Mendez Chacas", numero_dorsal: 129, procedencia: "Chacas", club_team: "Manka Riders", tiempo_meta: "04:06.000", diferencia: "+00:51.550", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Diego Alexander Ramos", numero_dorsal: 130, procedencia: "Chacas", club_team: "Ancash Riders", tiempo_meta: "04:07.500", diferencia: "+00:53.050", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Ignacio Valenzuela Lima", numero_dorsal: 131, procedencia: "Lima", club_team: "Lima Downhill Club", tiempo_meta: "04:09.120", diferencia: "+00:54.670", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Roberto Villanueva Huaraz", numero_dorsal: 132, procedencia: "Huaraz", club_team: "Ancash Riders", tiempo_meta: "04:10.500", diferencia: "+00:56.050", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Marcelo Cisneros Yungay", numero_dorsal: 133, procedencia: "Yungay", club_team: "Huascaran Extreme", tiempo_meta: "04:12.100", diferencia: "+00:57.650", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Luis Enrique Prado", numero_dorsal: 134, procedencia: "Lima", club_team: "Manka Riders", tiempo_meta: "04:13.800", diferencia: "+00:59.350", estado_carrera: "llego", foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Gustavo Adolfo Becerra", numero_dorsal: 135, procedencia: "Arequipa", club_team: "Misti DH", tiempo_meta: null, diferencia: "--:--", estado_carrera: "DNF", foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
        { nombres_completos: "Angel Daniel Castillo", numero_dorsal: 136, procedencia: "Chacas", club_team: "Manka Riders", tiempo_meta: null, diferencia: "--:--", estado_carrera: "DNS", foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" }
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
      <div class="toolbar-left">
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
      </div>
      
      <div class="toolbar-right">
        <!-- View Toggle Buttons -->
        <div class="view-mode-toggle-wrap">
          <button 
            class="toggle-btn font-accent"
            :class="{ 'active': viewMode === 'chart' }"
            @click="viewMode = 'chart'"
          >
            <BarChart2 :size="14" />
            <span>GRÁFICO</span>
          </button>
          <button 
            class="toggle-btn font-accent"
            :class="{ 'active': viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <TableIcon :size="14" />
            <span>TABLA</span>
          </button>
        </div>
        
        <div class="results-meta-tag font-accent">
          REGISTRO CERRADO Y OFICIALIZADO
        </div>
      </div>
    </div>

    <!-- Interactive Leaderboard Chart -->
    <LeaderboardChart 
      v-if="viewMode === 'chart'"
      :riders="finalLeaderboard"
    />

    <!-- Leaderboard Table (Desktop View fallback) -->
    <div v-else class="table-and-cards-view-wrap">
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

    <!-- Leaderboard Cards (Mobile View) -->
    <div class="results-mobile-view">
      <div 
        v-for="(rider, idx) in finalLeaderboard" 
        :key="idx"
        class="rider-card"
        :class="{ 
          'podium-card-1st': idx === 0 && rider.estado_carrera === 'llego',
          'podium-card-2nd': idx === 1 && rider.estado_carrera === 'llego',
          'podium-card-3rd': idx === 2 && rider.estado_carrera === 'llego'
        }"
      >
        <!-- Carbon background texture / lines -->
        <div class="rider-card__bg-pattern"></div>
        
        <!-- Corner brackets for high-tech look -->
        <span class="card-bracket tl"></span>
        <span class="card-bracket tr"></span>
        <span class="card-bracket bl"></span>
        <span class="card-bracket br"></span>

        <!-- Card Header: Position, Avatar, Pilot, Dorsal -->
        <div class="rider-card__header">
          <!-- Position badge -->
          <div class="rider-card__position">
            <div class="podium-badge-premium" v-if="idx < 3 && rider.estado_carrera === 'llego'" :class="'podium-rank-' + (idx + 1)">
              <Trophy :size="12" class="trophy-icon" />
              <span>{{ idx + 1 }}</span>
            </div>
            <span v-else class="normal-position-badge font-podium">#{{ String(idx + 1).padStart(2, '0') }}</span>
          </div>

          <!-- Avatar Frame with glowing rings -->
          <div class="rider-card__avatar-frame-wrap">
            <div class="rider-card__avatar-frame">
              <img :src="rider.foto_url" :alt="rider.nombres_completos" class="rider-card__avatar" />
            </div>
            <!-- Glowing status indicator dot -->
            <span class="status-dot" :class="rider.estado_carrera"></span>
          </div>

          <!-- Pilot Name & Team -->
          <div class="rider-card__pilot-details">
            <h3 class="rider-card__name font-podium">{{ rider.nombres_completos }}</h3>
            <span class="rider-card__team" v-if="rider.club_team">
              <span class="team-icon">🏁</span> {{ rider.club_team }}
            </span>
            <span class="rider-card__team no-team" v-else>
              <span class="team-icon">🏁</span> INDEPENDIENTE
            </span>
          </div>

          <!-- Dorsal Pill styled like a race plate -->
          <div class="rider-card__dorsal font-podium">
            <div class="dorsal-plate">
              <span class="dorsal-plate__title">DORSAL</span>
              <span class="dorsal-plate__number">{{ rider.numero_dorsal ?? '--' }}</span>
            </div>
          </div>
        </div>

        <!-- Card Body: Origin and Stats Grid -->
        <div class="rider-card__body">
          <!-- Procedencia -->
          <div class="rider-card__info-row">
            <div class="rider-card__origin">
              <MapPin :size="12" class="origin-icon" />
              <span class="rider-card__label">Procedencia:</span>
              <span class="rider-card__value">{{ rider.procedencia }}</span>
            </div>
          </div>
          
          <!-- Grid of stats -->
          <div class="rider-card__stats-grid">
            <!-- Tiempo Total -->
            <div class="rider-card__stat-item">
              <div class="stat-hdr">
                <Clock :size="10" class="stat-icon" />
                <span class="rider-card__stat-label">TIEMPO TOTAL</span>
              </div>
              <span class="rider-card__stat-value font-podium highlight-time">
                {{ rider.tiempo_meta ?? '--:--' }}
              </span>
            </div>

            <!-- Diferencia -->
            <div class="rider-card__stat-item">
              <div class="stat-hdr">
                <Award :size="10" class="stat-icon" />
                <span class="rider-card__stat-label">DIFERENCIA</span>
              </div>
              <span class="rider-card__stat-value font-podium" :class="{ 'first-place-color': idx === 0 }">
                {{ rider.diferencia }}
              </span>
            </div>

            <!-- Estado -->
            <div class="rider-card__stat-item status-col">
              <span class="rider-card__stat-label">ESTADO</span>
              <div class="rider-card__stat-value flex-center">
                <span v-if="rider.estado_carrera === 'llego'" class="status-pill status-pill--arrived">LLEGÓ</span>
                <span v-else-if="rider.estado_carrera === 'DNF'" class="status-pill status-pill--dnf">DNF</span>
                <span v-else-if="rider.estado_carrera === 'DNS'" class="status-pill status-pill--dns">DNS</span>
                <span v-else class="status-pill status-pill--dns">DNS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-mode-toggle-wrap {
  display: flex;
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.2rem;
  backdrop-filter: blur(10px);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.45rem 1rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.03);
}

.toggle-btn.active {
  color: #000;
  background: var(--primary-color);
  box-shadow: 0 2px 8px rgba(255, 94, 0, 0.3);
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

  .toolbar-right {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
  }

  .view-mode-toggle-wrap {
    justify-content: center;
  }

  .toggle-btn {
    flex: 1;
    justify-content: center;
  }

  .results-meta-tag {
    text-align: center;
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

/* Cards view hidden by default */
.results-mobile-view {
  display: none;
}

/* Card layout styles */
.rider-card {
  position: relative;
  background: linear-gradient(145deg, rgba(18, 18, 18, 0.95) 0%, rgba(8, 8, 8, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.rider-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 94, 0, 0.3);
  box-shadow: 0 12px 30px rgba(255, 94, 0, 0.05);
}

/* Background Carbon Pattern */
.rider-card__bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 94, 0, 0.015) 1px, transparent 0);
  background-size: 12px 12px;
  pointer-events: none;
  z-index: 0;
}

/* Corner Brackets for Tech Look */
.card-bracket {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  pointer-events: none;
  z-index: 1;
}
.card-bracket.tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
.card-bracket.tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
.card-bracket.bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
.card-bracket.br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

.rider-card:hover .card-bracket {
  border-color: rgba(255, 94, 0, 0.35);
}

/* Podium Border Highlights and subtle glowing backgrounds */
.podium-card-1st {
  border-left: 4px solid #fbbf24;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.03) 0%, rgba(12, 12, 12, 0.95) 100%);
  box-shadow: inset 3px 0 15px rgba(251, 191, 36, 0.02), 0 10px 25px rgba(0, 0, 0, 0.4);
}
.podium-card-1st .card-bracket.tl, .podium-card-1st .card-bracket.bl {
  border-color: rgba(251, 191, 36, 0.25);
}

.podium-card-2nd {
  border-left: 4px solid #94a3b8;
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.03) 0%, rgba(12, 12, 12, 0.95) 100%);
}
.podium-card-2nd .card-bracket.tl, .podium-card-2nd .card-bracket.bl {
  border-color: rgba(148, 163, 184, 0.25);
}

.podium-card-3rd {
  border-left: 4px solid #e27d34;
  background: linear-gradient(135deg, rgba(226, 125, 52, 0.03) 0%, rgba(12, 12, 12, 0.95) 100%);
}
.podium-card-3rd .card-bracket.tl, .podium-card-3rd .card-bracket.bl {
  border-color: rgba(226, 125, 52, 0.25);
}

/* Premium Podium Badge */
.podium-badge-premium {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  font-family: var(--font-podium);
  font-weight: 900;
  font-size: 0.8rem;
  min-width: 42px;
}

.podium-rank-1st {
  background: rgba(251, 191, 36, 0.08);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.1);
}

.podium-rank-2nd {
  background: rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.podium-rank-3rd {
  background: rgba(226, 125, 52, 0.08);
  color: #fb923c;
  border: 1px solid rgba(226, 125, 52, 0.2);
}

.normal-position-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  font-weight: 800;
  padding: 0.3rem 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  min-width: 42px;
}

/* Header */
.rider-card__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  z-index: 2;
}

/* Avatar layout with glowing indicators */
.rider-card__avatar-frame-wrap {
  position: relative;
  flex-shrink: 0;
}

.rider-card__avatar-frame {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 2.5px;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.podium-card-1st .rider-card__avatar-frame {
  border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.25);
}

.podium-card-2nd .rider-card__avatar-frame {
  border-color: rgba(203, 213, 225, 0.5);
}

.podium-card-3rd .rider-card__avatar-frame {
  border-color: rgba(251, 146, 60, 0.5);
}

.rider-card__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #080808;
}
.status-dot.llego { background-color: #22c55e; box-shadow: 0 0 6px #22c55e; }
.status-dot.DNF { background-color: #ef4444; }
.status-dot.DNS { background-color: #9ca3af; }

/* Pilot Details & Name */
.rider-card__pilot-details {
  flex-grow: 1;
  min-width: 0;
}

.rider-card__name {
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 900;
  margin-bottom: 0.25rem;
  line-height: 1.25;
  text-transform: uppercase;
  word-wrap: break-word;
  letter-spacing: 0.5px;
}

.rider-card__team {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--font-accent);
  color: var(--primary-color);
  font-size: 0.68rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.rider-card__team.no-team {
  color: rgba(255, 255, 255, 0.3);
}

.team-icon {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Dorsal Plate DH Style */
.dorsal-plate {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: #000;
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
  min-width: 48px;
  transform: skewX(-6deg);
  box-shadow: 0 4px 10px rgba(255, 94, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dorsal-plate__title {
  font-size: 0.45rem;
  font-weight: 950;
  letter-spacing: 0.5px;
  line-height: 1;
  opacity: 0.8;
}

.dorsal-plate__number {
  font-size: 0.95rem;
  font-weight: 950;
  line-height: 1.1;
}

.podium-card-1st .dorsal-plate {
  background: #fbbf24;
  box-shadow: 0 4px 10px rgba(251, 191, 36, 0.2);
}

/* Card Body */
.rider-card__body {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 2;
}

/* Origin Info Row */
.rider-card__origin {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
}

.origin-icon {
  color: var(--primary-color);
  opacity: 0.85;
}

.rider-card__label {
  color: rgba(255, 255, 255, 0.35);
  font-weight: 600;
}

.rider-card__value {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
}

/* Stats HUD Grid */
.rider-card__stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.rider-card__stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding-right: 0.25rem;
}

.rider-card__stat-item:last-child {
  border-right: none;
  padding-right: 0;
}

.stat-hdr {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0.6;
}

.stat-icon {
  color: var(--primary-color);
}

.rider-card__stat-label {
  font-family: var(--font-accent);
  font-size: 0.52rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;
  font-weight: 800;
}

.rider-card__stat-value {
  font-size: 0.85rem;
  color: #ffffff;
  font-weight: 850;
  letter-spacing: 0.2px;
}

.rider-card__stat-value.highlight-time {
  color: #fff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
}

.rider-card__stat-value .status-pill {
  font-size: 0.55rem;
  font-weight: 900;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

/* Helper flex layout styles */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.status-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.status-col .rider-card__stat-label {
  text-align: center;
}

@media (max-width: 768px) {
  .results-table-panel {
    display: none; /* Hide table on mobile */
  }

  .results-mobile-view {
    display: flex; /* Show cards on mobile */
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 5rem;
  }
}

@media (max-width: 400px) {
  .rider-card__stats-grid {
    padding: 0.5rem;
  }
  .rider-card__stat-value {
    font-size: 0.78rem;
  }
}
</style>
