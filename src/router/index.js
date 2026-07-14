import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'countdown',
        component: () => import('../views/CountdownView.vue')
    },
    {
        path: '/edicion-4',
        name: 'edition-4',
        component: () => import('../views/Edition4View.vue')
    },
    {
        path: '/inicio',
        name: 'home',
        component: () => import('../views/HomeView.vue')
    },
    {
        path: '/como-participar',
        name: 'how-to-participate',
        component: () => import('../views/HowToParticipateView.vue')
    },
    {
        path: '/registro/ciclista',
        name: 'cyclist-registration',
        component: () => import('../views/CyclistRegistrationView.vue')
    },
    {
        path: '/auspiciadores',
        name: 'sponsors',
        component: () => import('../views/SponsorsView.vue')
    },
    {
        path: '/eventos',
        name: 'events',
        component: () => import('../views/EventsView.vue')
    },
    {
        path: '/conoce-chacas',
        name: 'discover-chacas',
        component: () => import('../views/DiscoverChacasView.vue')
    },
    {
        path: '/camarografos',
        name: 'photographer-auth',
        component: () => import('../features/media/views/PhotographerAuthView.vue'),
        meta: { hideChrome: true },
    },
    {
        path: '/camarografos/acceso',
        name: 'photographer-magic',
        component: () => import('../features/media/views/PhotographerMagicAccessView.vue'),
        meta: { hideChrome: true },
    },
    {
        path: '/camarografos/panel',
        name: 'photographer-panel',
        component: () => import('../features/media/views/PhotographerPanelView.vue'),
        meta: { hideChrome: true },
    },
    {
        path: '/mi-carrera',
        name: 'competitor-dossier',
        component: () => import('../features/media/views/CompetitorDossierView.vue'),
        meta: { hideChrome: true },
    },
    {
        path: '/completar-perfil',
        name: 'rider-profile-complete',
        component: () => import('../features/profile/views/RiderProfileCompleteView.vue'),
        meta: { hideChrome: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }
        return { top: 0 }
    }
});

export default router;
