<template>
  <div class="magic-page">
    <div class="magic-card">
      <p class="kicker">Chacas Xtreme Race · Media</p>
      <h1>Acceso camarógrafo</h1>
      <p v-if="status === 'loading'" class="msg">Validando tu enlace…</p>
      <p v-else-if="status === 'error'" class="msg error">{{ error }}</p>
      <p v-else class="msg">Entrando al panel…</p>
      <router-link v-if="status === 'error'" class="back" to="/camarografos">
        Ir a inicio de sesión
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { photographerMagicLogin, getPhotographerToken } from '../api/mediaApi';

const route = useRoute();
const router = useRouter();
const status = ref('loading');
const error = ref('');

onMounted(async () => {
  if (getPhotographerToken()) {
    router.replace({ name: 'photographer-panel' });
    return;
  }

  const token = String(route.query.token || '').trim();
  if (!token) {
    status.value = 'error';
    error.value = 'Falta el token en el enlace. Pide uno nuevo al staff.';
    return;
  }

  try {
    await photographerMagicLogin(token);
    status.value = 'ok';
    router.replace({ name: 'photographer-panel' });
  } catch (e) {
    status.value = 'error';
    error.value = e.message || 'Enlace inválido o vencido.';
  }
});
</script>

<style scoped>
.magic-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background: #000;
  color: #f5f5f5;
  font-family: var(--font-main, system-ui, sans-serif);
}
.magic-card {
  width: min(420px, 100%);
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 1.5rem;
  background: #0e0e0e;
}
.kicker {
  margin: 0 0 0.5rem;
  color: #ff5e00;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
h1 { margin: 0 0 0.75rem; font-size: 1.4rem; }
.msg { color: #bbb; line-height: 1.45; }
.msg.error { color: #ff8a80; }
.back {
  display: inline-block;
  margin-top: 1rem;
  color: #ff5e00;
  text-decoration: none;
  font-weight: 600;
}
</style>
