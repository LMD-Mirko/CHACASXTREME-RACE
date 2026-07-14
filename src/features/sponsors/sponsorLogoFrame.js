/**
 * Resuelve marco CSS del logo:
 * admin puede forzar circle | rectangle | square | tall | auto
 * (rectangle → clase wide del carrusel).
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
  if (ratio >= 1.35) return 'wide';
  if (ratio <= 0.85) return 'tall';
  if (ratio >= 0.9 && ratio <= 1.12) return 'circle';
  return 'square';
}
