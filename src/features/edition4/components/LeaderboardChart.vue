<script setup>
import { ref, computed } from 'vue';
import { Clock, Trophy, MapPin, Award, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  riders: {
    type: Array,
    required: true
  }
});

const hoveredRiderId = ref(null);
const activeRiderId = ref(null);
const scrollContainer = ref(null);

// Map of DOM elements for each column card, to calculate viewport offset dynamically
const columnRefs = {};
const setColumnRef = (el, id) => {
  if (el) {
    columnRefs[id] = el;
  } else {
    delete columnRefs[id];
  }
};

const tooltipStyle = ref({ left: '0px', top: '0px', opacity: 0 });

// Parse "MM:SS.ms" or "HH:MM:SS.ms" to raw seconds
const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  try {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const hrs = parseInt(parts[0], 10) || 0;
      const mins = parseInt(parts[1], 10) || 0;
      const secsParts = parts[2].split('.');
      const secs = parseInt(secsParts[0], 10) || 0;
      const ms = parseFloat('0.' + (secsParts[1] || '0')) || 0;
      return hrs * 3600 + mins * 60 + secs + ms;
    } else {
      const mins = parseInt(parts[0], 10) || 0;
      const secsParts = parts[1].split('.');
      const secs = parseInt(secsParts[0], 10) || 0;
      const ms = parseFloat('0.' + (secsParts[1] || '0')) || 0;
      return mins * 60 + secs + ms;
    }
  } catch (e) {
    return 0;
  }
};

// Process riders, sort them, and compute relative heights/widths
const chartData = computed(() => {
  // Sort riders: Llego first (by time), then DNF, then DNS
  const sorted = [...props.riders].sort((a, b) => {
    const scoreA = a.estado_carrera === 'DNF' || a.estado_carrera === 'DNS' ? 3 : (a.estado_carrera === 'llego' ? 1 : 2);
    const scoreB = b.estado_carrera === 'DNF' || b.estado_carrera === 'DNS' ? 3 : (b.estado_carrera === 'llego' ? 1 : 2);
    
    if (scoreA !== scoreB) return scoreA - scoreB;

    if (a.estado_carrera === 'llego' && b.estado_carrera === 'llego') {
      return a.tiempo_meta.localeCompare(b.tiempo_meta);
    }
    return 0;
  });

  const arrived = sorted.filter(r => r.estado_carrera === 'llego');
  const times = arrived.map(r => parseTimeToSeconds(r.tiempo_meta)).filter(t => t > 0);
  const minTime = times.length ? Math.min(...times) : 0;
  const maxTime = times.length ? Math.max(...times) : 0;

  return sorted.map((rider, index) => {
    let pctHeight = 12; // default for DNF/DNS/Hold
    
    if (rider.estado_carrera === 'llego') {
      if (maxTime === minTime || times.length === 1) {
        pctHeight = 42;
      } else {
        const timeSecs = parseTimeToSeconds(rider.tiempo_meta);
        const range = maxTime - minTime;
        const normalized = (timeSecs - minTime) / range;
        pctHeight = 42 - (normalized * 24); // 42% to 18%
      }
    }

    const uniqueId = rider.id || rider.numero_dorsal || `rider-${index}`;

    return {
      ...rider,
      id: uniqueId,
      position: index + 1,
      heightPct: pctHeight
    };
  });
});

const activeRider = computed(() => {
  const id = hoveredRiderId.value || activeRiderId.value;
  if (!id) return null;
  return chartData.value.find(r => r.id === id);
});

// Dynamic viewport calculations with boundary safety logic
const updateTooltipPosition = (riderId) => {
  if (!riderId) return;
  const el = columnRefs[riderId];
  if (!el) return;
  const viewportEl = el.closest('.chart-viewport');
  if (!viewportEl) return;

  const columnRect = el.getBoundingClientRect();
  const viewportRect = viewportEl.getBoundingClientRect();

  // 1. Calculate column horizontal center relative to the viewport
  let leftOffset = (columnRect.left + columnRect.width / 2) - viewportRect.left;

  // 2. Clamp position to prevent horizontal clipping at left/right edges
  const tooltipWidth = 230;
  const halfTooltip = tooltipWidth / 2;
  const safetyMargin = 16; // Margin from the black viewport borders
  const minLeft = halfTooltip + safetyMargin; // 131px
  const maxLeft = viewportRect.width - halfTooltip - safetyMargin;

  if (leftOffset < minLeft) leftOffset = minLeft;
  if (leftOffset > maxLeft) leftOffset = maxLeft;

  // 3. Position tooltip exactly 155px above the column top (so it fits within 600px viewport)
  const topOffset = (columnRect.top - viewportRect.top) - 155;

  tooltipStyle.value = {
    left: `${leftOffset}px`,
    top: `${topOffset}px`,
    opacity: 1
  };
};

