<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Navbar from './features/landing/components/Navbar.vue';
import Footer from './features/landing/components/Footer.vue';
import CustomCursor from './components/common/CustomCursor.vue';
import AppBottomNav from './components/common/AppBottomNav.vue';
import SplashScreen from './components/common/SplashScreen.vue';
import PublicRaceLiveLayer from './components/common/PublicRaceLiveLayer.vue';

const route = useRoute();
/** Edición 4 tiene su propio splash — no duplicar al entrar directo */
const showSplash = ref(route.name !== 'edition-4');
const { t, te, locale } = useI18n();

// Hide navigation on teaser / edición / media tools
const showNavigation = computed(() => {
  if (route.meta?.hideChrome) return false;
  return route.name !== 'countdown' && route.name !== 'edition-4';
});

const handleSplashFinish = () => {
  showSplash.value = false;
};

// Sync locale from query parameters or local storage
const syncLocaleFromQuery = () => {
  const queryLang = route.query.lang;
  if (queryLang && ['es', 'en', 'it'].includes(queryLang)) {
    locale.value = queryLang;
  } else {
    const saved = localStorage.getItem('user-locale');
    if (saved && ['es', 'en', 'it'].includes(saved)) {
      locale.value = saved;
    }
  }
};

// Update hreflang and canonical links in head
const updateHreflangLinks = () => {
  const baseUrl = 'https://chacasxtremerace.com';
  const path = route.path === '/' ? '/' : route.path;
  const currentPathUrl = `${baseUrl}${path}`;

  const languages = [
    { lang: 'es', url: currentPathUrl },
    { lang: 'en', url: `${currentPathUrl}?lang=en` },
    { lang: 'it', url: `${currentPathUrl}?lang=it` },
    { lang: 'x-default', url: currentPathUrl }
  ];

  // Remove existing link rel="alternate" hreflang
  const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
  existingLinks.forEach(el => el.remove());

  // Add new link tags
  languages.forEach(({ lang, url }) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', url);
    document.head.appendChild(link);
  });

  // Update or create canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  const canonicalUrl = locale.value === 'es' ? currentPathUrl : `${currentPathUrl}?lang=${locale.value}`;
  canonicalLink.setAttribute('href', canonicalUrl);
};

// Update structured data JSON-LD in head
const updateStructuredData = () => {
  // Remove existing JSON-LD scripts we injected
  const existingScripts = document.querySelectorAll('script[id^="chacas-seo-jsonld"]');
  existingScripts.forEach(el => el.remove());

  const schemas = [];

  // 1. WebSite Schema & SportsClub (Homepage only)
  if (route.name === 'home') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Chacas Xtreme Race",
      "url": "https://chacasxtremerace.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://chacasxtremerace.com/inicio?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "SportsClub",
      "name": "Manka Riders",
      "image": "https://chacasxtremerace.com/assets/images/logo.webp",
      "@id": "https://chacasxtremerace.com/#organization",
      "url": "https://chacasxtremerace.com",
      "telephone": "+51983426996",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Plaza de Armas de Chacas",
        "addressLocality": "Chacas",
        "addressRegion": "Ancash",
        "postalCode": "02171",
        "addressCountry": "PE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -9.15878,
        "longitude": -77.37121
      },
      "sameAs": [
        "https://www.instagram.com/manka_riders_team/",
        "https://www.facebook.com/profile.php?id=61567035784750&locale=es_LA"
      ]
    });
  }

  // 2. SportsEvent (Events page only)
  if (route.name === 'events') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": "Chacas Xtreme Race 2026",
      "description": "La competencia de ciclismo de montaña más extrema y alta de la Cordillera Blanca, Áncash, Perú.",
      "startDate": "2026-07-28T08:00:00-05:00",
      "endDate": "2026-07-28T18:00:00-05:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Plaza de Armas de Chacas",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Chacas",
          "addressRegion": "Ancash",
          "addressCountry": "PE"
        }
      },
      "organizer": {
        "@type": "SportsOrganization",
        "name": "Manka Riders",
        "url": "https://chacasxtremerace.com"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "valueAddedTaxIncluded": "true",
        "availability": "https://schema.org/InStock",
        "validFrom": "2026-01-01T00:00:00-05:00"
      },
      "sport": "Mountain Biking"
    });
  }

  // 3. BreadcrumbList (All pages except countdown)
  if (route.name && route.name !== 'countdown') {
    const breadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale.value === 'es' ? 'Inicio' : 'Home',
          "item": "https://chacasxtremerace.com/inicio"
        }
      ]
    };

    if (route.name !== 'home') {
      const pageTitle = te(`seo.${route.name}.title`) 
        ? t(`seo.${route.name}.title`).split('|')[0].trim() 
        : route.name;
      breadcrumbs.itemListElement.push({
        "@type": "ListItem",
        "position": 2,
        "name": pageTitle,
        "item": `https://chacasxtremerace.com${route.path}`
      });
    }

    schemas.push(breadcrumbs);
  }

  // Inject all schemas
  schemas.forEach((schema, idx) => {
    const script = document.createElement('script');
    script.id = `chacas-seo-jsonld-${idx}`;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  });
};

