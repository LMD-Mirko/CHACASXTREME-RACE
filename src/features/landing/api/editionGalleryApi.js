/** Galería pública 4ª edición */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function parseJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg =
      body.message ||
      (body.errors && Object.values(body.errors).flat().join(' ')) ||
      `Error ${response.status}`;
    const err = new Error(msg);
    err.status = response.status;
    err.body = body;
    throw err;
  }
  return body;
}

function absolutize(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

function mapGalleryItem(item) {
  return {
    ...item,
    view_url: absolutize(item.view_url),
    thumb_url: absolutize(item.thumb_url),
    preview_url: absolutize(item.preview_url || item.view_url),
  };
}

/**
 * @param {{ page?: number, perPage?: number, mediaType?: 'photo'|'video'|'all' }} opts
 */
export async function fetchEdition4Gallery({ page = 1, perPage = 24, mediaType = 'photo' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    media_type: mediaType,
  });
  const body = await parseJson(
    await fetch(`${API_BASE_URL}/api/race-media/gallery?${params}`, {
      headers: { Accept: 'application/json' },
    })
  );

  body.data = (body.data || []).map(mapGalleryItem);
  return body;
}

/** Subida pública → siempre General */
export async function uploadPublicGalleryPhotos({ fullName, instagram, files }) {
  const form = new FormData();
  form.append('full_name', fullName);
  if (instagram?.trim()) form.append('instagram', instagram.trim());
  for (const file of files) {
    form.append('files[]', file);
  }

  const body = await parseJson(
    await fetch(`${API_BASE_URL}/api/race-media/gallery/public-upload`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: form,
    })
  );

  body.data = (body.data || []).map(mapGalleryItem);
  return body;
}