// Carousel Scroll Navigation methods
const slidePrev = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -340, behavior: 'smooth' });
  }
};

const slideNext = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 340, behavior: 'smooth' });
  }
};

// Sync position during horizontal scrolling
const handleScroll = () => {
  const id = hoveredRiderId.value || activeRiderId.value;
  if (id) {
    updateTooltipPosition(id);
  }
};

// Hover and click triggers
const handleMouseEnter = (riderId) => {
  hoveredRiderId.value = riderId;
  updateTooltipPosition(riderId);
};

const handleMouseLeave = () => {
  hoveredRiderId.value = null;
};

const handleRiderClick = (riderId) => {
  if (activeRiderId.value === riderId) {
    activeRiderId.value = null;
  } else {
    activeRiderId.value = riderId;
    // Set position on next tick to ensure refs are ready
    setTimeout(() => {
      updateTooltipPosition(riderId);
    }, 0);
  }
};
</script>

<template>
  <div class="leaderboard-chart-wrap">
    <!-- SVGs gradients definitions -->
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffe259" />
          <stop offset="100%" stop-color="#ffa751" />
        </linearGradient>
        <linearGradient id="silver-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#94a3b8" />
        </linearGradient>
        <linearGradient id="bronze-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffb88c" />
          <stop offset="100%" stop-color="#de6262" />
        </linearGradient>
      </defs>
    </svg>

    <div class="chart-header-hint font-accent">
      💡 Clica en las flechas laterales para deslizar. Pasa el cursor (o presiona en celular) sobre la barra exacta de un piloto para ver su información.
    </div>

    <!-- Scrollable Chart container -->
    <div class="chart-viewport">
      <!-- Gradient Fades on the edges for a premium slider look -->
      <div class="viewport-fade viewport-fade--left"></div>
      <div class="viewport-fade viewport-fade--right"></div>

      <!-- Floating Carousel navigation buttons -->
      <button class="carousel-nav-btn btn-prev" @click="slidePrev" aria-label="Anterior">
        <ChevronLeft :size="24" stroke-width="3" />
      </button>
      <button class="carousel-nav-btn btn-next" @click="slideNext" aria-label="Siguiente">
        <ChevronRight :size="24" stroke-width="3" />
      </button>

      <!-- Scrollable Columns Wrapper -->
      <div class="columns-container" ref="scrollContainer" @scroll="handleScroll">
        <div 
          v-for="rider in chartData" 
          :key="rider.id" 
          :ref="el => setColumnRef(el, rider.id)"
          class="chart-column"
          :class="{
            'podium-1': rider.position === 1 && rider.estado_carrera === 'llego',
            'podium-2': rider.position === 2 && rider.estado_carrera === 'llego',
            'podium-3': rider.position === 3 && rider.estado_carrera === 'llego',
            'column-inactive': rider.estado_carrera === 'DNF' || rider.estado_carrera === 'DNS',
            'column-active-touch': activeRiderId === rider.id
          }"
          :style="{ height: rider.heightPct + '%' }"
          @mouseenter="handleMouseEnter(rider.id)"
          @mouseleave="handleMouseLeave"
          @click="handleRiderClick(rider.id)"
        >
          <!-- Top decoration layer -->
          <div class="column-decoration">
            <!-- 1st: Golden Crown -->
            <div class="podium-item-crown" v-if="rider.position === 1 && rider.estado_carrera === 'llego'">
              <svg viewBox="0 0 100 100" class="svg-crown">
                <path d="M15,75 L85,75 L78,35 L60,52 L50,22 L40,52 L22,35 Z" fill="url(#gold-gradient)" stroke="#ffe259" stroke-width="2" />
                <circle cx="50" cy="22" r="5" fill="#ffffff" stroke="#ffa751" stroke-width="1" />
                <circle cx="22" cy="35" r="4" fill="#ffffff" />
                <circle cx="78" cy="35" r="4" fill="#ffffff" />
                <path d="M22,75 L78,75" stroke="#ffffff" stroke-dasharray="1.5,1.5" stroke-width="2" />
              </svg>
            </div>
            
            <!-- 2nd: Silver Laurel Wreath -->
            <div class="podium-item-laurel" v-if="rider.position === 2 && rider.estado_carrera === 'llego'">
              <svg viewBox="0 0 100 100" class="svg-laurel">
                <!-- Left leaf branch -->
                <path d="M35,75 C22,70 18,48 26,28 C28,25 26,23 24,25 C15,44 19,70 33,78 C35,79 36,77 35,75 Z" fill="url(#silver-gradient)" stroke="#ffffff" stroke-width="0.5" />
                <path d="M24,32 Q16,28 21,23 Q28,28 24,32 Z" fill="url(#silver-gradient)" />
                <path d="M22,44 Q14,40 18,34 Q26,38 22,44 Z" fill="url(#silver-gradient)" />
                <path d="M23,56 Q14,54 18,48 Q27,50 23,56 Z" fill="url(#silver-gradient)" />
                <path d="M26,67 Q18,68 20,60 Q30,61 26,67 Z" fill="url(#silver-gradient)" />
                <!-- Right leaf branch -->
                <path d="M65,75 C78,70 82,48 74,28 C72,25 74,23 76,25 C85,44 81,70 67,78 C65,79 64,77 65,75 Z" fill="url(#silver-gradient)" stroke="#ffffff" stroke-width="0.5" />
                <path d="M76,32 Q84,28 79,23 Q72,28 76,32 Z" fill="url(#silver-gradient)" />
                <path d="M78,44 Q86,40 82,34 Q74,38 78,44 Z" fill="url(#silver-gradient)" />
                <path d="M77,56 Q86,54 82,48 Q73,50 77,56 Z" fill="url(#silver-gradient)" />
                <path d="M74,67 Q82,68 80,60 Q70,61 74,67 Z" fill="url(#silver-gradient)" />
              </svg>
            </div>

            <!-- 3rd: Bronze Badge -->
            <div class="podium-item-bronze" v-if="rider.position === 3 && rider.estado_carrera === 'llego'">
              <svg viewBox="0 0 100 100" class="svg-bronze">
                <path d="M50,18 L76,27 C76,55 50,82 50,82 C50,82 24,55 24,27 Z" fill="url(#bronze-gradient)" stroke="#ffffff" stroke-width="1.5" />
                <text x="50" y="58" font-size="28" font-family="var(--font-podium)" font-weight="950" fill="#ffffff" text-anchor="middle" stroke="#b24a00" stroke-width="1">3</text>
              </svg>
            </div>
          </div>

          <!-- Avatar with glowing ring -->
          <div class="column-avatar-wrap">
            <div class="avatar-ring">
              <img :src="rider.foto_url" :alt="rider.nombres_completos" class="avatar-img" />
            </div>
            <span class="dorsal-badge font-podium">#{{ rider.numero_dorsal }}</span>
          </div>

          <!-- Bar column body -->
          <div class="bar-body">
            <div class="bar-glass-shine"></div>
            <!-- Animated neon top boundary -->
            <div class="bar-top-neon"></div>
          </div>

          <!-- Axis/Label underneath -->
          <div class="bar-footer font-podium">
            <span class="footer-pos">#{{ rider.position }}</span>
            <span class="footer-name">{{ rider.nombres_completos.split(' ')[0] }} {{ rider.nombres_completos.split(' ')[1] || '' }}</span>
            <span class="footer-time">{{ rider.estado_carrera === 'llego' ? rider.tiempo_meta : rider.estado_carrera }}</span>
          </div>
        </div>
      </div>

      <!-- Single Tooltip Container - Positioned Dynamically relative to Viewport, Safe from Edge Clipping -->
      <Transition name="tooltip-futuristic">
        <div 
          class="rider-tooltip font-inter" 
          v-if="activeRider"
          :style="tooltipStyle"
          :class="{
            'podium-1': activeRider.position === 1 && activeRider.estado_carrera === 'llego',
            'podium-2': activeRider.position === 2 && activeRider.estado_carrera === 'llego',
            'podium-3': activeRider.position === 3 && activeRider.estado_carrera === 'llego'
          }"
        >
          <div class="tooltip-header">
            <span class="tooltip-dorsal font-podium">#{{ activeRider.numero_dorsal }}</span>
            <span class="tooltip-pos font-podium">PUESTO {{ activeRider.position }}</span>
          </div>
          <div class="tooltip-body">
            <h4 class="tooltip-name font-podium">{{ activeRider.nombres_completos }}</h4>
            <p class="tooltip-team" v-if="activeRider.club_team">🏁 {{ activeRider.club_team }}</p>
            <div class="tooltip-grid">
              <div class="grid-item">
                <span class="grid-label">PROCEDENCIA</span>
                <span class="grid-val">{{ activeRider.procedencia }}</span>
              </div>
              <div class="grid-item">
                <span class="grid-label">TIEMPO TOTAL</span>
                <span class="grid-val val-highlight">{{ activeRider.tiempo_meta ?? 'N/A' }}</span>
              </div>
              <div class="grid-item">
                <span class="grid-label">DIFERENCIA</span>
                <span class="grid-val diff-highlight" :class="{ 'gold-text': activeRider.position === 1 }">{{ activeRider.diferencia }}</span>
              </div>
              <div class="grid-item">
                <span class="grid-label">ESTADO</span>
                <span class="grid-val val-status" :class="activeRider.estado_carrera">{{ activeRider.estado_carrera === 'llego' ? 'LLEGÓ' : activeRider.estado_carrera }}</span>
              </div>
            </div>
          </div>
          <div class="tooltip-arrow"></div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-chart-wrap {
  position: relative;
  width: 100%;
  margin-bottom: 5rem;
}

