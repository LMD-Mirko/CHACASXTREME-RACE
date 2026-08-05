<template>
  <div class="dossier-page">
    <div class="dossier-shell">
      <!-- GATE -->
      <template v-if="!dossier">
        <header class="gate" :class="{ 'is-in': gateIn }">
          <p class="kicker anim" style="--i: 0">Chacas Xtreme Race</p>
          <h1 class="anim" style="--i: 1">
            Mi <span class="accent">carrera</span>
          </h1>
          <p class="lede anim" style="--i: 2">
            Tus tiempos oficiales, fotos y videos. Preview en web; descarga el original.
          </p>
        </header>

        <p v-if="magicBooting" class="gate-form anim is-in" style="--i: 3">
          Abriendo tu enlace personal…
        </p>
        <p v-else-if="error && magicTried" class="gate-form anim is-in form-error" style="--i: 3">
          {{ error }}
        </p>

        <form v-if="!magicBooting" class="gate-form anim" :class="{ 'is-in': gateIn }" style="--i: 3" @submit.prevent="unlock()">
          <p class="gate-form__label">Acceso competidor</p>

          <label>
            <span>Número de placa</span>
            <input v-model="plate" type="number" min="1" required placeholder="Ej. 101" autocomplete="username" />
          </label>
          <label>
            <span>DNI / Pasaporte</span>
            <input
              v-model.trim="dni"
              type="text"
              required
              minlength="4"
              placeholder="Como en el padrón"
              autocomplete="off"
            />
          </label>
          <label>
            <span>Token de acceso</span>
            <input
              v-model.trim="accessToken"
              type="password"
              required
              minlength="4"
              placeholder="El que te dieron para el evento"
              autocomplete="off"
            />
          </label>

          <p v-if="error" class="form-error">{{ error }}</p>

          <button class="btn-primary" type="submit" :disabled="loading">
            {{ loading ? 'Verificando…' : 'Ver mi dossier' }}
          </button>
        </form>
      </template>

      <!-- DOSSIER -->
      <template v-else>
        <div class="dossier-body" :class="{ 'is-in': entered }">
        <header class="identity">
          <div class="identity__bar anim" style="--i: 0">
            <p class="kicker">{{ dossier.competition?.name || 'Chacas Xtreme Race' }}</p>
            <button type="button" class="ghost" @click="reset">Salir</button>
          </div>

          <div class="identity__row">
            <div class="plate anim anim--plate" style="--i: 1" aria-label="Número de placa">
              <span class="plate__lbl">Placa</span>
              <span class="plate__num">{{ padPlate(dossier.rider.plate_number) }}</span>
            </div>

            <div class="pilot anim" style="--i: 2">
              <div v-if="dossier.rider.photo_url" class="pilot__photo">
                <img :src="mediaPublicUrl(dossier.rider.photo_url)" :alt="dossier.rider.full_name" />
              </div>
              <div class="pilot__copy">
                <h1>{{ dossier.rider.full_name }}</h1>
                <p v-if="dossier.rider.nickname" class="nick">“{{ dossier.rider.nickname }}”</p>
                <p class="meta">
                  <template v-if="dossier.rider.category">{{ dossier.rider.category }}</template>
                  <template v-if="dossier.rider.club_team">
                    <span class="dot">·</span>{{ dossier.rider.club_team }}
                  </template>
                  <template v-if="dossier.rider.origin">
                    <span class="dot">·</span>{{ dossier.rider.origin }}
                  </template>
                </p>
              </div>
            </div>
          </div>
        </header>

        <section class="thanks anim" style="--i: 3">
          <h2>{{ dossier.thanks?.title || 'Gracias por competir' }}</h2>
          <p>{{ dossier.thanks?.body }}</p>
        </section>

        <!-- TIMES: Salida → Meta only -->
        <section class="section">
          <div class="section__head anim" style="--i: 4">
            <h2>Tus tiempos</h2>
            <p>Clasificación y Final</p>
          </div>

          <div class="timing">
            <article
              v-for="(phase, pIdx) in phases"
              :key="phase.key"
              class="timing__card anim"
              :class="{ 'timing__card--final': phase.key === 'final' }"
              :style="{ '--i': 5 + pIdx }"
            >
              <header class="timing__head">
                <div>
                  <h3>{{ phase.label }}</h3>
                  <p>{{ phase.sub }}</p>
                </div>
                <span class="pill" :class="statusClass(dossier.results?.[phase.key]?.status)">
                  {{ statusLabel(dossier.results?.[phase.key]?.status) }}
                </span>
              </header>

              <template v-if="dossier.results?.[phase.key]">
                <div class="timing__hero">
                  <div>
                    <span class="micro">Puesto</span>
                    <strong class="pos">{{ formatPositionNum(dossier.results[phase.key]) }}</strong>
                  </div>
                  <div>
                    <span class="micro">Tiempo neto</span>
                    <strong class="chrono">{{ formatResult(dossier.results[phase.key]) }}</strong>
                  </div>
                </div>

                <div class="splits">
                  <div class="splits__item" :class="{ on: !!dossier.results[phase.key].start_time }">
                    <span class="splits__lbl">Salida</span>
                    <strong>{{ displayClock(dossier.results[phase.key].start_time) }}</strong>
                  </div>
                  <div class="splits__rail" aria-hidden="true" />
                  <div class="splits__item" :class="{ on: !!dossier.results[phase.key].meta_time }">
                    <span class="splits__lbl">Meta</span>
                    <strong>{{ displayClock(dossier.results[phase.key].meta_time) }}</strong>
                  </div>
                </div>

                <dl class="facts">
                  <div>
                    <dt>Categoría</dt>
                    <dd>{{ dossier.results[phase.key].category_name || dossier.rider.category || '—' }}</dd>
                  </div>
                  <div v-if="dossier.results[phase.key].gap && dossier.results[phase.key].gap !== '—'">
                    <dt>Diferencia</dt>
                    <dd>{{ dossier.results[phase.key].gap }}</dd>
                  </div>
                  <div v-if="dossier.results[phase.key].duration_ms != null">
                    <dt>Duración</dt>
                    <dd>{{ formatMs(dossier.results[phase.key].duration_ms) }}</dd>
                  </div>
                </dl>
              </template>

              <p v-else class="empty-inline">Aún sin registro en esta fase.</p>
            </article>
          </div>
        </section>

        <!-- PHOTOS -->
        <section class="section">
          <div class="section__head anim" style="--i: 7">
            <h2>Tus fotos</h2>
            <p class="ok">{{ dossier.photos?.length || 0 }} · preview web · descarga original</p>
          </div>

          <div v-if="!dossier.photos?.length" class="empty anim" style="--i: 8">Aún no hay fotos asociadas a tu placa.</div>

          <div v-else class="gallery">
            <figure
              v-for="(photo, idx) in dossier.photos"
              :key="photo.id"
              class="shot anim"
              :style="{ '--i': 8 + Math.min(idx, 6) }"
              @click="openLightbox(idx)"
            >
              <div class="shot__media">
                <img :src="mediaPublicUrl(photo.preview_url)" :alt="photo.original_filename" loading="lazy" />
              </div>
              <figcaption>
                <div>
                  <strong>{{ shortName(photo.original_filename) }}</strong>
                  <span v-if="photo.photographer">
                    {{ photo.photographer.full_name }}
                    <template v-if="photo.photographer.instagram">
                      · @{{ photo.photographer.instagram }}
                    </template>
                  </span>
                  <span>{{ formatBytes(photo.size_bytes) }}</span>
                </div>
                <a :href="photo.download_url" download class="icon-dl" @click.stop title="Descargar">
                  ↓
                </a>
              </figcaption>
            </figure>
          </div>
        </section>

        <!-- VIDEOS -->
        <section class="section">
          <div class="section__head anim" style="--i: 15">
            <h2>Tus videos</h2>
            <p>{{ dossier.videos?.length || 0 }} clip(s) · preview web · descarga original</p>
          </div>

          <div
            v-if="!dossier.videos?.length"
            class="empty anim"
            style="--i: 16"
          >
            Aún no hay videos asociados a tu placa.
          </div>

          <div v-else class="reels">
            <article
              v-for="(video, vIdx) in dossier.videos"
              :key="video.id"
              class="reel anim"
              :style="{ '--i': 16 + Math.min(vIdx, 4) }"
            >
              <div
                class="reel__stage"
                :class="videoOrient[video.id] === 'portrait' ? 'reel__stage--portrait' : 'reel__stage--landscape'"
              >
                <video
                  :src="mediaPublicUrl(video.preview_url)"
                  :poster="video.thumb_url ? mediaPublicUrl(video.thumb_url) : undefined"
                  controls
                  playsinline
                  preload="metadata"
                  @loadedmetadata="onReelMeta($event, video)"
                />
              </div>
              <div class="reel__bar">
                <div>
                  <strong>{{ shortName(video.original_filename) }}</strong>
                  <span class="orient-tag">
                    {{
                      videoOrient[video.id] === 'portrait' || video.orientation === 'portrait'
                        ? 'Vertical'
                        : 'Horizontal'
                    }}
                  </span>
                  <span v-if="!video.has_web_preview" class="orient-tag orient-tag--warn">Sin versión web</span>
                  <span v-if="video.photographer">
                    {{ video.photographer.full_name }}
                    <template v-if="video.photographer.instagram">
                      · @{{ video.photographer.instagram }}
                    </template>
                  </span>
                  <span>{{ formatBytes(video.size_bytes) }}</span>
                </div>
                <a :href="video.download_url" download class="dl-text">Descargar original</a>
              </div>
            </article>
          </div>
        </section>

        <!-- BUSCA TU MEDIA (todos) -->
        <section class="section">
          <DossierMediaBrowser :dossier-token="dossierToken" />
        </section>
        </div>
      </template>

      <router-link class="back" to="/inicio">← Volver al inicio</router-link>
    </div>

    <!-- Mini splash post-login -->
    <Teleport to="body">
      <div v-if="ceremony" class="splash" aria-hidden="true">
        <div class="splash__wipe" ref="wipeEl" />
        <div class="splash__core">
          <div ref="ringEl" class="splash__ring" />
          <p ref="kickerEl" class="splash__kicker">Dossier desbloqueado</p>
          <div ref="plateEl" class="splash__plate">
            <span class="sym">#</span>{{ ceremonyPlate }}
          </div>
          <h2 ref="nameEl" class="splash__name">{{ ceremonyName }}</h2>
        </div>
      </div>
    </Teleport>

    <!-- LIGHTBOX -->
    <Teleport to="body">
      <div
        v-if="lightboxIndex != null && dossier?.photos?.[lightboxIndex]"
        class="lb"
        role="dialog"
        aria-modal="true"
        @click.self="closeLightbox"
      >
        <button type="button" class="lb__x" @click="closeLightbox" aria-label="Cerrar">×</button>
        <button
          v-if="dossier.photos.length > 1"
          type="button"
          class="lb__nav prev"
          @click="prevPhoto"
          aria-label="Anterior"
        >‹</button>
        <figure>
          <img
            :src="mediaPublicUrl(dossier.photos[lightboxIndex].preview_url)"
            :alt="dossier.photos[lightboxIndex].original_filename"
          />
          <figcaption>
            <span>{{ lightboxIndex + 1 }} / {{ dossier.photos.length }} · {{ formatBytes(dossier.photos[lightboxIndex].size_bytes) }}</span>
            <a :href="dossier.photos[lightboxIndex].download_url" download class="dl-text">Descargar original</a>
          </figcaption>
        </figure>
        <button
          v-if="dossier.photos.length > 1"
          type="button"
          class="lb__nav next"
          @click="nextPhoto"
          aria-label="Siguiente"
        >›</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import gsap from 'gsap';
