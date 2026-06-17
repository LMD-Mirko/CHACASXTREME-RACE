<script setup>
import { ref, computed } from 'vue';
import { Search, MapPin, Navigation, Instagram, ShieldAlert } from 'lucide-vue-next';

const props = defineProps({
  riders: {
    type: Array,
    required: true
  }
});

const selectedPadronCategory = ref('Elite');
const categoriesList = ['Elite', 'Junior', 'Rígidas', 'Locales'];
const padronSearchQuery = ref('');

const filteredPadronRiders = computed(() => {
  return props.riders.filter(rider => {
    // Category match
    const matchesCategory = rider.categoria_elegida.toLowerCase() === selectedPadronCategory.value.toLowerCase();
    
    // Search query match
    const searchLower = padronSearchQuery.value.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      rider.nombres_completos.toLowerCase().includes(searchLower) ||
      rider.procedencia.toLowerCase().includes(searchLower) ||
      (rider.club_team && rider.club_team.toLowerCase().includes(searchLower)) ||
      (rider.numero_dorsal && String(rider.numero_dorsal).includes(searchLower));

    return matchesCategory && matchesSearch;
  });
});
</script>

<template>
  <div class="padron-wrapper">
    <div class="section-toolbar">
      <!-- Horizontal Category Selector -->
      <div class="horizontal-selector">
        <button
          v-for="cat in categoriesList"
          :key="cat"
          class="category-selector-btn font-podium"
          :class="{ 'active': selectedPadronCategory === cat }"
          @click="selectedPadronCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Search input -->
      <div class="search-box-premium">
        <Search :size="18" class="search-icon" />
        <input 
          type="text" 
          v-model="padronSearchQuery" 
          placeholder="Buscar por nombre, dorsal, procedencia..." 
          class="search-input"
        />
      </div>
    </div>

    <!-- Riders Grid -->
    <div class="riders-card-grid" v-if="filteredPadronRiders.length > 0">
      <div 
        v-for="rider in filteredPadronRiders" 
        :key="rider.id"
        class="rider-card"
      >
        <!-- Watermark background dorsal number -->
        <div class="dorsal-watermark font-podium">
          {{ rider.numero_dorsal ? String(rider.numero_dorsal).padStart(2, '0') : '' }}
        </div>


        <!-- Pilot Framed Image with Targeting Scopes -->
        <div class="pilot-scope-frame">
          <img :src="rider.foto_url" :alt="rider.nombres_completos" class="pilot-photo" />
          <span class="scope-bracket corner-tl"></span>
          <span class="scope-bracket corner-tr"></span>
          <span class="scope-bracket corner-bl"></span>
          <span class="scope-bracket corner-br"></span>
          <div class="dorsal-scope-tag font-podium">#{{ rider.numero_dorsal }}</div>
        </div>

        <!-- Rider Details & Name -->
        <div class="rider-card__details">
          <h3 class="rider-card__name font-podium">{{ rider.nombres_completos }}</h3>
          <p class="rider-card__alias" v-if="rider.apodo">"{{ rider.apodo }}"</p>
          
          <!-- Racing Data Sheet (Ficha Técnica) -->
          <div class="ficha-tecnica font-accent">
            <div class="ficha-row">
              <span class="ficha-lbl">CATEGORÍA</span>
              <span class="ficha-val text-orange">{{ rider.categoria_elegida.toUpperCase() }}</span>
            </div>
            <div class="ficha-row">
              <span class="ficha-lbl">PROCEDENCIA</span>
              <span class="ficha-val">{{ rider.procedencia.toUpperCase() }}</span>
            </div>
            <div class="ficha-row" v-if="rider.club_team">
              <span class="ficha-lbl">TEAM / CLUB</span>
              <span class="ficha-val text-truncate">{{ rider.club_team.toUpperCase() }}</span>
            </div>
            <div class="ficha-row">
              <span class="ficha-lbl">LICENCIA</span>
              <span class="ficha-val text-green">CONFIRMADA</span>
            </div>
          </div>

          <!-- Instagram link -->
          <a 
            v-if="rider.instagram"
            :href="'https://instagram.com/' + rider.instagram" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="rider-card__instagram"
          >
            <Instagram :size="13" />
            <span>@{{ rider.instagram }}</span>
          </a>
        </div>
        
        <!-- Bottom carbon accent stripe -->
        <div class="rider-card__footer-accent"></div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <ShieldAlert :size="48" class="empty-icon" />
      <h3>No se encontraron competidores</h3>
      <p>Prueba ajustando el filtro de búsqueda o cambiando de categoría.</p>
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
  background: rgba(10, 10, 10, 0.5);
  border: 1px solid rgba(255, 94, 0, 0.25);
  border-radius: 12px;
  overflow: hidden;
  padding: 0.25rem;
  backdrop-filter: blur(15px);
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

