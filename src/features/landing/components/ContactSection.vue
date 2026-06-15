<script setup>
import { Mail, Phone, ArrowUpRight, Copy } from 'lucide-vue-next';
import mankaLogo from '@/assets/images/logo.webp';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const copied = ref(false);

const copyEmail = () => {
  navigator.clipboard.writeText('chacasextremerace@gmail.com');
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};
</script>

<template>
  <section class="contact" id="contacto">
    <div class="container">
      <div class="contact__card">
        <!-- HUD corner brackets on the contact card -->
        <div class="hud-bracket top-left"></div>
        <div class="hud-bracket top-right"></div>
        <div class="hud-bracket bottom-left"></div>
        <div class="hud-bracket bottom-right"></div>

        <div class="contact__grid">
          <!-- Left: Modern UX & Content -->
          <div class="contact__info entry-anim entry-anim--left" style="--stagger: 0s">
            <header class="info__header">
              <div class="badge-row">
                <span class="info__badge font-inter">{{ t('contact.badge') }}</span>
                <div class="badge-line"></div>
              </div>
              <h2 class="info__title font-podium">
                {{ t('contact.title_prefix') }} <span class="gradient-text">{{ t('contact.title_highlight') }}</span>
              </h2>
              <p class="info__description font-inter">
                {{ t('contact.description') }}
              </p>
            </header>
            
            <div class="contact__actions">
              <!-- Email Card with Copy Feature -->
              <div class="action-card" @click="copyEmail">
                <div class="action-card__icon">
                  <Mail :size="20" />
                </div>
                <div class="action-card__text">
                  <span class="font-inter">{{ t('contact.email_label') }}</span>
                  <strong class="font-inter">chacasextremerace@gmail.com</strong>
                </div>
                <div class="action-card__tool font-inter" :class="{ 'is-copied': copied }">
                  <Copy v-if="!copied" :size="14" />
                  <span v-else>{{ t('contact.copied') }}</span>
                </div>
              </div>

              <!-- WhatsApp Card -->
              <a href="https://wa.me/51983426996" target="_blank" class="action-card">
                <div class="action-card__icon action-card--whatsapp">
                  <Phone :size="20" />
                </div>
                <div class="action-card__text">
                  <span class="font-inter">{{ t('contact.whatsapp_label') }}</span>
                  <strong class="font-inter">+51 983 426 996</strong>
                </div>
                <div class="action-card__tool">
                  <ArrowUpRight :size="16" />
                </div>
              </a>
            </div>
          </div>

          <!-- Right: Concentric Technical Rotating Ring & Logo -->
          <div class="contact__visual entry-anim entry-anim--right" style="--stagger: 0.15s">
            <div class="visual__logo-container">
              <!-- A single, clean technical indicator ring -->
              <div class="logo-orbit-ring">
                <div class="ring-tick tick-1"></div>
                <div class="ring-tick tick-2"></div>
                <div class="ring-tick tick-3"></div>
                <div class="ring-tick tick-4"></div>
              </div>
              <div class="logo-frame">
                <img :src="mankaLogo" alt="Manka Riders - Club organizador de Chacas Xtreme Race competencia de ciclismo de montaña" class="logo-img" loading="lazy" />
              </div>
              <div class="logo-glow"></div>
            </div>
            <!-- Technical specs metadata inside the visualization -->
            <div class="visual__metadata font-inter">
              <span>SYS.LOC // 3359.MSNM</span>
              <span>EST.2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: var(--section-py) 0;
  background: var(--bg-color);
  position: relative;
}

.contact__card {
  background: var(--surface-color);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: clamp(1.75rem, 5vw, 4rem);
  position: relative;
  overflow: hidden;
}

.contact__grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}

/* HUD corner decoration brackets */
.hud-bracket {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
}
.hud-bracket.top-left { top: 20px; left: 20px; border-right: none; border-bottom: none; }
.hud-bracket.top-right { top: 20px; right: 20px; border-left: none; border-bottom: none; }
.hud-bracket.bottom-left { bottom: 20px; left: 20px; border-right: none; border-top: none; }
.hud-bracket.bottom-right { bottom: 20px; right: 20px; border-left: none; border-top: none; }