import { unlockCompetitorDossier, unlockCompetitorDossierByToken, mediaPublicUrl } from '../api/mediaApi';
import DossierMediaBrowser from '../components/DossierMediaBrowser.vue';

const SESSION_KEY = 'chacas_competitor_dossier';

const route = useRoute();
const router = useRouter();

const plate = ref('');
const dni = ref('');
const accessToken = ref('');
const magicLinkToken = ref('');
const loading = ref(false);
const error = ref('');
const dossier = ref(null);
const dossierToken = ref('');
const lightboxIndex = ref(null);
const entered = ref(false);
const gateIn = ref(false);
const ceremony = ref(false);
const ceremonyPlate = ref('00');
const ceremonyName = ref('');
const restoring = ref(false);
const magicBooting = ref(false);
const magicTried = ref(false);
/** @type {import('vue').Ref<Record<number|string, 'portrait'|'landscape'>>} */
const videoOrient = ref({});

function onReelMeta(e, video) {
  const el = e?.target;
  const w = Number(el?.videoWidth) || 0;
  const h = Number(el?.videoHeight) || 0;
  const videoId = video?.id;
  let orient = h > w ? 'portrait' : 'landscape';
  if (video?.has_web_preview) {
    // preview web ya upright
  } else if (video?.orientation === 'portrait' || video?.orientation === 'landscape') {
    orient = video.orientation;
  }
  videoOrient.value = {
    ...videoOrient.value,
    [videoId]: orient,
  };
}

