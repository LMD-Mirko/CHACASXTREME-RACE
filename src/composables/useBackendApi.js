const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const fetchJson = async (path, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);

  const response = await fetch(buildUrl(path), {
    ...options,
    signal: controller.signal,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  window.clearTimeout(timer);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
};

const extractUrl = (item) => {
  if (!item) return null;
  if (typeof item === 'string') return item;
  return item.image_url || item.imageUrl || item.url || item.image_path || item.imagePath || null;
};

const buildPublicAssetUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const base = String(API_BASE_URL).replace(/\/$/, '');
  const path = String(value).replace(/^\/+/, '');
  return base ? `${base}/storage/${path}` : `/storage/${path}`;
};

export const fetchSponsorsNames = async () => {
  const body = await fetchJson('/api/sponsors/names');
  if (!Array.isArray(body)) throw new Error('Invalid sponsors response');
  return body.filter(Boolean).map((name) => String(name).trim()).filter(Boolean);
};

export const fetchGalleryByType = async (type, perPage = 12) => {
  const params = new URLSearchParams();
  params.set('type', type);
  params.set('per_page', String(perPage));
  const body = await fetchJson(`/api/gallery?${params.toString()}`);
  if (!body || !Array.isArray(body.data)) return [];
  return body.data.map(extractUrl).filter(Boolean);
};

export const fetchGalleryAll = async (perPage = 30) => {
  const params = new URLSearchParams();
  params.set('per_page', String(perPage));
  const body = await fetchJson(`/api/gallery?${params.toString()}`);
  if (!body || !Array.isArray(body.data)) return [];
  return body.data.map(extractUrl).filter(Boolean);
};

export const fetchSponsors = async () => {
  const body = await fetchJson('/api/sponsors');
  if (!body || !Array.isArray(body.data)) return [];
  return body.data.map((item) => {
    const rawLogo = item.logo_url || item.logoUrl || item.logo_path || item.logoPath || null;
    return {
      ...item,
      logo_url: buildPublicAssetUrl(rawLogo),
      company_name: item.company_name || item.name || '',
      instagram_url: item.instagram_url || item.instagramUrl || null,
      facebook_url: item.facebook_url || item.facebookUrl || null,
      tiktok_url: item.tiktok_url || item.tiktokUrl || null,
      website_url: item.website_url || item.websiteUrl || null,
      description: item.description || item.about || ''
    };
  });
};

export const fetchGalleryPaginated = async (type, page = 1, perPage = 12) => {
  const params = new URLSearchParams();
  params.set('type', type);
  params.set('page', String(page));
  params.set('per_page', String(perPage));

  const body = await fetchJson(`/api/gallery?${params.toString()}`);
  if (!body) {
    return { data: [], pagination: { currentPage: 1, lastPage: 1, total: 0 } };
  }

  const mappedData = (body.data || []).map((item) => {
    const rawImage = item.image_path || item.imagePath || null;
    return {
      id: item.id,
      url: buildPublicAssetUrl(rawImage),
      title: item.title || '',
      quote: item.description || '',
      tag: item.image_type?.name || item.imageType?.name || 'STAFF'
    };
  });

  return {
    data: mappedData,
    pagination: {
      currentPage: body.current_page || 1,
      lastPage: body.last_page || 1,
      total: body.total || 0
    }
  };
};

