import { ref, onMounted, onBeforeUnmount } from 'vue';
import {
  ensureRaceChannels,
  onRaceEvent,
  softReconnectSocket,
  recoverSocketAfterForeground,
} from '@/core/network/raceRealtime';

/** Estado compartido en toda la app (singleton). */
const wsConnected = ref(false);
let bootstrapped = false;
let connectionBound = false;
const bootUnsubs = [];

function markConnected() {
  wsConnected.value = true;
}

function markDisconnected() {
  wsConnected.value = false;
}

function bindConnectionState() {
  const pusher = window.Echo?.connector?.pusher;
  if (!pusher || connectionBound) return;

  pusher.connection.bind('connected', markConnected);
  pusher.connection.bind('disconnected', markDisconnected);
  pusher.connection.bind('unavailable', markDisconnected);
  if (pusher.connection.state === 'connected') markConnected();
  connectionBound = true;

  bootUnsubs.push(() => {
    try {
      pusher.connection.unbind('connected', markConnected);
      pusher.connection.unbind('disconnected', markDisconnected);
      pusher.connection.unbind('unavailable', markDisconnected);
    } catch (_) { /* ignore */ }
    connectionBound = false;
  });
}

function dispatchPublic(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * Conecta Reverb / canales de carrera una sola vez para todo el sitio público.
 * Emite CustomEvents: public-countdown-started, public-rider-passed, public-rider-finished.
 */
export function bootstrapPublicRaceSocket() {
  if (bootstrapped) return;
  bootstrapped = true;

  ensureRaceChannels();
  bindConnectionState();

  bootUnsubs.push(
    onRaceEvent('mountain', '.CountdownStarted', (e) => {
      dispatchPublic('public-countdown-started', e);
    })
  );

  bootUnsubs.push(
    onRaceEvent('timing', '.RiderPassedCheckpoint', (e) => {
      dispatchPublic('public-rider-passed', e);
    })
  );

  bootUnsubs.push(
    onRaceEvent('timing', '.RiderFinished', (e) => {
      dispatchPublic('public-rider-finished', e);
    })
  );

  const onVis = () => {
    if (document.visibilityState === 'visible') {
      recoverSocketAfterForeground();
    } else {
      softReconnectSocket();
    }
  };
  document.addEventListener('visibilitychange', onVis);
  bootUnsubs.push(() => document.removeEventListener('visibilitychange', onVis));
}

export function usePublicRaceSocket() {
  onMounted(() => {
    bootstrapPublicRaceSocket();
  });

  onBeforeUnmount(() => {
    // No desuscribir canales globales: la capa vive en App durante toda la sesión.
  });

  return {
    wsConnected,
  };
}

export { wsConnected };
