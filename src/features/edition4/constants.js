/** Filtro “todos” — opción principal en padrón y resultados */
export const MEGA_AVALANCHA = 'Mega Avalancha';
export const MEGA_KEY = '__mega__';

export function buildCategoryOptions(names = []) {
  const unique = [...new Set((names || []).filter(Boolean))];
  return [{ key: MEGA_KEY, label: MEGA_AVALANCHA, mega: true }, ...unique.map((name) => ({
    key: name,
    label: name,
    mega: false,
  }))];
}

export function isMegaFilter(key) {
  return key === MEGA_KEY || key === MEGA_AVALANCHA;
}

/** Normaliza etiquetas de manga mega / “todas” desde API o WS */
export function normalizeCategoryLabel(name) {
  const s = String(name || '').trim();
  if (!s) return '';
  const u = s.toUpperCase();
  if (
    (u.includes('MEGA') && u.includes('AVALANCHA'))
    || u === 'ALL'
    || u === 'TODAS'
    || u.includes('(TODAS)')
  ) {
    return MEGA_AVALANCHA;
  }
  return s;
}
