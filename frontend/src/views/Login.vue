<script setup>
import { ref } from 'vue';
import LanguageSwitcher from "../components/LanguageSwitcher.vue";
import { useLanguage } from "../composables/useLanguage";

const { t } = useLanguage();

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
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="brand">
          <span class="brand-icon">ðŸ›ï¸</span>
          <span class="brand-text">MFU Room Booking</span>
        </div>
        <LanguageSwitcher />
      </div>
    </div>

    <div class="login-wrapper">
      <div class="login-card">
        <div class="logo-area">
          <div class="logo-circle">
             <span class="logo-emoji">ðŸ“…</span>
          </div>
        </div>
        
        <div class="header">
          <h1>{{ t.welcomeTitle }}</h1>
          <p class="subtitle">{{ t.welcomeSubtitle }}</p>
        </div>

        <div class="content">
          <p class="info-text">{{ t.loginInfo }}</p>
          
          <button @click="handleMfuLogin" :disabled="loading" class="mfu-login-btn">
            <span class="btn-icon" v-if="!loading">ðŸ”</span>
            <span v-if="!loading">{{ t.loginBtn }}</span>
            <span v-else class="loading-state">
              <span class="spinner"></span> {{ t.redirecting }}
            </span>
          </button>
        </div>
        
        <div class="footer">
           <p>{{ t.footerRights }}</p>
        </div>
      </div>
    </div>

    <!-- Footer Bar -->
    <div class="footer-bar">
      <p>&copy; Mae Fah Luang University &mdash; Center for Information Technology Services</p>
    </div>
  </div>
</template>

<style scoped>
/* Page & Layout */
.page-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
}

/* Top Bar */
.top-bar {
  background: var(--primary);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.top-bar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Login Card */
.login-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  padding: 50px 40px;
  text-align: center;
  animation: cardEnter 0.6s ease-out;
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Logo Area */
.logo-area {
  margin-bottom: 25px;
  display: flex;
  justify-content: center;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FEE2E2, #FECDD3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(125, 41, 35, 0.15);
}

.logo-emoji {
  font-size: 2.5rem;
}

/* Typography */
h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 0;
}

.info-text {
  margin: 2rem 0;
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

/* Button */
.mfu-login-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(125, 41, 35, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.mfu-login-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(125, 41, 35, 0.35);
}

.mfu-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #94A3B8;
  box-shadow: none;
}

.btn-icon {
  font-size: 1.2rem;
}

/* Footer */
.footer {
  margin-top: 30px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Footer Bar */
.footer-bar {
  background: var(--accent);
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 16px 20px;
  font-size: 0.85rem;
}

.footer-bar p {
  margin: 0;
}

/* Loading Spinner */
.loading-state {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .login-card {
    padding: 40px 25px;
  }
  
  h1 {
    font-size: 1.6rem;
  }
}
</style>
