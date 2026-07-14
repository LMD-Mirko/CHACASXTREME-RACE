import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * Reverb / Echo (sitio público)
 * Dev: tunnel Vite → /app|/apps → Reverb VPS (SSH tunnel o directo).
 * Prod: VITE_REVERB_* absolutos.
 */
function resolveReverbEndpoint() {
  const key = import.meta.env.VITE_REVERB_APP_KEY || 'uqehdqpxmzpvlro4kocd';
  const useViteProxy =
    import.meta.env.DEV && import.meta.env.VITE_REVERB_USE_VITE_PROXY !== 'false';

  if (useViteProxy && typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const port = Number(window.location.port || (isHttps ? 443 : 80));
    return {
      key,
      host: window.location.hostname,
      port,
      forceTLS: isHttps,
    };
  }

  const host = import.meta.env.VITE_REVERB_HOST || '127.0.0.1';
  const scheme = (import.meta.env.VITE_REVERB_SCHEME || (import.meta.env.PROD ? 'https' : 'http')).toLowerCase();
  const forceTLS = scheme === 'https';
  const port = Number(
    import.meta.env.VITE_REVERB_PORT || (forceTLS ? 443 : 8080)
  );

  return { key, host, port, forceTLS };
}

const { key, host, port, forceTLS } = resolveReverbEndpoint();

window.Echo = new Echo({
  broadcaster: 'reverb',
  key,
  wsHost: host,
  wsPort: port,
  wssPort: port,
  forceTLS,
  enabledTransports: forceTLS ? ['ws', 'wss'] : ['ws'],
  activityTimeout: 15000,
  pongTimeout: 8000,
});

if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && !forceTLS) {
  console.error(
    '[Echo] Página HTTPS + WebSocket sin TLS. Configura VITE_REVERB_SCHEME=https.'
  );
}

if (import.meta.env.DEV) {
  console.info('[Echo]', { host, port, forceTLS, key: `${key.slice(0, 4)}…`, via: 'vite-proxy' });
}