const wipeEl = ref(null);
const ringEl = ref(null);
const kickerEl = ref(null);
const plateEl = ref(null);
const nameEl = ref(null);

const phases = [
  { key: 'practica', label: 'Clasificación', sub: 'Ranking previo' },
  { key: 'final', label: 'Final', sub: 'Resultado oficial' },
];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.magicToken) return data;
    if (!data?.plate || !data?.dni || !data?.accessToken) return null;
    return data;
  } catch {
    return null;
  }
}

function saveSession(plateVal, dniVal, tokenVal, dossierTok = '') {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      plate: String(plateVal),
      dni: String(dniVal),
      accessToken: String(tokenVal),
      dossierToken: String(dossierTok || ''),
      at: Date.now(),
    })
  );
}

function saveMagicSession(tokenVal, dossierTok = '') {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      magicToken: String(tokenVal),
      dossierToken: String(dossierTok || ''),
      at: Date.now(),
    })
  );
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function playUnlockSplash(rider) {
  ceremonyPlate.value = padPlate(rider?.plate_number);
  ceremonyName.value = rider?.full_name || 'Competidor';
  ceremony.value = true;
  await nextTick();

  const wipe = wipeEl.value;
  const ring = ringEl.value;
  const kicker = kickerEl.value;
  const plateNode = plateEl.value;
  const nameNode = nameEl.value;

  if (!wipe || !plateNode || !nameNode) {
    ceremony.value = false;
    return;
  }

  return new Promise((resolve) => {
    gsap.set(wipe, { x: '115%', opacity: 1, skewX: -14 });
    gsap.set(ring, { scale: 0.75, opacity: 0 });
    gsap.set(kicker, { y: 16, opacity: 0 });
    gsap.set(plateNode, { scale: 0.88, opacity: 0, rotate: -3 });
    gsap.set(nameNode, { y: 20, opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        ceremony.value = false;
        resolve();
      },
    });

    tl.to(wipe, { x: '-25%', duration: 0.55, ease: 'power4.inOut' }, 0)
      .to(ring, { scale: 1, opacity: 1, duration: 0.4 }, 0.18)
      .to(kicker, { y: 0, opacity: 1, duration: 0.3 }, 0.28)
      .to(
        plateNode,
        { scale: 1, opacity: 1, rotate: 0, duration: 0.55, ease: 'back.out(1.5)' },
        0.32
      )
      .to(nameNode, { y: 0, opacity: 1, duration: 0.4 }, 0.48)
      .to(plateNode, { scale: 1.05, duration: 0.28, yoyo: true, repeat: 1 }, 0.95)
      .to(
        [kicker, plateNode, nameNode, ring],
        { opacity: 0, y: -16, duration: 0.35, stagger: 0.03 },
        1.45
      )
      .to(wipe, { x: '-130%', duration: 0.4, ease: 'power3.in' }, 1.45);
  });
}

