<script setup>
import { ref, computed, watch } from 'vue';
import { Search, Instagram, ShieldAlert, Users } from 'lucide-vue-next';
import { MEGA_KEY, buildCategoryOptions, isMegaFilter } from '../constants';

const props = defineProps({
  riders: { type: Array, required: true },
  categories: { type: Array, default: () => [] },
});

const selectedPadronCategory = ref(MEGA_KEY);
const padronSearchQuery = ref('');

const categoryOptions = computed(() => buildCategoryOptions(props.categories?.length
  ? props.categories
  : [...new Set(props.riders.map((r) => r.categoria_elegida).filter(Boolean))]
));

watch(categoryOptions, (opts) => {
  if (!opts.length) return;
  const keys = opts.map((o) => o.key);
  if (!keys.includes(selectedPadronCategory.value)) {
    selectedPadronCategory.value = MEGA_KEY;
  }
}, { immediate: true });

const filteredPadronRiders = computed(() => {
  const mega = isMegaFilter(selectedPadronCategory.value);
  const searchLower = padronSearchQuery.value.toLowerCase().trim();

  return props.riders.filter((rider) => {
    const cat = String(rider.categoria_elegida || '').toLowerCase();
    const matchesCategory = mega
      || cat === String(selectedPadronCategory.value || '').toLowerCase();

    const matchesSearch = !searchLower
      || String(rider.nombres_completos || '').toLowerCase().includes(searchLower)
      || String(rider.procedencia || '').toLowerCase().includes(searchLower)
      || (rider.club_team && rider.club_team.toLowerCase().includes(searchLower))
      || (rider.apodo && rider.apodo.toLowerCase().includes(searchLower))
      || (rider.numero_dorsal != null && String(rider.numero_dorsal).includes(searchLower));

    return matchesCategory && matchesSearch;
  });
});

const riderCountLabel = computed(() => {
  const n = filteredPadronRiders.value.length;
  return `${n} piloto${n === 1 ? '' : 's'}`;
});
</script>

<template>
  <div class="padron-wrapper">
    <div class="padron-hero-bar">
      <div class="padron-hero-copy">
        <span class="padron-kicker font-accent">Padrón oficial</span>
        <h2 class="padron-heading font-podium">Competidores</h2>
        <p class="padron-sub font-accent">
          {{ isMegaFilter(selectedPadronCategory) ? 'Mega Avalancha' : selectedPadronCategory }}
          <span class="sym"> · </span>{{ riderCountLabel }}
          <template v-if="isMegaFilter(selectedPadronCategory)">
            <span class="sym"> · </span>todas las categorías
          </template>
        </p>
      </div>
      <div class="padron-stat-pill font-accent">
        <Users :size="14" />
        <span>{{ riders.length }} EN GRID</span>
      </div>
    </div>

    <div class="section-toolbar">
      <label class="cat-select-wrap font-accent">
        <span class="cat-select-lbl">Categoría</span>
        <select
          v-model="selectedPadronCategory"
          class="cat-select"
          aria-label="Filtrar padrón por categoría"
        >
          <option
            v-for="opt in categoryOptions"
            :key="opt.key"
            :value="opt.key"
          >
            {{ opt.label }}
          </option>
        </select>
      </label>

      <div class="search-box-premium">
        <Search :size="18" class="search-icon" />
        <input
          type="text"
          v-model="padronSearchQuery"
          placeholder="Buscar nombre, dorsal, procedencia…"
          class="search-input"
        />
      </div>
    </div>

    <div class="riders-card-grid" v-if="filteredPadronRiders.length > 0">
      <article
        v-for="(rider, i) in filteredPadronRiders"
        :key="rider.id"
        class="rider-card"
        :style="{ '--delay': `${Math.min(i, 12) * 40}ms` }"
      >
        <div class="dorsal-watermark font-symbols">
          {{ rider.numero_dorsal != null ? String(rider.numero_dorsal).padStart(2, '0') : '' }}
        </div>

        <div class="pilot-scope-frame">
          <img :src="rider.foto_url" :alt="rider.nombres_completos" class="pilot-photo" loading="lazy" />
          <span class="scope-bracket corner-tl"></span>
          <span class="scope-bracket corner-tr"></span>
          <span class="scope-bracket corner-bl"></span>
          <span class="scope-bracket corner-br"></span>
          <div class="photo-scrim"></div>
          <div class="dorsal-scope-tag font-symbols">#{{ rider.numero_dorsal ?? '—' }}</div>
          <span class="cat-chip font-accent">{{ rider.categoria_elegida }}</span>
        </div>

        <div class="rider-card__details">
          <h3 class="rider-card__name font-podium">{{ rider.nombres_completos }}</h3>
          <p class="rider-card__alias" v-if="rider.apodo">"{{ rider.apodo }}"</p>

          <div class="ficha-tecnica font-accent">
            <div class="ficha-row">
              <span class="ficha-lbl">PROCEDENCIA</span>
              <span class="ficha-val">{{ String(rider.procedencia || '—').toUpperCase() }}</span>
            </div>
            <div class="ficha-row" v-if="rider.club_team">
              <span class="ficha-lbl">TEAM / CLUB</span>
              <span class="ficha-val text-truncate">{{ rider.club_team.toUpperCase() }}</span>
            </div>
            <div class="ficha-row">
              <span class="ficha-lbl">ESTADO</span>
              <span class="ficha-val text-green">EN PADRÓN</span>
            </div>
          </div>

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

        <div class="rider-card__footer-accent"></div>
      </article>
    </div>

    <div class="empty-state" v-else>
      <ShieldAlert :size="48" class="empty-icon" />
      <h3>No se encontraron competidores</h3>
      <p>Prueba ajustando la búsqueda o cambia de categoría.</p>
    </div>
  </div>
