/**
 * Resuelve marco CSS del logo.
 * circle / rectangle / square / tall: forzados desde admin.
 * auto: solo wide/tall/square por proporción (NUNCA circle automático:
 * logos casi cuadrados con fondo se ven mal en círculo).
 */
export function resolveSponsorFrame(sponsor, detectedShape = 'square') {
  const frame = String(sponsor?.frame_shape || sponsor?.frameShape || 'auto').toLowerCase();
  if (frame === 'circle') return 'circle';
  if (frame === 'rectangle' || frame === 'wide') return 'wide';
  if (frame === 'square') return 'square';
  if (frame === 'tall') return 'tall';
  return detectedShape || 'square';
}

export function resolveSponsorSize(sponsor) {
  const size = String(sponsor?.display_size || sponsor?.displaySize || 'md').toLowerCase();
  if (size === 'sm' || size === 'lg') return size;
  return 'md';
}

export function detectShapeFromImage(img) {
  if (!img?.naturalWidth || !img?.naturalHeight) return 'square';
  const ratio = img.naturalWidth / img.naturalHeight;
  // Umbrales más sensibles: logos tipo TREK caen en wide
  if (ratio >= 1.2) return 'wide';
  if (ratio <= 0.82) return 'tall';
  return 'square';
}
