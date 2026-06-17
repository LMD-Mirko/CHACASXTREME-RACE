<script setup>
import { ref, onMounted } from 'vue';
import { fetchSponsors } from '@/composables/useBackendApi';
import { Globe, Instagram, Facebook, Link2, Handshake } from 'lucide-vue-next';

const sponsorsList = ref([]);
const isLoading = ref(true);

const defaultMockSponsors = [
  {
    id: 1,
    company_name: "Municipalidad de Asunción Chacas",
    description: "Patrocinador institucional y soporte logístico clave para el desarrollo seguro del evento en toda la provincia.",
    logo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&q=80",
    website_url: "https://www.gob.pe/munichacas"
  },
  {
    id: 2,
    company_name: "Cordillera Blanca DH Association",
    description: "Asociación promotora del ciclismo de montaña extremo. Soporte técnico y de seguridad en pista.",
    logo_url: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=200&q=80",
    instagram_url: "https://instagram.com"
  },
  {
    id: 3,
    company_name: "Ancash Riders Team",
    description: "Club organizador local encargado de la preparación física de la pista y marcación del sendero.",
    logo_url: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=200&q=80",
    facebook_url: "https://facebook.com"
  },
  {
    id: 4,
    company_name: "BiciTienda Chacas & Soporte",
    description: "Soporte técnico y mecánico oficial. Punto de asistencia de emergencia en partida y meta.",
    logo_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=200&q=80",
    website_url: "https://google.com"
  }
];

const loadSponsorsData = async () => {
  try {
    const data = await fetchSponsors();
    sponsorsList.value = data.length ? data : defaultMockSponsors;
  } catch (error) {
    console.warn('API error fetching sponsors for Edition 4, using fallbacks:', error.message);
    sponsorsList.value = defaultMockSponsors;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadSponsorsData();
});
</script>

<template>
  <div class="sponsors-tab-wrapper">
    <div class="sponsors-header">
      <div class="section-header-mini font-accent">
        <span>OFFICIAL_SPONSORS // IV EDICIÓN CHACAS DH</span>
        <span class="tech-tag">SPONSOR_GRID_CONNECTED</span>
      </div>
      <h2 class="sponsors-title font-podium">
        NUESTROS <span class="highlight-text">AUSPICIADORES</span>
      </h2>
      <p class="sponsors-subtitle font-inter">
        Las marcas y organizaciones que impulsan la adrenalina y hacen posible la carrera más extrema.
      </p>
    </div>

    <div v-if="isLoading" class="sponsors-loading font-accent">
      <div class="spinner"></div>
      <span>CARGANDO ALIANZAS...</span>
    </div>

    <div v-else class="sponsors-grid">
      <div 
        v-for="sponsor in sponsorsList" 
        :key="sponsor.id" 
        class="sponsor-card"
      >
        <!-- Scope bracket decorations -->
        <span class="decor-bracket tl"></span>
        <span class="decor-bracket tr"></span>
        <span class="decor-bracket bl"></span>
        <span class="decor-bracket br"></span>

        <!-- Logo Frame -->
        <div class="sponsor-logo-frame">
          <img :src="sponsor.logo_url" :alt="sponsor.company_name" class="sponsor-logo" />
        </div>

        <!-- Info details -->
        <div class="sponsor-info">
          <h3 class="sponsor-name font-podium">{{ sponsor.company_name }}</h3>
          <p class="sponsor-desc font-inter">{{ sponsor.description || 'Patrocinador oficial de la 4ta Edición de Chacas Xtreme Race.' }}</p>
          
          <!-- Social Link Pills -->
          <div class="sponsor-links font-accent">
            <a v-if="sponsor.website_url" :href="sponsor.website_url" target="_blank" rel="noopener noreferrer" class="link-pill">
              <Globe :size="12" />
              <span>WEB</span>
            </a>
            <a v-if="sponsor.instagram_url" :href="sponsor.instagram_url" target="_blank" rel="noopener noreferrer" class="link-pill">
              <Instagram :size="12" />
              <span>INSTAGRAM</span>
            </a>
            <a v-if="sponsor.facebook_url" :href="sponsor.facebook_url" target="_blank" rel="noopener noreferrer" class="link-pill">
              <Facebook :size="12" />
              <span>FACEBOOK</span>
            </a>
            <span v-if="!sponsor.website_url && !sponsor.instagram_url && !sponsor.facebook_url" class="partner-badge">
              <Handshake :size="12" />
              PARTNER
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sponsors-tab-wrapper {
  margin-top: 6rem;
  padding-top: 4rem;
  border-top: 1px dashed rgba(255, 94, 0, 0.2);
  margin-bottom: 5rem;
}

.sponsors-header {
  margin-bottom: 3.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.section-header-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.8rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.sponsors-title {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  font-weight: 950;
  line-height: 1;
  margin: 0.8rem 0 1rem 0;
  letter-spacing: -1.5px;
  text-transform: uppercase;
}

.highlight-text {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.sponsors-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  max-width: 650px;
  line-height: 1.6;
  margin: 0;
}

.tech-tag {
  color: var(--secondary-color);
}

.sponsors-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.72rem;
  letter-spacing: 2px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 94, 0, 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* SPONSORS GRID */
.sponsors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.sponsor-card {
  position: relative;
  background: rgba(10, 10, 10, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.2rem;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.4s;
}

/* Backdrop filter optimization */
@media (min-width: 769px) {
  .sponsor-card {
    backdrop-filter: blur(12px);
  }
}

.sponsor-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 94, 0, 0.35);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.65), 0 0 25px rgba(255, 94, 0, 0.05);
}

/* Corner bracket decorations */
.decor-bracket {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  transition: border-color 0.3s;
}
.sponsor-card:hover .decor-bracket {
  border-color: var(--primary-color);
}

.tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
.tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }
.bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }
.br { bottom: 10px; right: 10px; border-left: none; border-top: none; }

/* Logo Frame */
.sponsor-logo-frame {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  padding: 3px;
  border: 1.5px dashed rgba(255, 255, 255, 0.1);
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.4s;
}

.sponsor-card:hover .sponsor-logo-frame {
  border-color: var(--primary-color);
}

.sponsor-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  filter: grayscale(0.3) brightness(0.9);
  transition: filter 0.4s, transform 0.4s;
}

.sponsor-card:hover .sponsor-logo {
  filter: grayscale(0) brightness(1.1);
  transform: scale(1.05);
}

/* Info */
.sponsor-info {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
}

.sponsor-name {
  font-size: 1.15rem;
  font-weight: 900;
  color: #fff;
  line-height: 1.2;
}

.sponsor-desc {
  font-size: 0.78rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.55);
}

.sponsor-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.link-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  padding: 0.3rem 0.7rem;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s;
}

.link-pill:hover {
  background: rgba(255, 94, 0, 0.1);
  border-color: var(--primary-color);
  color: #fff;
}

.partner-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  color: var(--secondary-color);
  font-weight: 900;
  letter-spacing: 0.5px;
}
</style>