</template>

<style scoped>
.padron-wrapper {
  --rail: rgba(255, 255, 255, 0.06);
}

.padron-hero-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 94, 0, 0.18);
}

.padron-kicker {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--primary-color);
  margin-bottom: 0.35rem;
}

.padron-heading {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 950;
  letter-spacing: -1px;
  line-height: 0.95;
}

.padron-sub {
  margin: 0.45rem 0 0;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.92rem;
}

.padron-stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 94, 0, 0.35);
  background: linear-gradient(135deg, rgba(255, 94, 0, 0.12), rgba(251, 191, 36, 0.06));
  color: var(--secondary-color);
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  white-space: nowrap;
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.cat-select-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: min(100%, 300px);
  flex: 1;
}

.cat-select-lbl {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 94, 0, 0.85);
}

.cat-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  background-color: rgba(8, 8, 8, 0.92);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23ff5e00' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.9rem center;
  border: 1px solid rgba(255, 94, 0, 0.35);
  border-radius: 12px;
  color: #fff;
  font-family: var(--font-accent), 'Poppins', system-ui, sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.3;
  padding: 0.75rem 2.4rem 0.75rem 0.95rem;
  cursor: pointer;
  outline: none;
}

.cat-select:hover,
.cat-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 94, 0, 0.15);
}

.cat-select option {
  background: #0a0a0a;
  color: #fff;
}

.search-box-premium {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(10, 10, 10, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 0 1rem;
  max-width: 380px;
  width: 100%;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-box-premium:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 94, 0, 0.12);
}

.search-icon {
  color: rgba(255, 255, 255, 0.3);
  margin-right: 0.75rem;
}

.search-input {
  background: transparent;
  border: none;
  color: white;
  width: 100%;
  padding: 0.85rem 0;
  font-family: var(--font-main);
  font-size: 0.9rem;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.32);
}

.riders-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.6rem;
  margin-bottom: 4rem;
}

.rider-card {
  position: relative;
  background:
    linear-gradient(165deg, rgba(28, 18, 10, 0.55) 0%, rgba(8, 8, 8, 0.9) 55%),
    rgba(10, 10, 10, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 18px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  animation: cardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--delay, 0ms);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.35s, box-shadow 0.35s;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

.rider-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 94, 0, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55), 0 0 28px rgba(255, 94, 0, 0.1);
}

.dorsal-watermark {
  position: absolute;
  bottom: -0.8rem;
  right: -0.4rem;
  font-size: 8.5rem;
  font-weight: 950;
  color: rgba(255, 94, 0, 0.045);
  line-height: 1;
  pointer-events: none;
  z-index: 0;
  user-select: none;
}

.pilot-scope-frame {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #050505;
  z-index: 2;
}

.pilot-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.2) contrast(1.08) brightness(0.92);
  transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.4s;
}

.rider-card:hover .pilot-photo {
  transform: scale(1.07);
  filter: grayscale(0) contrast(1.05) brightness(1);
}

.photo-scrim {
  position: absolute;
  inset: auto 0 0 0;
  height: 45%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
  pointer-events: none;
}

.scope-bracket {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid var(--primary-color);
  opacity: 0.9;
  z-index: 3;
}

.corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
.corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
.corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
.corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

.dorsal-scope-tag {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  z-index: 4;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #000;
  font-size: 1.25rem;
  font-weight: 950;
  padding: 0.12rem 0.55rem;
  border-radius: 5px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
}

.cat-chip {
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  z-index: 4;
  padding: 0.28rem 0.55rem;
  border-radius: 6px;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #fff;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 94, 0, 0.45);
  backdrop-filter: blur(8px);
}

.rider-card__details {
  display: flex;
  flex-direction: column;
  width: 100%;
  z-index: 2;
}

.rider-card__name {
  font-size: 1.28rem;
  font-weight: 900;
  margin: 0;
  color: #fff;
  line-height: 1.12;
  letter-spacing: -0.4px;
}

.rider-card__alias {
  font-family: var(--font-accent);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin: 0.25rem 0 0.75rem;
}

.ficha-tecnica {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
}

.ficha-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.66rem;
}

.ficha-lbl {
  color: rgba(255, 255, 255, 0.38);
  font-weight: 800;
  letter-spacing: 0.8px;
}

.ficha-val {
  color: #fff;
  font-weight: 900;
  text-align: right;
}

.text-green { color: #4ade80 !important; }

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.rider-card__instagram {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 100px;
  padding: 0.35rem 0.85rem;
  margin-top: 0.85rem;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.3s;
  width: fit-content;
}

.rider-card__instagram:hover {
  background: rgba(255, 94, 0, 0.12);
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
  transition: opacity 0.35s;
}

.rider-card:hover .rider-card__footer-accent {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 5rem 1rem;
  color: rgba(255, 255, 255, 0.35);
}

.empty-icon {
  margin-bottom: 1.25rem;
  opacity: 0.45;
}

@media (max-width: 768px) {
  .padron-hero-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box-premium {
    max-width: 100%;
  }

  .pilot-scope-frame {
    height: 180px;
  }
}
</style>