/**
 * @param {{ skipSplash?: boolean, fromSession?: boolean, magicToken?: string }} [opts]
 */
async function unlock(opts = {}) {
  const { skipSplash = false, fromSession = false, magicToken = '' } = opts;
  error.value = '';
  loading.value = true;
  entered.value = false;
  try {
    const token = String(magicToken || magicLinkToken.value || '').trim();
    const res = token
      ? await unlockCompetitorDossierByToken(token)
      : await unlockCompetitorDossier({
          plate_number: plate.value,
          dni: dni.value,
          access_token: accessToken.value,
        });
    dossier.value = res.data;
    dossierToken.value = res.dossier_token || '';
    if (token) saveMagicSession(token, dossierToken.value);
    else saveSession(plate.value, dni.value, accessToken.value, dossierToken.value);
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (!skipSplash && !fromSession && !prefersReducedMotion()) {
      await playUnlockSplash(res.data?.rider);
    }

    await nextTick();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        entered.value = true;
      });
    });
  } catch (e) {
    if (fromSession) {
      clearSession();
      error.value = '';
    } else {
      error.value = e.message || 'No se pudo desbloquear el dossier.';
    }
  } finally {
    loading.value = false;
    restoring.value = false;
    magicBooting.value = false;
  }
}

function reset() {
  clearSession();
  dossier.value = null;
  dossierToken.value = '';
  lightboxIndex.value = null;
  entered.value = false;
  ceremony.value = false;
  accessToken.value = '';
  gateIn.value = false;
  gsap.killTweensOf([wipeEl.value, ringEl.value, kickerEl.value, plateEl.value, nameEl.value].filter(Boolean));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      gateIn.value = true;
    });
  });
}

