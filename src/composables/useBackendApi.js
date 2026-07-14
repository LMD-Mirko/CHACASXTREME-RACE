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
      frame_shape: item.frame_shape || item.frameShape || 'auto',
      display_size: item.display_size || item.displaySize || 'md',
      sort_order: item.sort_order ?? item.sortOrder ?? 0,
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

const PLACEHOLDER_PHOTO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect fill="#1a1a1a" width="400" height="400"/>
      <text x="200" y="210" fill="#555" font-family="sans-serif" font-size="28" text-anchor="middle">PILOTO</text>
    </svg>`
  );

export const mapRaceStatus = (status) => {
  const s = String(status || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (s === 'LLEGO') return 'llego';
  if (s === 'DNF') return 'DNF';
  if (s === 'DNS') return 'DNS';
  if (s === 'EN RUTA' || s === 'EN_CARRERA' || s === 'EN CARRERA') return 'en_carrera';
  return 'pre_inscrito';
};

export const mapApiRiderToUi = (rider) => {
  const photo = rider.photo_url || rider.foto_url || null;
  return {
    id: rider.id,
    nombres_completos: rider.full_name || rider.nombres_completos || '',
    dni: rider.dni || '',
    apodo: rider.nickname || rider.apodo || '',
    categoria_elegida: rider.category?.name || rider.category_name || rider.categoria_elegida || 'Sin categoría',
    category_id: rider.category_id ?? rider.category?.id ?? null,
    procedencia: rider.origin || rider.procedencia || '—',
    club_team: rider.club_team || '',
    instagram: (rider.instagram || '').replace(/^@/, ''),
    foto_url: photo ? (buildPublicAssetUrl(photo) || photo) : PLACEHOLDER_PHOTO,
    numero_dorsal: rider.plate_number ?? rider.numero_dorsal ?? null,
    estado_carrera: mapRaceStatus(rider.race_status || rider.status || rider.estado_carrera),
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: '--:--',
  };
};

export const mapClassificationToUi = (row, photoByRiderId = {}) => {
  const photo = photoByRiderId[row.id] || null;
  const rawPos = row.position;
  const position = (typeof rawPos === 'number' && Number.isFinite(rawPos))
    ? rawPos
    : (rawPos != null && String(rawPos).trim() !== '' && String(rawPos) !== '—'
      ? Number(rawPos)
      : null);
  const rawTime = row.time_formatted;
  const tiempo_meta = rawTime && String(rawTime) !== '—' ? rawTime : null;
  const rawGap = row.gap;
  const diferencia = rawGap === 'Líder'
    ? '00:00.000'
    : (rawGap && String(rawGap) !== '—' ? rawGap : '--:--');

  return {
    id: row.id,
    nombres_completos: row.full_name || '',
    categoria_elegida: row.category_name || 'Sin categoría',
    category_id: row.category_id ?? null,
    procedencia: row.origin || '—',
    club_team: row.club_team || '',
    foto_url: photo || PLACEHOLDER_PHOTO,
    numero_dorsal: row.plate_number ?? null,
    estado_carrera: mapRaceStatus(row.status),
    paso_p1: !!row.intermediate_passed,
    hora_p1: row.intermediate_time && String(row.intermediate_time) !== '—'
      ? row.intermediate_time
      : null,
    tiempo_meta,
    diferencia,
    position: Number.isFinite(position) ? position : null,
    clasificacion_time: row.clasificacion_time || null,
    clasificacion_position: row.clasificacion_position || null,
    duration_ms: row.duration_ms ?? null,
  };
};

export const fetchCategories = async () => {
  const body = await fetchJson('/api/categories');
  if (!body?.success || !Array.isArray(body.data)) return [];
  return body.data;
};

export const fetchActiveCompetition = async () => {
  try {
    const body = await fetchJson('/api/competitions/active');
    if (!body?.success) return null;
    return body.data || null;
  } catch (err) {
    if (String(err.message || '').includes('404')) return null;
    throw err;
  }
};

export const fetchRiders = async (params = {}) => {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.category_id) qs.set('category_id', String(params.category_id));
  const suffix = qs.toString() ? `?${qs}` : '';
  const body = await fetchJson(`/api/riders${suffix}`, {}, 15000);
  if (!body?.success || !Array.isArray(body.data)) return [];
  return body.data.map(mapApiRiderToUi);
};

export const fetchClassifications = async (competitionId, { phase, categoryId } = {}) => {
  const qs = new URLSearchParams();
  if (phase) qs.set('phase', phase);
  if (categoryId && categoryId !== 'all') qs.set('category_id', String(categoryId));
  const suffix = qs.toString() ? `?${qs}` : '';
  const body = await fetchJson(
    `/api/competitions/${competitionId}/classifications${suffix}`,
    {},
    15000
  );
  return {
    phase: body.phase || phase || 'practica',
    phase_label: body.phase_label || '',
    manga: body.manga || null,
    classifications: Array.isArray(body.classifications) ? body.classifications : [],
  };
};

export { buildPublicAssetUrl, PLACEHOLDER_PHOTO };

