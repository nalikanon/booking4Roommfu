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
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="login-wrapper">
      <div class="glass-card login-card">
        <div class="logo-area">
          <div class="logo-circle">
             <span class="logo-emoji">📅</span>
          </div>
        </div>
        
        <div class="header">
          <h1>Room Booking</h1>
          <p class="subtitle">Mae Fah Luang University</p>
        </div>

        <div class="content">
          <p class="info-text">Welcome back! Please sign in to reserve a room.</p>
          
          <button @click="handleMfuLogin" :disabled="loading" class="mfu-login-btn">
            <span class="btn-icon" v-if="!loading">🔐</span>
            <span v-if="!loading">Login with MFU SSO</span>
            <span v-else class="loading-state">
              <span class="spinner"></span> Redirecting...
            </span>
          </button>
        </div>
        
        <div class="footer">
           <p>© 2024 MFU Room Booking System</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page & Layout */
.page-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Dark modern background */
  background: #0f172a; 
}

/* Background Shapes for Aesthetics */
.background-shapes .shape {
  position: absolute;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
  animation: float 10s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(to right, #6366f1, #a855f7);
  top: -50px;
  left: -50px;
  border-radius: 50%;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(to right, #3b82f6, #06b6d4);
  bottom: -100px;
  right: -100px;
  border-radius: 40%;
  animation-delay: 2s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: #ec4899;
  top: 40%;
  left: 30%;
  border-radius: 50%;
  opacity: 0.4;
  animation-delay: 4s;
}

@keyframes float {
  0% { transform: translate(0, 0); }
  50% { transform: translate(20px, 30px); }
  100% { transform: translate(0, 0); }
}

/* --- Login Card --- */
.login-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border-radius: 32px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 50px 40px;
  text-align: center;
  animation: cardEnter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  color: white;
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
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
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.1);
}

.logo-emoji {
  font-size: 2.5rem;
}

/* Typography */
h1 {
  font-size: 2.4rem;
  font-weight: 800;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 0;
  letter-spacing: 0.02em;
}

.info-text {
  margin: 2rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.05rem;
  line-height: 1.5;
}

/* Button */
.mfu-login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.mfu-login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.5s;
}

.mfu-login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.5);
}

.mfu-login-btn:hover::before {
  left: 100%;
}

.mfu-login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  background: #334155;
  box-shadow: none;
}

.btn-icon {
  font-size: 1.2rem;
}

/* Footer */
.footer {
  margin-top: 40px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
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
    font-size: 2rem;
  }
}
</style>