function padPlate(n) {
  const s = String(n ?? '');
  return s.padStart(Math.max(2, s.length), '0');
}

function formatResult(row) {
  if (!row) return '—';
  if (row.time_formatted && row.time_formatted !== '—') return row.time_formatted;
  return row.meta_time || 'Sin tiempo';
}

function formatPositionNum(row) {
  if (!row) return '—';
  const p = row.position;
  if (p == null || p === '—' || p === '') return '—';
  return String(p).padStart(2, '0');
}

function statusLabel(status) {
  if (!status) return 'Sin datos';
  const map = {
    LLEGÓ: 'Llegó',
    'EN RUTA': 'En ruta',
    DNF: 'DNF',
    DNS: 'DNS',
    PRE_INSCRITO: 'Pre',
  };
  return map[status] || status;
}

function statusClass(status) {
  if (!status) return 'muted';
  if (status === 'LLEGÓ') return 'ok';
  if (status === 'EN RUTA') return 'live';
  if (status === 'DNF' || status === 'DNS') return 'bad';
  return 'muted';
}

function displayClock(value) {
  return value && value !== '—' ? value : '—:—:—';
}

function formatMs(ms) {
  if (ms == null || Number.isNaN(Number(ms))) return '—';
  const total = Math.max(0, Math.floor(Number(ms) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function shortName(name) {
  if (!name) return 'archivo';
  if (name.length <= 28) return name;
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  return `${name.slice(0, 18)}…${ext}`;
}

function openLightbox(idx) {
  lightboxIndex.value = idx;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxIndex.value = null;
  document.body.style.overflow = '';
}

function prevPhoto() {
  if (!dossier.value?.photos?.length || lightboxIndex.value == null) return;
  const len = dossier.value.photos.length;
  lightboxIndex.value = (lightboxIndex.value - 1 + len) % len;
}

function nextPhoto() {
  if (!dossier.value?.photos?.length || lightboxIndex.value == null) return;
  lightboxIndex.value = (lightboxIndex.value + 1) % dossier.value.photos.length;
}

function onKey(e) {
  if (lightboxIndex.value == null) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevPhoto();
  if (e.key === 'ArrowRight') nextPhoto();
}

onMounted(async () => {
  window.addEventListener('keydown', onKey);

  const queryToken = String(route.query.token || '').trim();
  if (queryToken) {
    magicTried.value = true;
    magicBooting.value = true;
    magicLinkToken.value = queryToken;
    await unlock({ magicToken: queryToken });
    if (dossier.value) {
      router.replace({ path: '/mi-carrera', query: {} });
      return;
    }
    requestAnimationFrame(() => {
      gateIn.value = true;
    });
    return;
  }

  const session = loadSession();
  if (session?.magicToken) {
    restoring.value = true;
    magicLinkToken.value = session.magicToken;
    await unlock({ skipSplash: true, fromSession: true, magicToken: session.magicToken });
    if (!dossier.value) {
      requestAnimationFrame(() => {
        gateIn.value = true;
      });
    }
    return;
  }

  if (session) {
    restoring.value = true;
    plate.value = session.plate;
    dni.value = session.dni;
    accessToken.value = session.accessToken;
    await unlock({ skipSplash: true, fromSession: true });
    if (!dossier.value) {
      accessToken.value = '';
      requestAnimationFrame(() => {
        gateIn.value = true;
      });
    }
    return;
  }

  requestAnimationFrame(() => {
    gateIn.value = true;
  });
});
onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  document.body.style.overflow = '';
  gsap.killTweensOf([wipeEl.value, ringEl.value, kickerEl.value, plateEl.value, nameEl.value].filter(Boolean));
});
</script>

<style scoped>
.dossier-page {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --stagger: 55ms;
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  min-height: 100dvh;
  background: #000;
  color: #fff;
  padding: clamp(1.5rem, 4vw, 2.75rem) var(--container-px) 3.5rem;
  font-family: var(--font-main);
}

/* Emil-style entrance: opacity + transform only, ease-out, stagger */
.anim {
  opacity: 0;
  transform: translateY(18px) scale(0.96);
  will-change: transform, opacity;
}

.gate.is-in .anim,
.gate-form.is-in.anim,
.dossier-body.is-in .anim {
  animation: enter-up 480ms var(--ease-out) both;
  animation-delay: calc(var(--i, 0) * var(--stagger));
}

.dossier-body.is-in .anim--plate {
  animation-name: enter-plate;
  animation-duration: 560ms;
}

@keyframes enter-up {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes enter-plate {
  from {
    opacity: 0;
    transform: translateY(22px) scale(0.9);
  }
  65% {
    opacity: 1;
    transform: translateY(0) scale(1.04);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* —— Mini splash post-login —— */
.splash {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: grid;
  place-items: center;
  background: #000;
  overflow: hidden;
  pointer-events: none;
}

.splash__wipe {
  position: absolute;
  top: -25%;
  left: 0;
  z-index: 1;
  width: 58vw;
  height: 150%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 94, 0, 0.55) 35%,
    var(--primary-color) 55%,
    rgba(255, 94, 0, 0.35) 75%,
    transparent
  );
  mix-blend-mode: screen;
  pointer-events: none;
}

.splash__core {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  max-width: min(92vw, 640px);
}

.splash__ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(72vw, 300px);
  height: min(72vw, 300px);
  margin: calc(min(72vw, 300px) / -2) 0 0 calc(min(72vw, 300px) / -2);
  border: 2px solid rgba(255, 94, 0, 0.55);
  border-radius: 50%;
  box-shadow: 0 0 40px rgba(255, 94, 0, 0.3);
  pointer-events: none;
}

.splash__kicker {
  position: relative;
  margin: 0 0 0.65rem;
  font-family: var(--font-accent);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.splash__plate {
  position: relative;
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(4.5rem, 18vw, 7.5rem);
  letter-spacing: 0.04em;
  line-height: 0.92;
  color: #fff;
  text-shadow:
    0 0 28px rgba(255, 94, 0, 0.65),
    0 0 60px rgba(255, 94, 0, 0.35);
}

.splash__plate .sym {
  font-family: var(--font-symbols);
  color: var(--primary-color);
  margin-right: 0.05em;
}

.splash__name {
  position: relative;
  margin: 0.85rem 0 0;
  font-family: var(--font-podium);
  font-size: clamp(1.45rem, 5.5vw, 2.4rem);
  letter-spacing: 0.04em;
  line-height: 1.05;
  word-spacing: 0.15em;
  color: #fff;
  text-wrap: balance;
}

.dossier-shell {
  position: relative;
  z-index: 1;
  width: min(960px, 100%);
  margin: 0 auto;
}

.kicker {
  margin: 0;
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* —— Gate —— */
.gate {
  padding: clamp(1.5rem, 6vh, 3rem) 0 1.25rem;
}

.gate h1 {
  margin: 0.4rem 0 0.75rem;
  font-family: var(--font-podium);
  font-size: clamp(3rem, 12vw, 5rem);
  letter-spacing: 0.04em;
  line-height: 0.92;
}

.gate .accent {
  color: var(--primary-color);
}

.gate-form {
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 1.5rem;
  padding: 1.25rem 1.15rem 1.3rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 2px solid var(--primary-color);
  background: #000;
}

.lede {
  margin: 0;
  max-width: 28rem;
  color: rgba(255, 255, 255, 0.58);
  font-size: 1.05rem;
  line-height: 1.5;
}

.gate-form__label {
  margin: 0 0 0.15rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--primary-color);
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.48);
}

input {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: #080808;
  color: #fff;
  border-radius: 4px;
  padding: 0.85rem 0.95rem;
  font-size: 1rem;
  font-family: var(--font-accent);
  transition: border-color 180ms cubic-bezier(0.23, 1, 0.32, 1);
}

input:focus {
  outline: none;
  border-color: rgba(255, 94, 0, 0.7);
}

.btn-primary {
  margin-top: 0.25rem;
  border: none;
  border-radius: 4px;
  background: var(--accent-gradient);
  color: #111;
  font-family: var(--font-accent);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.95rem;
  cursor: pointer;
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), filter 160ms ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: wait;
}

