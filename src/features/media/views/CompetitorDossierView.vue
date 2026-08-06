<template>
  <div class="dossier-page">
    <div class="dossier-page__glow" aria-hidden="true" />
    <div class="dossier-page__grain" aria-hidden="true" />

    <div class="dossier-shell">
      <!-- GATE -->
      <template v-if="!dossier">
        <header class="gate" :class="{ 'is-in': gateIn }">
          <p class="kicker anim" style="--i: 0">Chacas Xtreme Race · 4ª ed.</p>
          <h1 class="anim" style="--i: 1">
            Mi <span class="accent">carrera</span>
          </h1>
          <p class="lede anim" style="--i: 2">
            Tiempos oficiales, tus fotos y videos. Preview rápido en web; descarga el original en máxima calidad.
          </p>
        </header>

        <p v-if="magicBooting" class="gate-form anim is-in gate-form--status" style="--i: 3">
          Abriendo tu enlace personal…
        </p>
        <p v-else-if="error && magicTried" class="gate-form anim is-in form-error" style="--i: 3">
          {{ error }}
        </p>

        <form
          v-if="!magicBooting"
          class="gate-form anim"
          :class="{ 'is-in': gateIn }"
          style="--i: 3"
          @submit.prevent="unlock()"
        >
          <div class="gate-form__top">
            <p class="gate-form__label">Acceso competidor</p>
            <p class="gate-form__hint">Usa los datos del padrón y el token del evento.</p>
          </div>

          <label>
            <span>Número de placa</span>
            <input v-model="plate" type="number" min="1" required placeholder="Ej. 101" inputmode="numeric" autocomplete="username" />
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
          <header class="topbar anim" style="--i: 0">
            <div class="topbar__copy">
              <p class="kicker">{{ dossier.competition?.name || 'Chacas Xtreme Race' }}</p>
              <p class="topbar__sub">Dossier del competidor</p>
            </div>
            <button type="button" class="ghost" @click="reset">Salir</button>
          </header>

          <section class="hero anim" style="--i: 1">
            <div class="hero__plate" aria-label="Número de placa">
              <span class="hero__plate-lbl">Placa</span>
              <span class="hero__plate-num">{{ padPlate(dossier.rider.plate_number) }}</span>
            </div>
            <div class="hero__pilot">
              <div v-if="dossier.rider.photo_url" class="hero__photo">
                <img :src="mediaPublicUrl(dossier.rider.photo_url)" :alt="dossier.rider.full_name" />
              </div>
              <div class="hero__text">
                <h1>{{ dossier.rider.full_name }}</h1>
                <p v-if="dossier.rider.nickname" class="nick">“{{ dossier.rider.nickname }}”</p>
                <p class="hero__meta">
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
          </section>

          <nav class="jump anim" style="--i: 2" aria-label="Secciones">
            <a href="#dossier-tiempos" @click.prevent="scrollTo('dossier-tiempos')">Tiempos</a>
            <a href="#dossier-fotos" @click.prevent="scrollTo('dossier-fotos')">
              Fotos
              <em>{{ dossier.photos?.length || 0 }}</em>
            </a>
            <a href="#dossier-videos" @click.prevent="scrollTo('dossier-videos')">
              Videos
              <em>{{ dossier.videos?.length || 0 }}</em>
            </a>
            <a href="#dossier-busca" @click.prevent="scrollTo('dossier-busca')">Buscar</a>
          </nav>

          <section class="thanks anim" style="--i: 3">
            <p class="thanks__kicker">Mensaje</p>
            <h2>{{ dossier.thanks?.title || 'Gracias por competir' }}</h2>
            <p>{{ dossier.thanks?.body }}</p>
          </section>

          <!-- TIMES -->
          <section id="dossier-tiempos" class="section">
            <div class="section__head anim" style="--i: 4">
              <div>
                <p class="section__kicker">Cronometría oficial</p>
                <h2>Tus tiempos</h2>
              </div>
              <p>Salida → Meta</p>
            </div>

            <div class="timing">
              <article
                v-for="(phase, pIdx) in phases"
                :key="phase.key"
                class="chrono-board anim"
                :class="[
                  phase.key === 'final' ? 'chrono-board--final' : 'chrono-board--class',
                  { 'chrono-board--empty': !dossier.results?.[phase.key] },
                ]"
                :style="{ '--i': 5 + pIdx }"
              >
                <div class="chrono-board__glow" aria-hidden="true" />
                <div class="chrono-board__grid" aria-hidden="true" />

                <header class="chrono-board__head">
                  <div class="chrono-board__phase">
                    <span class="chrono-board__idx">{{ String(pIdx + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3>{{ phase.label }}</h3>
                      <p>{{ phase.sub }}</p>
                    </div>
                  </div>
                  <span
                    class="chrono-board__status"
                    :class="statusClass(dossier.results?.[phase.key]?.status)"
                  >
                    <i aria-hidden="true" />
                    {{ statusLabel(dossier.results?.[phase.key]?.status) }}
                  </span>
                </header>

                <template v-if="dossier.results?.[phase.key]">
                  <div class="chrono-board__podium">
                    <div class="chrono-board__rank">
                      <span class="chrono-board__rank-lbl">Puesto</span>
                      <strong class="chrono-board__rank-num">
                        <span class="hash" aria-hidden="true">#</span>{{ formatPositionNum(dossier.results[phase.key]) }}
                      </strong>
                    </div>
                    <div class="chrono-board__net">
                      <span class="chrono-board__net-lbl">Tiempo neto</span>
                      <strong class="chrono-board__net-val">{{ formatResult(dossier.results[phase.key]) }}</strong>
                      <span class="chrono-board__net-hint">Oficial · placa {{ padPlate(dossier.rider.plate_number) }}</span>
                    </div>
                  </div>

                  <ol class="chrono-track" aria-label="Salida a meta">
                    <li
                      class="chrono-track__node"
                      :class="{ on: !!dossier.results[phase.key].start_time }"
                    >
                      <span class="chrono-track__dot" aria-hidden="true" />
                      <span class="chrono-track__lbl">Salida</span>
                      <time class="chrono-track__time">{{ displayClock(dossier.results[phase.key].start_time) }}</time>
                    </li>
                    <li class="chrono-track__link" aria-hidden="true">
                      <span class="chrono-track__line" />
                      <span class="chrono-track__pulse" />
                    </li>
                    <li
                      class="chrono-track__node"
                      :class="{ on: !!dossier.results[phase.key].meta_time }"
                    >
                      <span class="chrono-track__dot chrono-track__dot--meta" aria-hidden="true" />
                      <span class="chrono-track__lbl">Meta</span>
                      <time class="chrono-track__time">{{ displayClock(dossier.results[phase.key].meta_time) }}</time>
                    </li>
                  </ol>

                  <ul class="chrono-facts">
                    <li>
                      <span>Categoría</span>
                      <strong>{{ dossier.results[phase.key].category_name || dossier.rider.category || '—' }}</strong>
                    </li>
                    <li v-if="dossier.results[phase.key].gap && dossier.results[phase.key].gap !== '—'">
                      <span>Diferencia</span>
                      <strong>{{ dossier.results[phase.key].gap }}</strong>
                    </li>
                    <li v-if="dossier.results[phase.key].duration_ms != null">
                      <span>Duración</span>
                      <strong>{{ formatMs(dossier.results[phase.key].duration_ms) }}</strong>
                    </li>
                  </ul>
                </template>

                <div v-else class="chrono-board__vacant">
                  <span class="chrono-board__vacant-mark" aria-hidden="true">—:—:—</span>
                  <p>Sin registro en esta fase todavía.</p>
                </div>
              </article>
            </div>
          </section>

          <!-- PHOTOS -->
          <section id="dossier-fotos" class="section">
            <div class="section__head anim" style="--i: 7">
              <div>
                <p class="section__kicker">Tu media</p>
                <h2>Tus fotos</h2>
              </div>
              <p class="ok">{{ dossier.photos?.length || 0 }} · preview · original</p>
            </div>

            <div v-if="!dossier.photos?.length" class="empty anim" style="--i: 8">
              <span class="empty__mark">∅</span>
              <p>Aún no hay fotos asociadas a tu placa.</p>
              <button type="button" class="empty__link" @click="scrollTo('dossier-busca')">
                Buscar en toda la galería →
              </button>
            </div>

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
                  <div class="shot__shade" aria-hidden="true" />
                  <div class="shot__overlay">
                    <strong>{{ shortName(photo.original_filename) }}</strong>
                    <span v-if="photo.photographer">{{ photo.photographer.full_name }}</span>
                  </div>
                </div>
                <a
                  :href="photo.download_url"
                  download
                  class="shot__dl"
                  @click.stop
                  title="Descargar original (máxima calidad)"
                >
                  ↓ Original
                </a>
              </figure>
            </div>
          </section>

          <!-- VIDEOS -->
          <section id="dossier-videos" class="section">
            <div class="section__head anim" style="--i: 15">
              <div>
                <p class="section__kicker">Tu media</p>
                <h2>Tus videos</h2>
              </div>
              <p>{{ dossier.videos?.length || 0 }} clip(s)</p>
            </div>

            <div v-if="!dossier.videos?.length" class="empty anim" style="--i: 16">
              <span class="empty__mark">∅</span>
              <p>Aún no hay videos asociados a tu placa.</p>
              <button type="button" class="empty__link" @click="scrollTo('dossier-busca')">
                Buscar videos de la edición →
              </button>
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
                  :class="[
                    reelOrient(video) === 'portrait'
                      ? 'reel__stage--portrait'
                      : 'reel__stage--landscape',
                  ]"
                >
                  <video
                    :src="mediaPublicUrl(video.preview_url)"
                    :poster="video.thumb_url ? mediaPublicUrl(video.thumb_url) : undefined"
                    controls
                    playsinline
                    preload="metadata"
                    :class="reelRotateClass(video)"
                    @loadedmetadata="onReelMeta($event, video)"
                  />
                </div>
                <div class="reel__bar">
                  <div class="reel__info">
                    <strong>{{ shortName(video.original_filename) }}</strong>
                    <div class="reel__tags">
                      <span class="tag">
                        {{
                          reelOrient(video) === 'portrait' ? 'Vertical' : 'Horizontal'
                        }}
                      </span>
                      <span v-if="!video.has_web_preview" class="tag tag--warn">Sin versión web</span>
                    </div>
                    <span class="reel__by">
                      <template v-if="video.photographer">
                        {{ video.photographer.full_name }}
                        <template v-if="video.photographer.instagram">
                          · @{{ video.photographer.instagram }}
                        </template>
                        ·
                      </template>
                      {{ formatBytes(video.size_bytes) }}
                    </span>
                    <p class="reel__hint">
                      Vista previa para el navegador.
                      Descarga el original para máxima calidad.
                    </p>
                  </div>
                  <div class="reel__actions">
                    <button
                      type="button"
                      class="reel__orient"
                      @click="toggleReelOrient(video)"
                    >
                      {{ reelOrient(video) === 'portrait' ? 'Ver horizontal' : 'Ver vertical' }}
                    </button>
                    <a :href="video.download_url" download class="reel__dl">Descargar original</a>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- BUSCA -->
          <section id="dossier-busca" class="section section--browse">
            <DossierMediaBrowser :dossier-token="dossierToken" />
          </section>
        </div>
      </template>

      <router-link class="back" to="/inicio">← Volver al inicio</router-link>
    </div>

    <!-- Splash unlock ceremony -->
    <Teleport to="body">
      <div v-if="ceremony" class="splash" aria-hidden="true">
        <div class="splash__bg" aria-hidden="true">
          <div class="splash__glow" />
          <div class="splash__grid" />
          <div class="splash__dust" />
        </div>
        <div ref="stripesEl" class="splash__stripes" aria-hidden="true" />
        <div ref="scanEl" class="splash__scan" aria-hidden="true" />
        <div ref="flashEl" class="splash__flash" aria-hidden="true" />

        <div class="splash__core">
          <p ref="brandEl" class="splash__brand">
            CHACAS <span class="x">X</span>TREME
          </p>
          <div ref="railEl" class="splash__rail" />
          <p ref="statusEl" class="splash__status">Acceso confirmado</p>
          <div ref="plateEl" class="splash__plate">
            <span class="sym">#</span><span class="digits">{{ ceremonyPlate }}</span>
          </div>
          <h2 ref="nameEl" class="splash__name">{{ ceremonyName }}</h2>
          <p ref="tagEl" class="splash__tag">Tu dossier · 4ª edición</p>
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
        <div class="lb__panel">
          <header class="lb__head">
            <span>{{ lightboxIndex + 1 }} / {{ dossier.photos.length }}</span>
            <button type="button" class="lb__x" @click="closeLightbox" aria-label="Cerrar">×</button>
          </header>
          <figure>
            <img
              :src="mediaPublicUrl(dossier.photos[lightboxIndex].preview_url)"
              :alt="dossier.photos[lightboxIndex].original_filename"
            />
          </figure>
          <div class="lb__foot">
            <span class="lb__hint">Original = máxima calidad</span>
            <a :href="dossier.photos[lightboxIndex].download_url" download class="lb__dl">
              Descargar original
            </a>
          </div>
          <div v-if="dossier.photos.length > 1" class="lb__navs">
            <button type="button" @click="prevPhoto" aria-label="Anterior">‹ Anterior</button>
            <button type="button" @click="nextPhoto" aria-label="Siguiente">Siguiente ›</button>
          </div>
        </div>
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
/** @type {import('vue').Ref<Record<number|string, 'portrait'|'landscape'>>} */
const videoMeasured = ref({});
/** @type {import('vue').Ref<Record<number|string, boolean>>} */
const videoOrientManual = ref({});

/** Prefer measured pixels; API orientation only for originals without web preview. */
function reelOrient(video) {
  const id = video?.id;
  if (videoOrient.value[id]) return videoOrient.value[id];
  if (video?.has_web_preview) return 'landscape';
  if (video?.orientation === 'portrait') return 'portrait';
  return 'landscape';
}

function reelRotateClass(video) {
  const id = video?.id;
  if (!videoOrientManual.value[id]) return '';
  const shown = videoOrient.value[id];
  const measured = videoMeasured.value[id];
  if (shown && measured && shown !== measured) return 'reel__video--rotate';
  return '';
}

function toggleReelOrient(video) {
  const id = video?.id;
  if (!id) return;
  const current = reelOrient(video);
  const next = current === 'portrait' ? 'landscape' : 'portrait';
  videoOrientManual.value = { ...videoOrientManual.value, [id]: true };
  videoOrient.value = { ...videoOrient.value, [id]: next };
}

function onReelMeta(e, video) {
  const el = e?.target;
  const w = Number(el?.videoWidth) || 0;
  const h = Number(el?.videoHeight) || 0;
  const videoId = video?.id;
  // Web preview is already upright — trust pixel box. Original may need metadata.
  let orient = h > w ? 'portrait' : 'landscape';
  videoMeasured.value = { ...videoMeasured.value, [videoId]: orient };
  if (videoOrientManual.value[videoId]) return;
  if (!video?.has_web_preview && (video?.orientation === 'portrait' || video?.orientation === 'landscape')) {
    orient = video.orientation;
  }
  videoOrient.value = {
    ...videoOrient.value,
    [videoId]: orient,
  };
}

const stripesEl = ref(null);
const scanEl = ref(null);
const flashEl = ref(null);
const brandEl = ref(null);
const railEl = ref(null);
const statusEl = ref(null);
const plateEl = ref(null);
const nameEl = ref(null);
const tagEl = ref(null);

function splashNodes() {
  return [
    stripesEl.value,
    scanEl.value,
    flashEl.value,
    brandEl.value,
    railEl.value,
    statusEl.value,
    plateEl.value,
    nameEl.value,
    tagEl.value,
  ].filter(Boolean);
}

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

function scrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function playUnlockSplash(rider) {
  ceremonyPlate.value = padPlate(rider?.plate_number);
  ceremonyName.value = rider?.full_name || 'Competidor';
  ceremony.value = true;
  await nextTick();

  const stripes = stripesEl.value;
  const scan = scanEl.value;
  const flash = flashEl.value;
  const brand = brandEl.value;
  const rail = railEl.value;
  const status = statusEl.value;
  const plateNode = plateEl.value;
  const nameNode = nameEl.value;
  const tag = tagEl.value;

  if (!stripes || !plateNode || !nameNode) {
    ceremony.value = false;
    return;
  }

  return new Promise((resolve) => {
    gsap.set(stripes, { xPercent: -110, opacity: 1 });
    gsap.set(scan, { yPercent: -120, opacity: 0 });
    gsap.set(flash, { opacity: 0 });
    gsap.set(brand, { y: 18, opacity: 0, letterSpacing: '0.55em' });
    gsap.set(rail, { scaleX: 0, opacity: 1 });
    gsap.set(status, { y: 14, opacity: 0 });
    gsap.set(plateNode, { y: 40, opacity: 0, scale: 1.18, filter: 'blur(10px)' });
    gsap.set(nameNode, { y: 28, opacity: 0, clipPath: 'inset(0 0 100% 0)' });
    gsap.set(tag, { y: 12, opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        ceremony.value = false;
        resolve();
      },
    });

    // Barrido de hazard / meta
    tl.to(stripes, { xPercent: 110, duration: 0.7, ease: 'power4.inOut' }, 0)
      .to(scan, { opacity: 0.85, duration: 0.12 }, 0.08)
      .to(scan, { yPercent: 120, duration: 0.55, ease: 'power2.inOut' }, 0.1)
      .to(scan, { opacity: 0, duration: 0.2 }, 0.55)

      // Brand + confirmación
      .to(brand, {
        y: 0,
        opacity: 1,
        letterSpacing: '0.28em',
        duration: 0.55,
        ease: 'power2.out',
      }, 0.22)
      .to(rail, { scaleX: 1, duration: 0.45, ease: 'power2.out' }, 0.38)
      .to(status, { y: 0, opacity: 1, duration: 0.35 }, 0.42)

      // Placa: impacto
      .to(plateNode, {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'power4.out',
      }, 0.48)
      .fromTo(
        plateNode.querySelector('.digits'),
        { letterSpacing: '0.22em' },
        { letterSpacing: '0.04em', duration: 0.55, ease: 'power2.out' },
        0.5
      )

      // Nombre + tag
      .to(nameNode, {
        y: 0,
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.55,
        ease: 'power3.out',
      }, 0.72)
      .to(tag, { y: 0, opacity: 1, duration: 0.35 }, 0.9)

      // Pulso corto
      .to(plateNode, { scale: 1.045, duration: 0.22, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.15)

      // Salida cinematográfica
      .to(flash, { opacity: 0.55, duration: 0.12, ease: 'power1.out' }, 1.65)
      .to(flash, { opacity: 0, duration: 0.35 }, 1.78)
      .to(rail, { opacity: 0, duration: 0.3 }, 1.7)
      .to(
        [brand, status, plateNode, nameNode, tag],
        {
          opacity: 0,
          y: -28,
          scale: 1.06,
          duration: 0.45,
          stagger: 0.028,
          ease: 'power2.in',
        },
        1.7
      );
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
  gsap.killTweensOf(splashNodes());
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
  gsap.killTweensOf(splashNodes());
});
</script>

<style scoped>
.dossier-page {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --stagger: 55ms;
  --cx-orange: var(--primary-color, #ff5e00);
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  min-height: 100dvh;
  background: #050505;
  color: #fff;
  padding: clamp(1.1rem, 3.5vw, 2.4rem) max(1rem, var(--container-px, 1rem)) calc(3rem + env(safe-area-inset-bottom, 0));
  font-family: var(--font-main);
  overflow-x: hidden;
}

.dossier-page__glow {
  position: absolute;
  inset: -20% -10% auto;
  height: 55vh;
  background:
    radial-gradient(ellipse 70% 55% at 15% 10%, rgba(255, 94, 0, 0.22), transparent 60%),
    radial-gradient(ellipse 50% 40% at 90% 0%, rgba(255, 140, 0, 0.1), transparent 55%);
  pointer-events: none;
  z-index: 0;
}

.dossier-page__grain {
  position: absolute;
  inset: 0;
  opacity: 0.035;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.dossier-shell {
  position: relative;
  z-index: 1;
  width: min(920px, 100%);
  margin: 0 auto;
}

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

@keyframes enter-up {
  from { opacity: 0; transform: translateY(18px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.kicker {
  margin: 0;
  color: var(--cx-orange);
  font-family: var(--font-accent);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* —— Gate —— */
.gate {
  padding: clamp(1.25rem, 5vh, 2.5rem) 0 1rem;
}

.gate h1 {
  margin: 0.45rem 0 0.7rem;
  font-family: var(--font-podium);
  font-size: clamp(3.1rem, 14vw, 5.2rem);
  letter-spacing: 0.03em;
  line-height: 0.9;
}

.gate .accent { color: var(--cx-orange); }

.lede {
  margin: 0;
  max-width: 28rem;
  color: rgba(255, 255, 255, 0.58);
  font-size: 1.02rem;
  line-height: 1.5;
}

.gate-form {
  width: min(440px, 100%);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 1.35rem;
  padding: 1.2rem 1.1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(18, 18, 18, 0.95), rgba(8, 8, 8, 0.98));
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
}

.gate-form--status {
  color: rgba(255, 255, 255, 0.65);
}

.gate-form__top {
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.gate-form__label {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cx-orange);
}

.gate-form__hint {
  margin: 0.35rem 0 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.82rem;
  line-height: 1.4;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.48);
}

input {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: #080808;
  color: #fff;
  border-radius: 10px;
  min-height: 48px;
  padding: 0.85rem 0.95rem;
  font-size: 1rem;
  font-family: var(--font-accent);
  -webkit-appearance: none;
  appearance: none;
}

input:focus {
  outline: none;
  border-color: rgba(255, 94, 0, 0.7);
  box-shadow: 0 0 0 3px rgba(255, 94, 0, 0.14);
}

.btn-primary {
  margin-top: 0.2rem;
  border: none;
  border-radius: 12px;
  min-height: 50px;
  background: linear-gradient(135deg, #ff5e00, #ff8c00);
  color: #111;
  font-family: var(--font-accent);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.95rem;
  cursor: pointer;
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

/* —— Dossier chrome —— */
.topbar {
  position: sticky;
  top: 0;
  z-index: 8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin: -0.35rem 0 1.1rem;
  padding: 0.65rem 0;
  background: linear-gradient(180deg, #050505 65%, rgba(5, 5, 5, 0));
}

.topbar__sub {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.42);
}

.ghost {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  min-height: 40px;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.hero {
  display: grid;
  gap: 1.1rem;
  padding: 1.1rem 0 1.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.hero__plate {
  width: fit-content;
  min-width: 7.2rem;
  padding: 0.9rem 1.05rem 0.8rem;
  border: 2px solid var(--cx-orange);
  border-radius: 10px;
  text-align: center;
  background: rgba(255, 94, 0, 0.06);
  box-shadow: 8px 8px 0 rgba(255, 94, 0, 0.22);
}

.hero__plate-lbl {
  display: block;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.hero__plate-num {
  display: block;
  margin-top: 0.15rem;
  font-family: var(--font-podium);
  font-size: clamp(2.6rem, 12vw, 3.6rem);
  line-height: 0.9;
  letter-spacing: 0.04em;
  color: var(--cx-orange);
}

.hero__pilot {
  display: flex;
  gap: 0.95rem;
  align-items: center;
}

.hero__photo {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 94, 0, 0.55);
  flex-shrink: 0;
}

.hero__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero__text h1 {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(1.7rem, 6.5vw, 2.55rem);
  letter-spacing: 0.03em;
  line-height: 1;
}

.nick {
  margin: 0.4rem 0 0;
  color: var(--secondary-color, #fbbf24);
  font-family: var(--font-accent);
  font-style: italic;
  font-size: 0.92rem;
}

.hero__meta {
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.88rem;
  line-height: 1.35;
}

.dot {
  margin: 0 0.35rem;
  opacity: 0.5;
}

.jump {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  margin: 1.1rem 0 0.25rem;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.jump::-webkit-scrollbar { display: none; }

.jump a {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 40px;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: #0d0d0d;
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
  font-family: var(--font-accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.jump em {
  font-style: normal;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  background: rgba(255, 94, 0, 0.18);
  color: #fdba74;
  font-size: 0.65rem;
}

.thanks {
  margin-top: 1.35rem;
  padding: 1.05rem 1.05rem 1.1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 94, 0, 0.22);
  background:
    linear-gradient(135deg, rgba(255, 94, 0, 0.1), transparent 55%),
    #0a0a0a;
}

.thanks__kicker {
  margin: 0 0 0.35rem;
  font-family: var(--font-accent);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cx-orange);
}

.thanks h2 {
  margin: 0 0 0.4rem;
  font-family: var(--font-podium);
  font-size: clamp(1.2rem, 4vw, 1.55rem);
  letter-spacing: 0.03em;
}

.thanks p {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.55;
  font-size: 0.95rem;
}

.section {
  margin-top: clamp(2rem, 5vw, 2.85rem);
  scroll-margin-top: 4.5rem;
}

.section__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.section__kicker {
  margin: 0 0 0.25rem;
  font-family: var(--font-accent);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cx-orange);
}

.section__head h2 {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(1.55rem, 5vw, 2.1rem);
  letter-spacing: 0.04em;
}

.section__head p {
  margin: 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.8rem;
}

.section__head .ok { color: #6ee7b7; }

.timing {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 760px) {
  .hero {
    grid-template-columns: auto 1fr;
    align-items: center;
  }

  .timing {
    grid-template-columns: 1fr 1fr;
    gap: 1.1rem;
  }
}

.chrono-board {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 1.15rem 1.05rem 1.2rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #080808;
}

.chrono-board--final {
  border-color: rgba(255, 94, 0, 0.45);
}

.chrono-board__glow {
  position: absolute;
  inset: -30% -20% auto;
  height: 70%;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(ellipse at 20% 0%, rgba(255, 94, 0, 0.18), transparent 60%);
  opacity: 0.85;
}

.chrono-board--class .chrono-board__glow {
  background: radial-gradient(ellipse at 80% 0%, rgba(255, 255, 255, 0.08), transparent 55%);
}

.chrono-board__grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.07;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.45) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: linear-gradient(180deg, #000 0%, transparent 75%);
}

.chrono-board__head,
.chrono-board__podium,
.chrono-track,
.chrono-facts,
.chrono-board__vacant {
  position: relative;
  z-index: 1;
}

.chrono-board__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
}

.chrono-board__phase {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  min-width: 0;
}

.chrono-board__idx {
  flex: 0 0 auto;
  font-family: var(--font-podium);
  font-size: 1.65rem;
  letter-spacing: 0.04em;
  line-height: 1;
  color: rgba(255, 255, 255, 0.18);
}

.chrono-board__phase h3 {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(1.25rem, 4.5vw, 1.45rem);
  letter-spacing: 0.04em;
  line-height: 1;
}

.chrono-board__phase p {
  margin: 0.28rem 0 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.78rem;
}

.chrono-board__status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex: 0 0 auto;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.35);
  font-family: var(--font-accent);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.chrono-board__status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.chrono-board__status.ok { color: #6ee7b7; border-color: rgba(110, 231, 183, 0.4); }
.chrono-board__status.live { color: #fbbf24; border-color: rgba(251, 191, 36, 0.4); }
.chrono-board__status.bad { color: #fda4af; border-color: rgba(225, 29, 72, 0.4); }
.chrono-board__status.muted { color: rgba(255, 255, 255, 0.45); }

.chrono-board__podium {
  display: grid;
  grid-template-columns: minmax(4.8rem, 0.9fr) minmax(0, 1.4fr);
  gap: 0.55rem;
  align-items: stretch;
  margin-bottom: 1rem;
}

.chrono-board__rank {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 0.7rem 0.55rem 0.65rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 94, 0, 0.45);
  background:
    linear-gradient(160deg, rgba(255, 94, 0, 0.18), transparent 60%),
    #0c0c0c;
  box-shadow: 0 0 0 1px rgba(255, 94, 0, 0.08), 4px 4px 0 rgba(255, 94, 0, 0.16);
  text-align: center;
}

.chrono-board__rank-lbl {
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.chrono-board__rank-num {
  display: block;
  margin-top: 0.15rem;
  font-family: var(--font-podium);
  font-size: clamp(1.85rem, 8vw, 2.75rem);
  line-height: 0.9;
  letter-spacing: 0.02em;
  color: var(--cx-orange);
}

.chrono-board__rank-num .hash {
  font-family: var(--font-symbols);
  opacity: 0.55;
  margin-right: 0.02em;
  font-size: 0.72em;
}

.chrono-board__net {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 0.7rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent),
    #050505;
}

.chrono-board__net-lbl {
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
}

.chrono-board__net-val {
  display: block;
  margin-top: 0.25rem;
  font-family: var(--font-symbols);
  font-variant-numeric: tabular-nums;
  font-size: clamp(1.15rem, 5vw, 1.85rem);
  line-height: 1.05;
  letter-spacing: 0.03em;
  color: #fff;
  text-shadow: 0 0 24px rgba(255, 94, 0, 0.25);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chrono-board__net-hint {
  margin-top: 0.3rem;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.35);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chrono-track {
  list-style: none;
  margin: 0;
  padding: 0.85rem 0.75rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px minmax(0, 1fr);
  gap: 0.25rem 0.35rem;
  align-items: start;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.45);
}

.chrono-track__node {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  opacity: 0.32;
  min-width: 0;
}

.chrono-track__node:last-child {
  text-align: right;
  align-items: flex-end;
}

.chrono-track__node.on {
  opacity: 1;
}

.chrono-track__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  background: transparent;
  flex-shrink: 0;
}

.chrono-track__node.on .chrono-track__dot {
  border-color: var(--cx-orange);
  background: var(--cx-orange);
  box-shadow: 0 0 12px rgba(255, 94, 0, 0.55);
}

.chrono-track__node.on .chrono-track__dot--meta {
  border-color: var(--secondary-color, #fbbf24);
  background: var(--secondary-color, #fbbf24);
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.45);
}

.chrono-track__lbl {
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
}

.chrono-track__time {
  font-family: var(--font-symbols);
  font-variant-numeric: tabular-nums;
  font-size: clamp(0.95rem, 3.6vw, 1.15rem);
  letter-spacing: 0.02em;
  color: #fff;
  white-space: nowrap;
}

.chrono-track__link {
  position: relative;
  align-self: center;
  height: 2px;
  min-height: 2px;
  display: grid;
  place-items: center;
  margin-top: 0.2rem;
}

.chrono-track__line {
  display: block;
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--cx-orange), var(--secondary-color, #fbbf24));
  opacity: 0.65;
}

.chrono-track__pulse {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.65);
  animation: chrono-pulse 1.8s var(--ease-out) infinite;
}

@keyframes chrono-pulse {
  0% { transform: translateX(-12px); opacity: 0; }
  25% { opacity: 1; }
  100% { transform: translateX(12px); opacity: 0; }
}

.chrono-facts {
  list-style: none;
  margin: 0.95rem 0 0;
  padding: 0.85rem 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.chrono-facts li {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.chrono-facts span {
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
}

.chrono-facts strong {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chrono-board__vacant {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.45rem;
  padding: 1.35rem 0.85rem 0.85rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.12);
}

.chrono-board__vacant-mark {
  font-family: var(--font-symbols);
  font-size: 1.8rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.18);
}

.chrono-board__vacant p {
  margin: 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.9rem;
}

@media (max-width: 420px) {
  .chrono-board__rank {
    box-shadow: 3px 3px 0 rgba(255, 94, 0, 0.16);
    padding: 0.6rem 0.4rem 0.55rem;
  }

  .chrono-board__net {
    padding: 0.6rem 0.65rem;
  }

  .chrono-board__net-hint {
    display: none;
  }

  .chrono-track {
    padding: 0.75rem 0.65rem;
    grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr);
  }

  .chrono-track__time {
    font-size: 0.92rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chrono-track__pulse {
    animation: none !important;
    opacity: 0.5;
  }
}

.empty {
  margin: 0;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.92rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.45rem;
  padding: 1.35rem 1.1rem;
  border-radius: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: #0a0a0a;
}

.empty__mark {
  font-family: var(--font-podium);
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.25);
}

.empty__link {
  border: none;
  background: transparent;
  color: var(--cx-orange);
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  padding: 0;
  cursor: pointer;
}

/* —— Gallery —— */
.gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

@media (min-width: 720px) {
  .gallery { grid-template-columns: repeat(3, 1fr); gap: 0.85rem; }
}

.shot {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  cursor: zoom-in;
}

.shot__media {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 12px;
  background: #0a0a0a;
}

.shot__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 280ms var(--ease-out);
}

.shot:active .shot__media img,
.shot:hover .shot__media img {
  transform: scale(1.04);
}

.shot__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, 0.78));
  pointer-events: none;
}

.shot__overlay {
  position: absolute;
  left: 0.6rem;
  right: 0.6rem;
  bottom: 0.6rem;
  z-index: 1;
}

.shot__overlay strong,
.shot__overlay span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shot__overlay strong {
  font-size: 0.78rem;
}

.shot__overlay span {
  margin-top: 0.12rem;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.65);
}

.shot__dl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255, 94, 0, 0.4);
  color: #ffb48a;
  text-decoration: none;
  font-family: var(--font-accent);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* —— Videos —— */
.reels {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reel {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: #090909;
  overflow: hidden;
}

.reel__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  min-height: 200px;
}

.reel__stage--landscape video {
  width: 100%;
  height: auto;
  max-height: min(48vh, 420px);
  display: block;
  object-fit: contain;
  background: #000;
}

.reel__stage--portrait video {
  width: auto;
  max-width: min(100%, 360px);
  height: min(68vh, 540px);
  max-height: min(68vh, 540px);
  display: block;
  object-fit: contain;
  background: #000;
  margin: 0 auto;
}

.reel__bar {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.95rem 1rem 1.05rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.reel__info strong {
  display: block;
  font-size: 0.95rem;
}

.reel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.4rem;
}

.tag {
  display: inline-flex;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: rgba(255, 94, 0, 0.16);
  color: #fdba74;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tag--warn {
  background: rgba(250, 204, 21, 0.14);
  color: #fde68a;
}

.reel__by {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}

.reel__hint {
  margin: 0.55rem 0 0;
  font-size: 0.72rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.42);
}

.reel__actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.reel__orient {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-accent);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.reel__dl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff5e00, #ff8c00);
  color: #111;
  text-decoration: none;
  font-family: var(--font-accent);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.reel__video--rotate {
  transform: rotate(-90deg);
  max-height: min(52vh, 420px);
  width: auto;
}

.section--browse {
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.back {
  display: inline-block;
  margin-top: 1.75rem;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.88rem;
  text-decoration: none;
}

.back:hover { color: var(--cx-orange); }

/* —— Splash unlock ceremony —— */
.splash {
  --splash-orange: var(--cx-orange, #ff5e00);
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: grid;
  place-items: center;
  background: #030303;
  overflow: hidden;
  pointer-events: none;
}

.splash__bg {
  position: absolute;
  inset: 0;
}

.splash__glow {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(ellipse 55% 40% at 50% 42%, rgba(255, 94, 0, 0.28), transparent 62%),
    radial-gradient(ellipse 80% 55% at 50% 100%, rgba(255, 94, 0, 0.12), transparent 55%),
    linear-gradient(180deg, #0a0a0a 0%, #050505 45%, #000 100%);
}

.splash__grid {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%);
  transform: perspective(600px) rotateX(58deg) translateY(-8%);
  transform-origin: center 70%;
}

.splash__dust {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 12% 28%, rgba(255, 255, 255, 0.35), transparent),
    radial-gradient(1px 1px at 78% 22%, rgba(255, 94, 0, 0.55), transparent),
    radial-gradient(1.5px 1.5px at 64% 68%, rgba(255, 255, 255, 0.25), transparent),
    radial-gradient(1px 1px at 30% 74%, rgba(255, 94, 0, 0.4), transparent),
    radial-gradient(1px 1px at 88% 58%, rgba(255, 255, 255, 0.2), transparent);
  animation: splash-dust 4.5s linear infinite;
  opacity: 0.7;
}

.splash__stripes {
  position: absolute;
  top: -20%;
  left: 0;
  z-index: 2;
  width: 42vw;
  min-width: 160px;
  height: 140%;
  background: repeating-linear-gradient(
    -18deg,
    #ff5e00 0 14px,
    #111 14px 28px
  );
  opacity: 0.92;
  filter: saturate(1.15);
  mix-blend-mode: screen;
}

.splash__scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 3;
  height: 18%;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(255, 94, 0, 0.15) 40%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 94, 0, 0.15) 60%,
    transparent
  );
  pointer-events: none;
}

.splash__flash {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.55), rgba(255, 94, 0, 0.25) 40%, transparent 70%);
  pointer-events: none;
}

