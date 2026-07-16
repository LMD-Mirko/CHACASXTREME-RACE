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

export function detectLogoBackgroundFromImage(img) {
  if (!img?.naturalWidth || !img?.naturalHeight) return '#ffffff';

  try {
    const width = Math.min(img.naturalWidth, 80);
    const height = Math.min(img.naturalHeight, 80);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '#ffffff';

    ctx.drawImage(img, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    const edge = Math.max(2, Math.round(Math.min(width, height) * 0.08));

    const buckets = new Map();
    let bestColor = '#ffffff';
    let bestCount = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const isEdge = x < edge || y < edge || x >= width - edge || y >= height - edge;
        if (!isEdge) continue;

        const i = (y * width + x) * 4;
        const alpha = data[i + 3];
        if (alpha < 180) continue;

        // Agrupar colores cercanos para evitar ruido de compresión JPEG.
        const r = Math.round(data[i] / 12) * 12;
        const g = Math.round(data[i + 1] / 12) * 12;
        const b = Math.round(data[i + 2] / 12) * 12;
        const key = `${r},${g},${b}`;
        const count = (buckets.get(key) || 0) + 1;
        buckets.set(key, count);

        if (count > bestCount) {
          bestCount = count;
          bestColor = `rgb(${r}, ${g}, ${b})`;
        }
      }
    }

    return bestCount > 0 ? bestColor : '#ffffff';
  } catch {
    // Imágenes cross-origin sin CORS no dejan leer canvas; blanco conserva el logo limpio.
    return '#ffffff';
  }
}