.form-error {
  margin: 0;
  color: #fca5a5;
  font-size: 0.88rem;
}

/* —— Identity (signature) —— */
.identity {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.identity__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.35rem;
}

.ghost {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #fff;
  padding: 0.45rem 0.85rem;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 180ms ease, color 180ms ease;
}

.ghost:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.identity__row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(1rem, 3vw, 1.75rem);
  align-items: center;
}

.plate {
  min-width: 6.75rem;
  padding: 0.85rem 0.95rem 0.75rem;
  border: 2px solid var(--primary-color);
  text-align: center;
  box-shadow: 6px 6px 0 rgba(255, 94, 0, 0.25);
}

.plate__lbl {
  display: block;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.plate__num {
  display: block;
  margin-top: 0.15rem;
  font-family: var(--font-podium);
  font-size: clamp(2.4rem, 8vw, 3.4rem);
  line-height: 0.92;
  letter-spacing: 0.04em;
  color: var(--primary-color);
}

.pilot {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.pilot__photo {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 94, 0, 0.55);
  flex-shrink: 0;
}

.pilot__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pilot__copy h1 {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(1.7rem, 5vw, 2.6rem);
  letter-spacing: 0.03em;
  line-height: 1;
}

.nick {
  margin: 0.35rem 0 0;
  color: var(--secondary-color);
  font-family: var(--font-accent);
  font-style: italic;
  font-size: 0.92rem;
}

.meta {
  margin: 0.55rem 0 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.88rem;
}

.dot {
  margin: 0 0.35rem;
  opacity: 0.5;
}

/* —— Thanks —— */
.thanks {
  margin-top: 1.75rem;
  padding-top: 0.25rem;
}

.thanks h2 {
  margin: 0 0 0.4rem;
  font-family: var(--font-podium);
  font-size: clamp(1.25rem, 3vw, 1.65rem);
  letter-spacing: 0.03em;
  color: var(--secondary-color);
}

.thanks p {
  margin: 0;
  max-width: 40rem;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.55;
}

/* —— Sections —— */
.section {
  margin-top: clamp(2rem, 4vw, 2.75rem);
}

.section__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.section__head h2 {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(1.55rem, 4vw, 2.1rem);
  letter-spacing: 0.04em;
}

.section__head p {
  margin: 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.82rem;
}

.section__head .ok {
  color: #6ee7b7;
}

/* —— Timing —— */
.timing {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}

@media (min-width: 760px) {
  .timing {
    grid-template-columns: 1fr 1fr;
  }
}

.timing__card {
  padding: 1.15rem 1.1rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #000;
}

.timing__card--final {
  border-color: rgba(255, 94, 0, 0.45);
}

.timing__head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
}

