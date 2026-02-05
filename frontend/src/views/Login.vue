<script setup>
import { ref } from 'vue';

const loading = ref(false);

const MFU_AUTH_URL = import.meta.env.VITE_MFU_AUTH_URL || 'https://authsso.mfu.ac.th/adfs/oauth2/authorize';
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || 'c4f25000-ccac-4320-8ccf-2c4cb742f04c';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'https://roombooking.mfu.ac.th/auth/callback';
const SCOPE = import.meta.env.VITE_SCOPE || 'openid profile email';

const handleMfuLogin = () => {
  loading.value = true;
  
  // Construct URL parameters
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE
  });

  // Redirect to MFU SSO
  window.location.href = `${MFU_AUTH_URL}?${params.toString()}`;
};
</script>

<template>
  <div class="page-container">
    <div class="login-wrapper">
      <div class="glass-card login-card">
        <div class="header">
          <h1>Booking4Room</h1>
          <p class="subtitle">Mae Fah Luang University</p>
        </div>

        <div class="content">
          <p class="info-text">Please sign in with your MFU account</p>
          
          <button @click="handleMfuLogin" :disabled="loading" class="mfu-login-btn">
            <span v-if="!loading">Login with MFU SSO</span>
            <span v-else>Redirecting...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page & Common */
.page-container {
  width: 100%;
}

/* --- Login Styles --- */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
  min-height: 80vh;
}

.glass-card {
  background: var(--glass-bg, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  box-shadow: var(--glass-shadow, 0 8px 32px 0 rgba(31, 38, 135, 0.37));
  border-radius: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
  animation: fadeIn 0.8s ease-out;
  color: white;
}

.header {
  margin-bottom: 30px;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 10px;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.95rem;
}

.info-text {
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.mfu-login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mfu-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  filter: brightness(1.1);
}

.mfu-login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