// Helper to create or update meta tags
const updateOrCreateMetaTag = (key, value, isProperty = false) => {
  const attribute = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

// Main function to update all dynamic meta tags
const updateMetaTags = () => {
  const routeName = route.name;
  if (!routeName) return;

  const titleKey = `seo.${routeName}.title`;
  const descKey = `seo.${routeName}.description`;

  const title = te(titleKey) ? t(titleKey) : 'Chacas Xtreme Race';
  const description = te(descKey) ? t(descKey) : '';

  document.title = title;

  document.documentElement.lang = locale.value;

  const baseUrl = 'https://chacasxtremerace.com';
  const path = route.path === '/' ? '/' : route.path;
  const currentPathUrl = `${baseUrl}${path}`;
  const absoluteUrl = locale.value === 'es' ? currentPathUrl : `${currentPathUrl}?lang=${locale.value}`;
  const ogImageUrl = `${baseUrl}/logo.webp`;

  // Standard Meta Tags
  updateOrCreateMetaTag('description', description);
  updateOrCreateMetaTag('robots', 'index, follow');
  
  // Open Graph
  updateOrCreateMetaTag('og:title', title, true);
  updateOrCreateMetaTag('og:description', description, true);
  updateOrCreateMetaTag('og:image', ogImageUrl, true);
  updateOrCreateMetaTag('og:url', absoluteUrl, true);
  updateOrCreateMetaTag('og:type', 'website', true);
  updateOrCreateMetaTag('og:site_name', 'Chacas Xtreme Race', true);

  const localeMap = { es: 'es_PE', en: 'en_US', it: 'it_IT' };
  updateOrCreateMetaTag('og:locale', localeMap[locale.value] || 'es_PE', true);

  // Twitter Cards
  updateOrCreateMetaTag('twitter:card', 'summary_large_image');
  updateOrCreateMetaTag('twitter:title', title);
  updateOrCreateMetaTag('twitter:description', description);
  updateOrCreateMetaTag('twitter:image', ogImageUrl);

  updateHreflangLinks();
  updateStructuredData();
};

// Watchers to trigger update on changes
watch(() => route.query.lang, (newLang) => {
  if (newLang && ['es', 'en', 'it'].includes(newLang)) {
    locale.value = newLang;
  }
}, { immediate: true });

watch(locale, (newLoc) => {
  localStorage.setItem('user-locale', newLoc);
  updateMetaTags();
});

watch(() => route.path, () => {
  syncLocaleFromQuery();
  updateMetaTags();
});

onMounted(() => {
  syncLocaleFromQuery();
  updateMetaTags();
});
</script>

<template>
  <SplashScreen v-if="showSplash" @finish="handleSplashFinish" />
  <div v-show="!showSplash" class="app">
    <CustomCursor />
    <Navbar v-if="showNavigation" />
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Footer id="ubicacion" v-if="showNavigation" />
    <AppBottomNav v-if="showNavigation" />
    <PublicRaceLiveLayer v-if="!route.meta?.hideChrome" />
  </div>
</template>

<style>
.app {
  min-height: 100vh;
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.5s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Spacer for Bottom Nav — solo en PWA instalada */
@media (display-mode: standalone) {
  .app {
    padding-bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