/* INFO SIDE */
.badge-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info__badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: 3px;
  text-transform: uppercase;
}

.badge-line {
  flex-grow: 1;
  height: 1px;
  background: rgba(255, 94, 0, 0.2);
}

.info__title {
  font-size: clamp(1.75rem, 4.5vw, 3.5rem);
  font-weight: 900;
  color: white;
  line-height: 0.95;
  margin-bottom: 1.5rem;
  letter-spacing: -2px;
}

.gradient-text {
  background: var(--accent-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.info__description {
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 500px;
}

/* CARDS */
.contact__actions {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  transition: var(--transition-smooth);
  cursor: pointer;
}

.action-card:hover {
  background: rgba(255, 94, 0, 0.02);
  border-color: rgba(255, 94, 0, 0.3);
}

.action-card__icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: var(--transition-smooth);
}

.action-card:hover .action-card__icon {
  background: rgba(255, 94, 0, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-card--whatsapp {
  border-color: rgba(255, 255, 255, 0.05);
}

.action-card__text {
  flex-grow: 1;
}

.action-card__text span {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}

.action-card__text strong {
  color: white;
  font-size: clamp(0.88rem, 3vw, 1.1rem);
  font-weight: 500;
  letter-spacing: -0.2px;
  overflow-wrap: anywhere;
  word-break: normal;
}

.action-card__tool {
  width: 38px;
  height: 38px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  transition: var(--transition-smooth);
}

.action-card:hover .action-card__tool {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: black;
}

.action-card__tool.is-copied {
  width: auto;
  padding: 0 1.2rem;
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: black;
}

.action-card__tool.is-copied span {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 1.5px;
}

/* VISUAL SIDE - CIRCULAR LOGO WITH TECHNICAL ORBIT RING */
.contact__visual {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.visual__logo-container {
  position: relative;
  width: clamp(220px, 55vw, 320px);
  height: clamp(220px, 55vw, 320px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-frame {
  width: clamp(170px, 42vw, 250px);
  height: clamp(170px, 42vw, 250px);
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #000;
  z-index: 5;
  animation: floating 6s ease-in-out infinite;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.05);
}

/* Fine technical alignment ring */
.logo-orbit-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 94, 0, 0.25);
  border-radius: 50%;
  z-index: 2;
  animation: rotate-ring 24s linear infinite;
  will-change: transform;
}

.ring-tick {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1px solid var(--primary-color);
  background: #000;
  border-radius: 50%;
}

.ring-tick.tick-1 { top: -3px; left: 50%; transform: translateX(-50%); }
.ring-tick.tick-2 { bottom: -3px; left: 50%; transform: translateX(-50%); }
.ring-tick.tick-3 { left: -3px; top: 50%; transform: translateY(-50%); }
.ring-tick.tick-4 { right: -3px; top: 50%; transform: translateY(-50%); }

.logo-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(255, 94, 0, 0.06) 0%, transparent 70%);
  filter: blur(20px);
  z-index: 1;
  pointer-events: none;
}

.visual__metadata {
  display: flex;
  justify-content: space-between;
  width: 250px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.25);
}

@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes rotate-ring {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 992px) {
  .contact__grid {
    grid-template-columns: 1fr;
    gap: clamp(2.5rem, 6vw, 3.5rem);
  }

  .info__description {
    max-width: 100%;
  }

  .contact__info {
    text-align: center;
  }

  .badge-row {
    justify-content: center;
  }

  .contact__visual {
    margin-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .action-card {
    padding: 1.1rem 1.25rem;
    gap: 1rem;
  }

  .action-card__icon {
    width: 42px;
    height: 42px;
  }

  .visual__metadata {
    width: clamp(170px, 42vw, 250px);
    font-size: 0.55rem;
  }
}

@media (max-width: 480px) {
  .action-card {
    flex-direction: row;
    text-align: left;
    align-items: center;
  }

  .action-card__tool {
    display: flex;
    flex-shrink: 0;
  }

  .info__description {
    font-size: 0.92rem;
  }
}
</style>
