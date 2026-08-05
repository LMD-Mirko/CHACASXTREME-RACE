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
  'El archivo es demasiado pesado para una sola petición. El panel reintentará por partes (hasta 4 GB).';

/** Chunk size must match backend PhotographerChunkUploadController::CHUNK_SIZE */
export const UPLOAD_CHUNK_SIZE = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 4 * 1024 * 1024 * 1024;
export const MAX_PHOTO_BYTES = 200 * 1024 * 1024;
/** Photos below this use single-shot XHR; above → chunked. Videos always chunked. */
export const CHUNK_THRESHOLD_BYTES = 20 * 1024 * 1024;

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

/** Valida Bearer en localStorage; si falló, limpia sesión. */
export async function photographerEnsureSession() {
  const token = getPhotographerToken();
  if (!token) return null;
  try {
    const body = await parseJson(
      await fetch(buildUrl('/api/photographers/me'), {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
    );
    if (body?.data) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(body.data));
      return body.data;
    }
  } catch {
    clearPhotographerSession();
  }
  return null;
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

/**
 * Legacy batch upload (sin progreso). Preferir uploadPhotographerFile.
 */
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
    const err = new Error('No se pudo subir. Revisa la conexión e inténtalo de nuevo.');
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

function authHeaders(json = false) {
  const token = getPhotographerToken();
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

function xhrSend({ method, url, headers, body, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    Object.entries(headers || {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));

    if (signal) {
      if (signal.aborted) {
        reject(Object.assign(new Error('Subida cancelada.'), { aborted: true }));
        return;
      }
      signal.addEventListener('abort', () => {
        xhr.abort();
      });
    }

    xhr.upload.onprogress = (evt) => {
      if (!onProgress || !evt.lengthComputable) return;
      onProgress({
        loaded: evt.loaded,
        total: evt.total,
        ratio: evt.total ? evt.loaded / evt.total : 0,
      });
    };

    xhr.onload = () => {
      const raw = xhr.responseText || '';
      if (isPostTooLargeMessage(raw) || xhr.status === 413) {
        const err = new Error(FRIENDLY_UPLOAD_TOO_LARGE);
        err.status = 413;
        reject(err);
        return;
      }
      let bodyJson = {};
      if (raw) {
        try {
          bodyJson = JSON.parse(raw);
        } catch {
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error(raw.slice(0, 200) || `Error ${xhr.status}`));
            return;
          }
        }
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        const err = new Error(bodyJson.message || `Error ${xhr.status}`);
        err.status = xhr.status;
        err.body = bodyJson;
        reject(err);
        return;
      }
      resolve(bodyJson);
    };

    xhr.onerror = () => {
      reject(new Error('Error de red durante la subida. Revisa tu conexión.'));
    };

    xhr.onabort = () => {
      reject(Object.assign(new Error('Subida cancelada.'), { aborted: true }));
    };

    xhr.send(body);
  });
}

/** Single-shot XHR con progreso (fotos pequeñas / fallback). */
export async function uploadPhotographerFileDirect({
  mediaType,
  file,
  riderId,
  isGeneral,
  onProgress,
  signal,
}) {
  const form = new FormData();
  form.append('is_general', isGeneral ? '1' : '0');
  if (riderId && !isGeneral) form.append('rider_id', String(riderId));
  form.append('files[]', file);

  const path =
    mediaType === 'video'
      ? '/api/photographers/media/videos'
      : '/api/photographers/media/photos';

  const body = await xhrSend({
    method: 'POST',
    url: buildUrl(path),
    headers: authHeaders(false),
    body: form,
    onProgress,
    signal,
  });

  return body;
}

async function startChunkSession({ mediaType, file, riderId, isGeneral }) {
  return parseJson(
    await fetch(buildUrl('/api/photographers/media/uploads'), {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({
        media_type: mediaType,
        original_filename: file.name,
        mime_type: file.type || 'application/octet-stream',
        total_size: file.size,
        is_general: !!isGeneral,
        rider_id: !isGeneral && riderId ? riderId : null,
      }),
    })
  );
}

async function putChunk({ uuid, index, blob, onProgress, signal }) {
  const form = new FormData();
  form.append('chunk', blob, `chunk_${index}`);

  return xhrSend({
    method: 'POST',
    url: buildUrl(`/api/photographers/media/uploads/${uuid}/chunks/${index}`),
    headers: authHeaders(false),
    body: form,
    onProgress,
    signal,
  });
}

async function completeChunkSession(uuid) {
  return parseJson(
    await fetch(buildUrl(`/api/photographers/media/uploads/${uuid}/complete`), {
      method: 'POST',
      headers: authHeaders(false),
    })
  );
}