.splash__core {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.25rem 1.1rem;
  max-width: min(94vw, 720px);
}

.splash__brand {
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(0.72rem, 2.6vw, 0.95rem);
  font-weight: 900;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.88);
}

.splash__brand .x {
  color: var(--splash-orange);
}

.splash__rail {
  width: min(42vw, 160px);
  height: 2px;
  margin: 0.85rem 0 0.7rem;
  transform-origin: center;
  background: linear-gradient(90deg, transparent, var(--splash-orange), transparent);
}

.splash__status {
  margin: 0 0 0.85rem;
  font-family: var(--font-accent);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--splash-orange);
}

.splash__plate {
  position: relative;
  margin: 0;
  font-family: var(--font-podium);
  font-size: clamp(5rem, 22vw, 8.5rem);
  letter-spacing: 0.04em;
  line-height: 0.88;
  color: #fff;
  text-shadow:
    0 0 24px rgba(255, 94, 0, 0.45),
    0 0 64px rgba(255, 94, 0, 0.25);
  will-change: transform, opacity, filter;
}

.splash__plate .sym {
  font-family: var(--font-accent), 'Poppins', system-ui, sans-serif;
  color: var(--splash-orange);
  margin-right: 0.04em;
}

.splash__plate .digits {
  display: inline-block;
}

