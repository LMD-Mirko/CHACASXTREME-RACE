<template>
  <div class="photo-auth-page">
    <div class="photo-auth-shell">
      <header class="photo-auth-hero">
        <p class="kicker">Chacas Xtreme Race · Media</p>
        <h1>Panel de camarógrafos</h1>
        <p class="sub">
          Crea tu cuenta con tu nombre e Instagram. Sube fotos y videos en
          <strong>calidad original</strong> — sin recomprimir.
        </p>
      </header>

      <div class="auth-tabs">
        <button type="button" :class="{ active: mode === 'login' }" @click="mode = 'login'">
          Iniciar sesión
        </button>
        <button type="button" :class="{ active: mode === 'register' }" @click="mode = 'register'">
          Crear cuenta
        </button>
      </div>

      <form class="auth-card" @submit.prevent="submit">
        <label>
          <span>Nombre completo</span>
          <input v-model.trim="fullName" type="text" required minlength="3" placeholder="Ej. Ana Quispe" />
        </label>
        <label>
          <span>Instagram</span>
          <div class="ig-row">
            <span class="ig-prefix">@</span>
            <input v-model.trim="instagram" type="text" required minlength="2" placeholder="tu_usuario" />
          </div>
        </label>

        <p v-if="error" class="form-error">{{ error }}</p>
        <p v-if="mode === 'register'" class="hint">
          Con estos datos entrarás después. No uses contraseña: nombre + @ deben coincidir.
        </p>

        <button class="btn-primary" type="submit" :disabled="loading">
          {{ loading ? 'Procesando…' : mode === 'login' ? 'Entrar al panel' : 'Crear cuenta' }}
        </button>
      </form>

      <router-link class="back-link" to="/inicio">← Volver al inicio</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  photographerLogin,
  photographerRegister,
  getPhotographerToken,
} from '../api/mediaApi';

const router = useRouter();
const mode = ref('login');
const fullName = ref('');
const instagram = ref('');
const loading = ref(false);
const error = ref('');

onMounted(() => {
  if (getPhotographerToken()) {
    router.replace({ name: 'photographer-panel' });
  }
});

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const payload = { full_name: fullName.value, instagram: instagram.value };
    if (mode.value === 'login') await photographerLogin(payload);
    else await photographerRegister(payload);
    router.push({ name: 'photographer-panel' });
  } catch (e) {
    error.value = e.message || 'No se pudo completar la acción.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.photo-auth-page {
  min-height: 100vh;
  background: #000000;
  color: var(--text-primary);
  padding: 2rem var(--container-px) 3rem;
  display: flex;
  justify-content: center;
  font-family: var(--font-main);
}

.photo-auth-shell {
  width: min(480px, 100%);
}

.photo-auth-hero h1 {
  font-family: var(--font-podium);
  font-size: clamp(2.2rem, 8vw, 3.2rem);
  letter-spacing: 0.04em;
  margin: 0.35rem 0;
}

.kicker {
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0;
}

.sub {
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.95rem;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 1.5rem 0 1rem;
}

.auth-tabs button {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.7rem;
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.auth-tabs button.active {
  background: rgba(255, 94, 0, 0.15);
  border-color: rgba(255, 94, 0, 0.45);
  color: var(--text-primary);
}

.auth-card {
  background: rgba(15, 15, 15, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: var(--font-accent);
}

input {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: var(--bg-color);
  color: var(--text-primary);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  outline: none;
}

input:focus {
  border-color: rgba(255, 94, 0, 0.55);
}

.ig-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ig-prefix {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary-color);
}

.ig-row input {
  flex: 1;
}

.btn-primary {
  margin-top: 0.4rem;
  border: none;
  border-radius: 12px;
  background: var(--accent-gradient);
  color: #111;
  font-family: var(--font-accent);
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.95rem;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: wait;
}

.form-error {
  color: #fda4af;
  font-size: 0.88rem;
  margin: 0;
}

.hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.back-link {
  display: inline-block;
  margin-top: 1.25rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
}
</style>