export async function abortChunkSession(uuid) {
  const token = getPhotographerToken();
  if (!token || !uuid) return;
  try {
    await fetch(buildUrl(`/api/photographers/media/uploads/${uuid}`), {
      method: 'DELETE',
      headers: authHeaders(false),
    });
  } catch {
    // best-effort
  }
}

/**
 * Subida por chunks reanudable con progreso agregado.
 * onProgress({ loaded, total, ratio, phase: 'uploading'|'assembling' })
 */
export async function uploadPhotographerFileChunked({
  mediaType,
  file,
  riderId,
  isGeneral,
  onProgress,
  signal,
}) {
  const start = await startChunkSession({ mediaType, file, riderId, isGeneral });
  const session = start.data;
  const uuid = session.uuid;
  const chunkSize = session.chunk_size || UPLOAD_CHUNK_SIZE;
  const totalChunks = session.total_chunks;
  const received = new Set(session.received_chunks || []);

  const notify = (loaded, phase = 'uploading') => {
    if (!onProgress) return;
    onProgress({
      loaded,
      total: file.size,
      ratio: file.size ? Math.min(1, loaded / file.size) : 0,
      phase,
      uuid,
    });
  };

  try {
    for (let i = 0; i < totalChunks; i++) {
      if (signal?.aborted) {
        await abortChunkSession(uuid);
        throw Object.assign(new Error('Subida cancelada.'), { aborted: true });
      }

      if (received.has(i)) {
        const already = Math.min(file.size, (i + 1) * chunkSize);
        notify(already);
        continue;
      }

      const startByte = i * chunkSize;
      const endByte = Math.min(file.size, startByte + chunkSize);
      const blob = file.slice(startByte, endByte);

      let attempts = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        attempts += 1;
        try {
          await putChunk({
            uuid,
            index: i,
            blob,
            signal,
            onProgress: (p) => {
              const loaded = startByte + (p.loaded || 0);
              notify(Math.min(file.size, loaded));
            },
          });
          received.add(i);
          notify(Math.min(file.size, endByte));
          break;
        } catch (err) {
          if (err?.aborted) throw err;
          if (attempts >= 3) throw err;
          await new Promise((r) => setTimeout(r, 600 * attempts));
        }
      }
    }

    notify(file.size, 'assembling');
    const done = await completeChunkSession(uuid);
    notify(file.size, 'done');
    return done;
  } catch (err) {
    if (err?.aborted) {
      await abortChunkSession(uuid);
    }
    throw err;
  }
}

/**
 * Entrada principal: elige direct vs chunked según tipo/tamaño.
 */
export async function uploadPhotographerFile({
  mediaType,
  file,
  riderId,
  isGeneral,
  onProgress,
  signal,
}) {
  const max = mediaType === 'video' ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES;
  if (file.size > max) {
    const gb = (max / (1024 * 1024 * 1024)).toFixed(0);
    const mb = (max / (1024 * 1024)).toFixed(0);
    throw new Error(
      mediaType === 'video'
        ? `El video supera el máximo de ${gb} GB.`
        : `La imagen supera el máximo de ${mb} MB.`
    );
  }

  const useChunked = mediaType === 'video' || file.size >= CHUNK_THRESHOLD_BYTES;

  if (useChunked) {
    return uploadPhotographerFileChunked({
      mediaType,
      file,
      riderId,
      isGeneral,
      onProgress,
      signal,
    });
  }

  return uploadPhotographerFileDirect({
    mediaType,
    file,
    riderId,
    isGeneral,
    onProgress,
    signal,
  });
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

/**
 * Galería pública de race-media (fotos y/o videos), paginada.
 * Usada en “Busca tu media” dentro de Mi carrera.
 */
export async function fetchRaceMediaGallery({
  page = 1,
  perPage = 12,
  mediaType = 'all',
  q = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    media_type: mediaType,
  });
  const query = String(q || '').trim();
  if (query) params.set('q', query);

  const body = await parseJson(
    await fetch(buildUrl(`/api/race-media/gallery?${params}`), {
      headers: { Accept: 'application/json' },
    })
  );

  body.data = (body.data || []).map((item) => ({
    ...item,
    view_url: mediaPublicUrl(item.view_url),
    thumb_url: item.thumb_url ? mediaPublicUrl(item.thumb_url) : null,
  }));

  return body;
}

/** Descarga original autenticada con token de dossier. */
export function raceMediaDownloadUrl(mediaId, dossierToken) {
  if (!mediaId || !dossierToken) return '';
  return buildUrl(
    `/api/race-media/${mediaId}/download?dossier_token=${encodeURIComponent(dossierToken)}`
  );
}
