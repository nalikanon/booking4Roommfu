<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const error = ref('');
const status = ref('Authenticating with MFU SSO...');
const tempIdToken = ref('');

const handleLogout = () => {
  const redirectUri = window.location.origin; // Redirect to Clean Login Page (root)
  const idToken = tempIdToken.value || localStorage.getItem('id_token');

  // Clear Local Storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('app_token');

  if (idToken) {
    // MFU SSO Logout
    const logoutUrl = `https://authsso.mfu.ac.th/adfs/oauth2/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}`;
    window.location.href = logoutUrl;
  } else {
    // Fallback if no ID token
    router.push('/');
  }
};


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
      // Decode Token to check for Role/Email
      const accessToken = response.data.access_token;
      
      // Store ID Token temporarily in case we need to logout immediately (Access Denied)
      if (response.data.id_token) {
          tempIdToken.value = response.data.id_token;
      }

      let email = '';
      
      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
           const payload = JSON.parse(atob(parts[1]));
           email = payload.email || payload.upn || '';
        }
      } catch (e) {
        console.warn('Failed to decode token for role check', e);
      }

      // Check if Staff (@mfu.ac.th)
      const isStaff = email.toLowerCase().endsWith('@mfu.ac.th');

      if (!isStaff) {
          error.value = 'Access Denied: Staff Only (@mfu.ac.th)';
          status.value = 'Unauthorized';
          // Do NOT save tokens to localStorage if access is denied
          return;
      }

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
        <button @click="handleLogout" class="logout-btn">Logout</button>
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

.logout-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ef4444; /* Red for logout */
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #dc2626;
}
</style>