.chart-header-hint {
  font-size: 0.72rem;
  color: var(--secondary-color);
  background: rgba(251, 191, 36, 0.05);
  border: 1px dashed rgba(251, 191, 36, 0.2);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

/* -------------------------------------------------------------
   HORIZONTAL SCROLLABLE COLUMN CHART WITH CAROUSEL BUTTONS
   ------------------------------------------------------------- */
.chart-viewport {
  position: relative;
  height: 600px;
  background: rgba(6, 6, 6, 0.60);
  border: 2px solid rgba(255, 255, 255, 0.08); /* High contrast */
  border-radius: 20px;
  padding: 4rem 1.5rem 0 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-shadow: inset 0 2px 30px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0,0,0,0.5);
  backdrop-filter: blur(25px);
  overflow: hidden; /* Force absolutely no vertical scroll on the viewport */
}

/* Viewport fades on edges */
.viewport-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 70px;
  z-index: 10;
  pointer-events: none;
}

.viewport-fade--left {
  left: 0;
  background: linear-gradient(to right, rgba(2, 2, 2, 0.85) 0%, transparent 100%);
}

.viewport-fade--right {
  right: 0;
  background: linear-gradient(to left, rgba(2, 2, 2, 0.85) 0%, transparent 100%);
}

/* Floating carousel nav buttons */
.carousel-nav-btn {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(15, 15, 15, 0.95);
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 25;
  box-shadow: 0 0 15px rgba(255, 94, 0, 0.4), 0 4px 10px rgba(0,0,0,0.8);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.carousel-nav-btn:hover {
  background: var(--primary-color);
  color: #000000;
  box-shadow: 0 0 25px rgba(255, 94, 0, 0.8), 0 4px 15px rgba(0,0,0,0.8);
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.btn-prev {
  left: 1rem;
}

.btn-next {
  right: 1rem;
}

/* Columns Wrapper - Extended padding-bottom to 90px to protect labels from clipping */
.columns-container {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 1.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 90px; /* Secure bottom margin for name labels */
  padding-top: 6.5rem; /* Room for crown and tooltip */
  z-index: 5;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) rgba(10, 10, 10, 0.5);
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar layout styling */
.columns-container::-webkit-scrollbar {
  height: 8px;
}

.columns-container::-webkit-scrollbar-track {
  background: rgba(10, 10, 10, 0.5);
  border-radius: 10px;
}

.columns-container::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(255, 94, 0, 0.5);
}

/* Chart Column - GROSS columns (150px) to show only 5-6 at once */
.chart-column {
  position: relative;
  flex: 0 0 150px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

.chart-column:hover {
  transform: translateY(-8px);
  z-index: 20;
}

/* Selected Column highlight (mainly for touch events on mobile) */
.chart-column.column-active-touch {
  z-index: 20;
}

.chart-column.column-active-touch .bar-body {
  border-color: #ffffff;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.25);
}

/* Top Decoration (Crown, Wreath, Bronze) */
.column-decoration {
  position: absolute;
  top: -95px; /* Aligned with 68px avatar */
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 90px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.svg-crown, .svg-laurel, .svg-bronze {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
}

.podium-item-crown {
  animation: floatCrown 3s ease-in-out infinite;
}

.podium-item-laurel {
  width: 100px;
  height: 100px;
  position: absolute;
  top: 10px;
}

@keyframes floatCrown {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(1deg); }
}

/* Avatar layout (68px on Desktop) */
.column-avatar-wrap {
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-ring {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  background: #020202;
  padding: 2.5px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
  transition: all 0.3s;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* Podium glows for avatars */
.podium-1 .avatar-ring {
  border-color: #fbbf24;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.75), 0 4px 15px rgba(0,0,0,0.8);
}

.podium-2 .avatar-ring {
  border-color: #cbd5e1;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.65), 0 4px 15px rgba(0,0,0,0.8);
}

.podium-3 .avatar-ring {
  border-color: #fb923c;
  box-shadow: 0 0 15px rgba(251, 146, 60, 0.65), 0 4px 15px rgba(0,0,0,0.8);
}

.dorsal-badge {
  position: absolute;
  bottom: -6px;
  background: var(--primary-color);
  color: #000000;
  font-size: 0.58rem;
  font-weight: 950;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  border: 1px solid rgba(0, 0, 0, 0.25);
}

.podium-1 .dorsal-badge { background: #fbbf24; }
.podium-2 .dorsal-badge { background: #ffffff; color: #000; }
.podium-3 .dorsal-badge { background: #fb923c; }

/* Bar Body styling */
.bar-body {
  width: 100%;
  height: calc(100% - 15px);
  background: linear-gradient(to top, rgba(255, 94, 0, 0.65) 0%, rgba(255, 94, 0, 0.15) 100%);
  border: 1.5px solid rgba(255, 94, 0, 0.45);
  border-bottom: none;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transition: all 0.3s;
}

.bar-glass-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
  transform: skewX(-20deg) translateX(-100%);
  transition: transform 0.6s ease;
}

.chart-column:hover .bar-glass-shine {
  transform: skewX(-20deg) translateX(200%);
}

.bar-top-neon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-color);
  box-shadow: 0 0 15px var(--primary-color);
}

/* Podium body overrides */
.podium-1 .bar-body {
  background: linear-gradient(to top, rgba(251, 191, 36, 0.75) 0%, rgba(251, 191, 36, 0.2) 100%);
  border-color: rgba(251, 191, 36, 0.6);
}
.podium-1 .bar-top-neon {
  background: #fbbf24;
  box-shadow: 0 0 20px #fbbf24;
}

.podium-2 .bar-body {
  background: linear-gradient(to top, rgba(203, 213, 225, 0.7) 0%, rgba(203, 213, 225, 0.15) 100%);
  border-color: rgba(203, 213, 225, 0.5);
}
.podium-2 .bar-top-neon {
  background: #ffffff;
  box-shadow: 0 0 20px #ffffff;
}

.podium-3 .bar-body {
  background: linear-gradient(to top, rgba(251, 146, 60, 0.7) 0%, rgba(251, 146, 60, 0.15) 100%);
  border-color: rgba(251, 146, 60, 0.5);
}
.podium-3 .bar-top-neon {
  background: #fb923c;
  box-shadow: 0 0 20px #fb923c;
}

/* DNF/DNS Column Styling */
.column-inactive .bar-body {
  background: linear-gradient(to top, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1.5px dashed rgba(255, 255, 255, 0.25);
  border-bottom: none;
}
.column-inactive .bar-top-neon {
  background: #777777;
  box-shadow: none;
}
.column-inactive .avatar-ring {
  opacity: 0.5;
  filter: grayscale(0.8);
}

/* Bar Footers - High Legibility */
.bar-footer {
  position: absolute;
  bottom: -68px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.footer-pos {
  font-size: 0.85rem;
  font-weight: 950;
  color: var(--primary-color);
  margin-bottom: 0.1rem;
}

.podium-1 .footer-pos { color: #fbbf24; }
.podium-2 .footer-pos { color: #ffffff; }
.podium-3 .footer-pos { color: #fb923c; }

.footer-name {
  font-size: 0.85rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #ffffff;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer-time {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 800;
}

/* -------------------------------------------------------------
   TOOLTIP STYLING (VIEWPORT POSITIONED & ANTI-CLIPPING)
   ------------------------------------------------------------- */
.rider-tooltip {
  position: absolute;
  /* left and top are dynamically bound by inline :style values */
  transform: translateX(-50%);
  width: 230px;
  background: #0a0a0ae0; /* Opaque dark with micro transparency for glassmorphism */
  border: 2px solid var(--primary-color);
  border-radius: 14px;
  padding: 0.95rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(255, 94, 0, 0.4);
  z-index: 1000;
  pointer-events: none;
  backdrop-filter: blur(15px);
}

.podium-1 .rider-tooltip { border-color: #fbbf24; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(251, 191, 36, 0.4); }
.podium-2 .rider-tooltip { border-color: #ffffff; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(255, 255, 255, 0.35); }
.podium-3 .rider-tooltip { border-color: #fb923c; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(251, 146, 60, 0.35); }

.tooltip-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 0.5rem;
  margin-bottom: 0.6rem;
}

.tooltip-dorsal {
  font-size: 0.72rem;
  color: #000000;
  background: var(--primary-color);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-weight: 950;
}

.podium-1 .tooltip-dorsal { background: #fbbf24; }
.podium-2 .tooltip-dorsal { background: #ffffff; }
.podium-3 .tooltip-dorsal { background: #fb923c; }

.tooltip-pos {
  font-size: 0.72rem;
  color: #ffffff;
  font-weight: 900;
}

.tooltip-name {
  font-size: 0.85rem;
  color: #ffffff;
  font-weight: 950;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
}

.tooltip-team {
  font-size: 0.68rem;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.tooltip-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}

.grid-item {
  display: flex;
  flex-direction: column;
}

.grid-label {
  font-size: 0.52rem;
  color: #a0aec0;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.grid-val {
  font-size: 0.72rem;
  color: #ffffff;
  font-weight: 900;
}

.grid-val.val-highlight {
  color: #ffffff;
}

.grid-val.diff-highlight {
  color: #fbd38d;
}

.gold-text {
  color: #fbbf24 !important;
}

.grid-val.val-status {
  padding: 0.05rem 0.4rem;
  border-radius: 4px;
  width: fit-content;
  font-size: 0.65rem;
  font-weight: 950;
  text-align: center;
}

.grid-val.val-status.llego { background: rgba(34, 197, 94, 0.25); color: #4ade80; border: 1px solid #22c55e; }
.grid-val.val-status.DNF { background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid #ef4444; }
.grid-val.val-status.DNS { background: rgba(156, 163, 175, 0.25); color: #cbd5e1; border: 1px solid #9ca3af; }

.tooltip-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: #090909;
  border-right: 2px solid var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.podium-1 .tooltip-arrow { border-right-color: #fbbf24; border-bottom-color: #fbbf24; }
.podium-2 .tooltip-arrow { border-right-color: #ffffff; border-bottom-color: #ffffff; }
.podium-3 .tooltip-arrow { border-right-color: #fb923c; border-bottom-color: #fb923c; }

/* -------------------------------------------------------------
   FUTURISTIC ELASTIC BOUNCE ENTRANCE ANIMATION (BACANO)
   ------------------------------------------------------------- */
.tooltip-futuristic-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.6, 0.64, 1);
}

.tooltip-futuristic-leave-active {
  transition: all 0.22s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.tooltip-futuristic-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.65) rotate(-5deg) translateY(25px);
  filter: blur(12px) brightness(1.8);
}

.tooltip-futuristic-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.85) translateY(12px);
  filter: blur(5px);
}

/* -------------------------------------------------------------
   RESPONSIVE LAYOUT (MOBILE OPTIMIZATIONS)
   ------------------------------------------------------------- */
@media (max-width: 768px) {
  .chart-viewport {
    height: 520px;
    padding: 3rem 1rem 0 1rem;
    border-radius: 16px;
    border-width: 1.5px;
  }

  .columns-container {
    gap: 1.25rem;
    padding-top: 4.5rem;
    padding-bottom: 75px;
  }

  .chart-column {
    flex: 0 0 110px;
  }

  .column-decoration {
    top: -80px;
    width: 70px;
    height: 70px;
  }

  .podium-item-laurel {
    width: 80px;
    height: 80px;
    top: 8px;
  }

  .column-avatar-wrap {
    top: -28px;
  }

  .avatar-ring {
    width: 54px;
    height: 54px;
  }

  .dorsal-badge {
    font-size: 0.5rem;
    padding: 0.05rem 0.35rem;
  }

  .footer-name {
    font-size: 0.75rem;
    max-width: 100px;
  }

  .footer-time {
    font-size: 0.65rem;
  }

  .carousel-nav-btn {
    width: 38px;
    height: 38px;
  }
}
</style>
