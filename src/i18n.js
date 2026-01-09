import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';
import it from './locales/it.json';

const i18n = createI18n({
    legacy: false, // Use Composition API
    locale: 'es', // Default language
    fallbackLocale: 'en',
    globalInjection: true,
    messages: {
        es,
        en,
        it
    }
});

export default i18n;
