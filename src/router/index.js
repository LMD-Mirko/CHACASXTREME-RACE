import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import HowToParticipateView from '@/views/HowToParticipateView.vue';
import CyclistRegistrationView from '@/views/CyclistRegistrationView.vue';

const routes = [
    {
        path: '/',
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
    }
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