.splash__name {
  position: relative;
  margin: 1rem 0 0;
  max-width: 18ch;
  font-family: var(--font-accent);
  font-size: clamp(1.35rem, 5.2vw, 2.15rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.12;
  color: #fff;
  text-wrap: balance;
}

.splash__tag {
  margin: 0.85rem 0 0;
  font-family: var(--font-accent);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
}

@keyframes splash-dust {
  from { transform: translate3d(0, 8px, 0); }
  to { transform: translate3d(0, -18px, 0); }
}

@media (max-width: 480px) {
  .splash__stripes {
    width: 58vw;
  }

  .splash__name {
    max-width: 16ch;
  }
}

/* —— Lightbox —— */
.lb {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(8px);
}

.lb__panel {
  width: min(100%, 720px);
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem 1rem calc(1rem + env(safe-area-inset-bottom, 0));
  border-radius: 18px 18px 0 0;
  background: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.lb__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.82rem;
}

.lb__x {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  background: #141414;
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
}

.lb figure {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.lb img {
  width: 100%;
  max-height: min(62vh, 640px);
  object-fit: contain;
  display: block;
}

.lb__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.82rem;
}

.lb__hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.35;
  max-width: 16rem;
}

.lb__dl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff5e00, #ff8c00);
  color: #111;
  text-decoration: none;
  font-family: var(--font-accent);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.lb__navs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.lb__navs button {
  min-height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: transparent;
  color: #fff;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
}

@media (min-width: 760px) {
  .lb {
    align-items: center;
    padding: 1.5rem;
  }

  .lb__panel {
    border-radius: 16px;
    padding: 1rem 1.15rem 1.15rem;
  }

  .reel__bar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .reel__dl {
    flex: 0 0 auto;
    padding-inline: 1.1rem;
  }
}

@media (max-width: 640px) {
  .splits {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .splits__rail {
    width: 2px;
    height: 18px;
    margin-left: 0.15rem;
    background: linear-gradient(180deg, var(--cx-orange), var(--secondary-color, #fbbf24));
  }
}

@media (prefers-reduced-motion: reduce) {
  .anim {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }

  .splash,
  .shot__media img,
  .btn-primary {
    animation: none !important;
    transition: none !important;
  }

  .splash { display: none !important; }
}
</style>
