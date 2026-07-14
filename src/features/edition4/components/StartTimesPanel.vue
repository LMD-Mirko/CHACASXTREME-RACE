<script setup>
defineProps({
  starts: { type: Array, default: () => [] },
  latestStart: { type: Object, default: null },
  phaseLabel: { type: String, default: '' },
});

const formatClock = (raw) => {
  if (!raw) return '—';
  const s = String(raw).trim();
  // "YYYY-MM-DD HH:mm:ss.SSS" o ISO
  const timePart = s.includes('T') ? s.split('T')[1] : (s.includes(' ') ? s.split(' ')[1] : s);
  if (!timePart) return s;
  const [hms, ms] = timePart.split('.');
  const [hh, mm, ss] = (hms || '').split(':');
  if (hh == null) return timePart.slice(0, 12);
  const h = Number(hh);
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = ((h + 11) % 12) + 1;
  const base = `${h12}:${mm || '00'}:${(ss || '00').slice(0, 2)}`;
  if (ms) return `${base}.${ms.slice(0, 3)} ${ampm}`;
  return `${base} ${ampm}`;
};
</script>

<template>
  <section v-if="latestStart || starts.length" class="start-times-panel" aria-label="Horas de salida">
    <div class="start-times-head">
      <span class="start-kicker font-accent">Largada en vivo</span>
      <h3 class="start-title font-podium">Hora de salida</h3>
    </div>

    <div v-if="latestStart" class="latest-start">
      <div class="latest-start__meta">
        <span class="latest-cat font-accent">{{ latestStart.category_name || 'Categoría' }}</span>
        <span v-if="phaseLabel" class="latest-phase font-accent">{{ phaseLabel }}</span>
      </div>
      <div class="latest-clock font-symbols">{{ formatClock(latestStart.start_time) }}</div>
      <p v-if="latestStart.total_riders != null" class="latest-riders font-symbols">
        {{ latestStart.total_riders }} piloto{{ latestStart.total_riders === 1 ? '' : 's' }} en manga
      </p>
    </div>

    <!-- Sin lista por categoría: todas largan juntas como Avalancha -->
    <div v-if="!latestStart && starts.length" class="starts-grid">
      <div v-for="row in starts" :key="row.category_id || row.category_name" class="start-chip">
        <span class="start-chip__cat font-accent">{{ row.category_name }}</span>
        <span class="start-chip__time font-symbols">{{ formatClock(row.start_time) }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.start-times-panel {
  margin: 0 0 1.75rem;
  padding: 1.15rem 1.25rem 1.25rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 94, 0, 0.22);
  background:
    radial-gradient(ellipse at 10% 0%, rgba(255, 94, 0, 0.12) 0%, transparent 55%),
    rgba(8, 8, 8, 0.7);
}

.start-kicker {
  display: block;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 2.2px;
  text-transform: uppercase;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.start-title {
  margin: 0 0 1rem;
  font-size: 1.35rem;
  font-weight: 950;
  letter-spacing: -0.4px;
}

.latest-start {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
  border-radius: 14px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.06);
  margin-bottom: 0.9rem;
}

.latest-start__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.latest-cat {
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #34d399;
}

.latest-phase {
  font-size: 0.52rem;
  letter-spacing: 1.2px;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.55);
}

.latest-clock {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
}

.latest-riders {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
}

.starts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.55rem;
}

.start-chip {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.65rem 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.start-chip__cat {
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
}

.start-chip__time {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
</style>
