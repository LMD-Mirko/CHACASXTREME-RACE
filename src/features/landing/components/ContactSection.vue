<script setup>
import { Mail, Phone, Instagram, Facebook, ArrowUpRight, Copy, Send } from 'lucide-vue-next';
import mankaLogo from '@/assets/images/logo.jpg';
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
  <section class="contact reveal" id="contacto">
    <div class="container">
      <div class="contact__card">
        <div class="contact__grid">
          <!-- Left: Modern UX & Content -->
          <div class="contact__info">
            <header class="info__header">
              <span class="info__badge">{{ t('contact.badge') }}</span>
              <h2 class="info__title">
                {{ t('contact.title_prefix') }} <span class="gradient-text">{{ t('contact.title_highlight') }}</span>
              </h2>
              <p class="info__description">
                {{ t('contact.description') }}
              </p>
            </header>
            
            <div class="contact__actions">
              <!-- Email Card with Copy Feature -->
              <div class="action-card" @click="copyEmail">
                <div class="action-card__icon">
                  <Mail :size="22" />
                </div>
                <div class="action-card__text">
                  <span>{{ t('contact.email_label') }}</span>
                  <strong>chacasextremerace@gmail.com</strong>
                </div>
                <div class="action-card__tool" :class="{ 'is-copied': copied }">
                  <Copy v-if="!copied" :size="16" />
                  <span v-else>{{ t('contact.copied') }}</span>
                </div>
              </div>

              <!-- WhatsApp Card -->
              <a href="https://wa.me/51983426996" target="_blank" class="action-card">
                <div class="action-card__icon action-card--whatsapp">
                  <Phone :size="22" />
                </div>
                <div class="action-card__text">
                  <span>{{ t('contact.whatsapp_label') }}</span>
                  <strong>+51 983 426 996</strong>
                </div>
                <div class="action-card__tool">
                  <ArrowUpRight :size="18" />
                </div>
              </a>
            </div>
          </div>

          <!-- Right: Circular Floating Logo (The "Classic" look combined with modern tech) -->
          <div class="contact__visual">
            <div class="visual__logo-container">
              <div class="logo-orbit logo-orbit--1"></div>
              <div class="logo-orbit logo-orbit--2"></div>
              <div class="logo-frame">
                <img :src="mankaLogo" alt="Manka Riders Logo" class="logo-img" />
              </div>
              <div class="logo-glow"></div>
            </div>
            <!-- Background dot pattern inside the card -->
            <div class="visual__dots"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: 10rem 0;
  background: var(--bg-color);
}

.contact__card {
  background: var(--surface-color);
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4rem 5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 50px 100px rgba(0,0,0,0.5);
}

.contact__grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 6rem;
  align-items: center;
}

/* INFO SIDE */
.info__badge {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background: rgba(255, 94, 0, 0.1);
  color: var(--primary-color);
  border-radius: 100px;
  font-family: var(--font-accent);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 2.5px;
  margin-bottom: 2rem;
}

.info__title {
  font-family: var(--font-accent);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  color: white;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -2px;
}

.gradient-text {
  background: var(--accent-gradient);
  
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.info__description {
  color: var(--text-secondary);
  font-size: 1.15rem;
  line-height: 1.7;
  margin-bottom: 4rem;
  max-width: 480px;
}

/* CARDS */
.contact__actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--primary-color);
  transform: translateX(12px);
}

.action-card__icon {
  width: 55px;
  height: 55px;
  background: rgba(255, 94, 0, 0.1);
  color: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-card--whatsapp {
  background: rgba(37, 211, 102, 0.1);
  color: #25d366;
}

.action-card__text {
  flex-grow: 1;
}

.action-card__text span {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.5px;
  margin-bottom: 0.2rem;
}

.action-card__text strong {
  color: white;
  font-size: 1.05rem;
}

.action-card__tool {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: var(--transition-smooth);
}

.action-card:hover .action-card__tool {
  background: var(--primary-color);
  color: black;
}

.action-card__tool.is-copied {
  width: auto;
  padding: 0 1rem;
  background: var(--primary-color);
  color: black;
}

.action-card__tool span {
  font-size: 0.6rem;
  font-weight: 900;
}

/* VISUAL SIDE - CIRCULAR LOGO */
.contact__visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.visual__logo-container {
  position: relative;
  width: 380px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-frame {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 30px 60px rgba(0,0,0,0.4);
  z-index: 5;
  background: #000;
  animation: floating 6s ease-in-out infinite;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-orbit {
  position: absolute;
  border: 1px solid rgba(255, 94, 0, 0.2);
  border-radius: 50%;
  z-index: 2;
  animation: rotate 15s linear infinite;
}

.logo-orbit--1 {
  width: 440px;
  height: 440px;
  border-style: dashed;
}

.logo-orbit--2 {
  width: 500px;
  height: 500px;
  opacity: 0.1;
  animation-duration: 25s;
  animation-direction: reverse;
}

.logo-glow {
  position: absolute;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle, rgba(255, 94, 0, 0.1) 0%, transparent 70%);
  filter: blur(40px);
  z-index: 1;
}

@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-25px) }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.visual__dots {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

@media (max-width: 1100px) {
  .contact { padding: 5rem 0; }
  .contact__grid { grid-template-columns: 1fr; gap: 3rem; text-align: center; }
  .info__description { margin-left: auto; margin-right: auto; margin-bottom: 2rem; }
  .action-card { text-align: left; }
  .visual__logo-container { width: 100%; max-width: 260px; height: 260px; margin: 0 auto; }
  .logo-frame { width: 200px; height: 200px; }
  .logo-orbit { display: none; }
}

@media (max-width: 768px) {
  .contact { padding: 4rem 0; }
  .contact__card { padding: 2.5rem 1.25rem; border-radius: 30px; }
  .info__badge { margin-bottom: 1rem; }
  .info__title { font-size: 2.2rem; letter-spacing: -1px; margin-bottom: 1rem; }
  .info__description { font-size: 1rem; margin-bottom: 2rem; }
  
  .contact__actions { gap: 0.8rem; margin-bottom: 2.5rem; width: 100%; }
  .action-card { padding: 1.2rem; gap: 1rem; border-radius: 15px; }
  .action-card__icon { width: 42px; height: 42px; }
  .action-card__text span { font-size: 0.6rem; }
  .action-card__text strong { font-size: 0.85rem; word-break: break-all; }
  
  .visual__logo-container { max-width: 200px; height: 200px; }
  .logo-frame { width: 160px; height: 160px; }
}

@media (max-width: 480px) {
  .info__title { font-size: 1.8rem; }
  .action-card { flex-direction: column; text-align: center; padding: 1.5rem 1rem; }
  .action-card__tool { display: none; } /* Hide tool on tiny screens to save space */
  .action-card__text strong { font-size: 0.8rem; }
}
</style>