.search-box-premium {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(10,10,10,0.5);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 0 1rem;
  max-width: 400px;
  width: 100%;
  backdrop-filter: blur(15px);
  transition: border-color 0.3s;
}

.search-box-premium:focus-within {
  border-color: var(--primary-color);
  background: rgba(255,255,255,0.03);
}

.search-icon {
  color: rgba(255,255,255,0.3);
  margin-right: 0.75rem;
}

.search-input {
  background: transparent;
  border: none;
  color: white;
  width: 100%;
  padding: 0.8rem 0;
  font-family: var(--font-main);
  font-size: 0.9rem;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255,255,255,0.35);
}

/* RIDERS GRID */
.riders-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 2.2rem;
  margin-bottom: 5rem;
}

.rider-card {
  position: relative;
  background: rgba(10, 10, 10, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.4s, box-shadow 0.4s;
}

@media (min-width: 769px) {
  .rider-card {
    backdrop-filter: blur(12px);
  }
}

@media (max-width: 768px) {
  .rider-card {
    background: rgba(12, 12, 12, 0.95);
  }
}

.rider-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 94, 0, 0.35);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.65), 0 0 25px rgba(255, 94, 0, 0.08);
}

/* Watermark backdrop */
.dorsal-watermark {
  position: absolute;
  bottom: -1rem;
  right: -0.5rem;
  font-size: 9.5rem;
  font-weight: 950;
  color: rgba(255, 94, 0, 0.035);
  line-height: 1;
  pointer-events: none;
  z-index: 0;
  user-select: none;
}


/* Pilot Framed targeting box */
.pilot-scope-frame {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.5);
  z-index: 10;
}

.pilot-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.25) contrast(1.1) brightness(0.95);
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.4s;
}

.rider-card:hover .pilot-photo {
  transform: scale(1.05);
  filter: grayscale(0) contrast(1.0) brightness(1);
}

/* Scope bracket targeting styling */
.scope-bracket {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid var(--primary-color);
  opacity: 0.85;
}

.corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
.corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
.corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
.corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

.dorsal-scope-tag {
  position: absolute;
  bottom: 0.8rem;
  right: 0.8rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #000;
  font-size: 1.35rem;
  font-weight: 950;
  padding: 0.1rem 0.6rem;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
}

/* Rider details */
.rider-card__details {
  display: flex;
  flex-direction: column;
  width: 100%;
  z-index: 10;
}

.rider-card__name {
  font-size: 1.35rem;
  font-weight: 900;
  margin: 0;
  color: #fff;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.rider-card__alias {
  font-family: var(--font-accent);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin: 0.2rem 0 0.8rem 0;
}

/* Ficha Técnica style */
.ficha-tecnica {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 0.8rem;
  border-radius: 8px;
  font-family: monospace;
}

.ficha-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
}

.ficha-lbl {
  color: rgba(255,255,255,0.4);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.ficha-val {
  color: #fff;
  font-weight: 900;
}

.text-orange {
  color: var(--primary-color) !important;
}

.text-green {
  color: #22c55e !important;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.rider-card__instagram {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 100px;
  padding: 0.35rem 0.8rem;
  margin-top: 1rem;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  transition: all 0.3s;
  width: fit-content;
}

.rider-card__instagram:hover {
  background: rgba(255, 94, 0, 0.1);
  border-color: var(--primary-color);
  color: #fff;
}

.rider-card__footer-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.4s;
}

.rider-card:hover .rider-card__footer-accent {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 5rem 0;
  color: rgba(255,255,255,0.3);
}

.empty-icon {
  margin-bottom: 1.5rem;
  opacity: 0.5;
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

  .search-box-premium {
    max-width: 100%;
  }
}
</style>
