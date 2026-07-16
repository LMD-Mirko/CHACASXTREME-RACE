const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const TOKEN_KEY = 'photographer_token';
const PROFILE_KEY = 'photographer_profile';

/** Reescribe hosts viejos (trycloudflare/IP) al API actual. */
export function mediaPublicUrl(value) {
  if (!value) return '';
  const base = String(API_BASE_URL).replace(/\/$/, '');
  const raw = String(value).trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      const host = u.hostname.toLowerCase();
      const isStale =
        host.includes('trycloudflare.com') ||
        host === '24.199.82.193' ||
        host === '127.0.0.1' ||
        host === 'localhost';
      if (isStale && base) {
        let pathname = u.pathname || '';
        if (!pathname.startsWith('/storage/') && !pathname.startsWith('/api/')) {
          pathname = `/storage/${pathname.replace(/^\/+/, '')}`;
        }
        return `${base}${pathname}${u.search || ''}`;
      }
      return raw;
    } catch {
      return raw;
    }
  }

  const path = raw.replace(/^\/+/, '').replace(/^storage\//, '');
  return base ? `${base}/storage/${path}` : `/storage/${path}`;
}

export function getPhotographerToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setPhotographerSession(token, profile) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile || {}));
}

export function clearPhotographerSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function getPhotographerProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
  } catch {
    return null;
  }
}

const FRIENDLY_UPLOAD_TOO_LARGE =
  'Sube clips de máximo 2 minutos (recomendado). No se aceptan videos de más de 5 minutos.';

function isPostTooLargeMessage(text) {
  return /POST data is too large|post_max_size|Request Entity Too Large/i.test(text || '');
}

async function parseJson(response) {
  const raw = await response.text().catch(() => '');
  if (isPostTooLargeMessage(raw)) {
    const err = new Error(FRIENDLY_UPLOAD_TOO_LARGE);
    err.status = response.status || 413;
    throw err;
  }

  let body = {};
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      if (!response.ok) {
        throw new Error(raw.slice(0, 200) || `Error ${response.status}`);
      }
    }
  }

  if (!response.ok) {
    const err = new Error(body.message || `Error ${response.status}`);
    err.status = response.status;
    err.body = body;
    throw err;
  }
  return body;
}

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function photographerRegister({ full_name, instagram }) {
  const body = await parseJson(
    await fetch(buildUrl('/api/photographers/register'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, instagram }),
    })
  );
  setPhotographerSession(body.token, body.data);
  return body;
}

export async function photographerLogin({ full_name, instagram }) {
  const body = await parseJson(
    await fetch(buildUrl('/api/photographers/login'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, instagram }),
    })
  );
  setPhotographerSession(body.token, body.data);
  return body;
}

export async function photographerMagicLogin(token) {
  const body = await parseJson(
    await fetch(buildUrl('/api/photographers/magic-login'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
  );
  setPhotographerSession(body.token, body.data);
  return body;
}

export async function photographerLogout() {
  const token = getPhotographerToken();
  try {
    if (token) {
      await fetch(buildUrl('/api/photographers/logout'), {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
    }
  } finally {
    clearPhotographerSession();
  }
}

export async function searchRidersForMedia(q) {
  const token = getPhotographerToken();
  const params = new URLSearchParams({ q });
  return parseJson(
    await fetch(buildUrl(`/api/photographers/riders/search?${params}`), {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
  );
}

export async function fetchMyMedia(page = 1) {
  const token = getPhotographerToken();
  return parseJson(
    await fetch(buildUrl(`/api/photographers/media?page=${page}`), {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
  );
}

export async function uploadPhotographerMedia({ mediaType, files, riderId, isGeneral }) {
  const token = getPhotographerToken();
  const form = new FormData();
  form.append('is_general', isGeneral ? '1' : '0');
  if (riderId && !isGeneral) form.append('rider_id', String(riderId));
  for (const file of files) {
    form.append('files[]', file);
  }

  const path =
    mediaType === 'video'
      ? '/api/photographers/media/videos'
      : '/api/photographers/media/photos';

  let response;
  try {
    response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch (networkErr) {
    const err = new Error(
      'No se pudo subir. Revisa la conexión o usa clips de máximo 2 minutos.'
    );
    err.cause = networkErr;
    throw err;
  }

  if (response.status === 413) {
    const err = new Error(FRIENDLY_UPLOAD_TOO_LARGE);
    err.status = 413;
    throw err;
  }

  return parseJson(response);
}

export async function unlockCompetitorDossier({ plate_number, dni, access_token }) {
  const body = {
    plate_number: Number(plate_number),
    dni,
  };
  if (access_token) body.access_token = access_token;

  return parseJson(
    await fetch(buildUrl('/api/competitor-dossier/unlock'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

export async function unlockCompetitorDossierByToken(token) {
  return parseJson(
    await fetch(buildUrl(`/api/competitor-dossier/${encodeURIComponent(token)}`), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
  );
}