.timing__head h3 {
  margin: 0;
  font-family: var(--font-podium);
  font-size: 1.35rem;
  letter-spacing: 0.04em;
}

.timing__head p {
  margin: 0.2rem 0 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.78rem;
}

.pill {
  align-self: flex-start;
  padding: 0.3rem 0.55rem;
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.pill.ok {
  color: #6ee7b7;
  border-color: rgba(110, 231, 183, 0.45);
}
.pill.live {
  color: var(--secondary-color);
  border-color: rgba(251, 191, 36, 0.45);
}
.pill.bad {
  color: #fda4af;
  border-color: rgba(225, 29, 72, 0.45);
}
.pill.muted {
  color: rgba(255, 255, 255, 0.45);
}

.timing__hero {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.1rem;
  align-items: end;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.micro {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
}

.pos {
  display: block;
  font-family: var(--font-podium);
  font-size: clamp(2.6rem, 8vw, 3.4rem);
  line-height: 0.9;
  color: var(--primary-color);
}

.chrono {
  display: block;
  font-family: var(--font-symbols);
  font-variant-numeric: tabular-nums;
  font-size: clamp(1.45rem, 3.8vw, 1.9rem);
  line-height: 1;
}

.splits {
  display: grid;
  grid-template-columns: 1fr 28px 1fr;
  gap: 0.5rem;
  align-items: center;
}

.splits__item {
  opacity: 0.35;
}

.splits__item.on {
  opacity: 1;
}

.splits__lbl {
  display: block;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
}

.splits__item strong {
  display: block;
  margin-top: 0.15rem;
  font-family: var(--font-symbols);
  font-variant-numeric: tabular-nums;
  font-size: 1.02rem;
}

.splits__rail {
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0.55;
}

.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1.35rem;
  margin: 1rem 0 0;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.facts dt {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
}

.facts dd {
  margin: 0.12rem 0 0;
  font-size: 0.88rem;
  font-weight: 600;
}

.empty-inline,
.empty {
  margin: 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.92rem;
}

.empty {
  padding: 1.25rem 0;
}

/* —— Gallery —— */
.gallery {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}

@media (min-width: 600px) {
  .gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 920px) {
  .gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}

.shot {
  margin: 0;
  cursor: zoom-in;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #000;
  transition: border-color 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (hover: hover) and (pointer: fine) {
  .shot:hover {
    border-color: rgba(255, 94, 0, 0.55);
    transform: translateY(-2px);
  }

  .shot:hover .shot__media img {
    transform: scale(1.04);
  }
}

.shot__media {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #0a0a0a;
}

.shot__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 280ms cubic-bezier(0.23, 1, 0.32, 1);
}

.shot figcaption {
  display: flex;
  justify-content: space-between;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.7rem 0.75rem 0.8rem;
}

.shot strong {
  display: block;
  font-size: 0.76rem;
}

.shot span {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.42);
  line-height: 1.35;
}

.icon-dl {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 94, 0, 0.5);
  color: var(--primary-color);
  font-size: 1rem;
  text-decoration: none;
  transition: background 160ms ease, color 160ms ease;
}

