<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const error = ref('');
const status = ref('Authenticating with MFU SSO...');

onMounted(async () => {
  const code = route.query.code;

  if (!code) {
    error.value = 'No authorization code found.';
    status.value = 'Error';
    return;
  }

  try {
    status.value = 'Exchanging token...';
    // Call our backend proxy to exchange code for token
    // Note: In development (Vite), /api proxies to localhost:3000
    // In production (Nginx), /api proxies to backend container
    const response = await axios.post('/api/authen/exchange', { code });

    if (response.data && response.data.access_token) {
      // Store tokens
      localStorage.setItem('access_token', response.data.access_token);
      if (response.data.id_token) {
          localStorage.setItem('id_token', response.data.id_token);
      }
      
      // Store other useful info if available (e.g. refresh_token)
      console.log('Authentication successful');
      
      // Redirect to main app
      router.push('/select-room');
    } else {
      throw new Error('No access token received');
    }

  } catch (err) {
    console.error('Authentication Error:', err);
    error.value = err.response?.data?.message || err.message || 'Authentication failed';
    status.value = 'Error';
  }
});
</script>

<template>
  <div class="callback-container">
    <div class="card">
      <h2>MFU SSO Login</h2>
      <div v-if="error" class="error">
        <p>❌ {{ error }}</p>
        <button @click="router.push('/')">Return to Login</button>
      </div>
      <div v-else class="loading">
        <div class="spinner"></div>
        <p>{{ status }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8fafc;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.error {
  color: #ef4444;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

button:hover {
  background-color: #2563eb;
}
</style>