.icon-dl:hover {
  background: var(--primary-color);
  color: #111;
}

/* —— Videos —— */
.reels {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reel {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #000;
  overflow: hidden;
}

.reel__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  min-height: 200px;
}

.reel__stage--landscape video {
  width: 100%;
  height: auto;
  max-height: min(50vh, 440px);
  display: block;
  object-fit: contain;
  background: #000;
}

.reel__stage--portrait video {
  width: auto;
  max-width: min(100%, 380px);
  height: min(70vh, 560px);
  max-height: min(70vh, 560px);
  display: block;
  object-fit: contain;
  background: #000;
  margin: 0 auto;
}

.orient-tag {
  display: inline-block !important;
  margin: 0.25rem 0 0 !important;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(255, 94, 0, 0.18);
  color: #fdba74 !important;
  font-size: 0.62rem !important;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.orient-tag--warn {
  background: rgba(250, 204, 21, 0.16);
  color: #fde68a !important;
}

.reel__bar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem 0.95rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}

.reel__bar strong {
  display: block;
  font-size: 0.9rem;
}

.reel__bar span {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.42);
}

.dl-text {
  color: var(--primary-color);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
}

.dl-text:hover {
  text-decoration: underline;
}

.back {
  display: inline-block;
  margin-top: 1.75rem;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.88rem;
  text-decoration: none;
}

.back:hover {
  color: var(--primary-color);
}

/* —— Entrance handled above (Emil stagger) —— */

/* —— Lightbox —— */
.lb {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.94);
  animation: fade 200ms var(--ease-out);
}

@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lb figure {
  margin: 0;
  width: min(920px, 100%);
}

.lb img {
  width: 100%;
  max-height: calc(100dvh - 5.5rem);
  object-fit: contain;
  display: block;
  background: #000;
}

.lb figcaption {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding-top: 0.85rem;
  flex-wrap: wrap;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.82rem;
}

.lb__x {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: #000;
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.lb__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 56px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 1.75rem;
  cursor: pointer;
}

.lb__nav.prev { left: 0.65rem; }
.lb__nav.next { right: 0.65rem; }

@media (max-width: 640px) {
  .identity__row {
    grid-template-columns: 1fr;
  }

  .splits {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .splits__rail {
    width: 2px;
    height: 20px;
    margin-left: 0.15rem;
    background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
  }

  .lb__nav {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .anim {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }

  .splash,
  .lb,
  .shot,
  .shot__media img,
  .btn-primary {
    animation: none !important;
    transition: none !important;
  }

  .splash {
    display: none !important;
  }
}
</style>
