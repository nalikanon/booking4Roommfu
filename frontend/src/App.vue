<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Hide logout button on Login page and Auth Callback page
const showLogout = computed(() => {
  return route.path !== '/' && route.path !== '/auth/callback';
});

const handleLogout = () => {
  const idToken = localStorage.getItem('id_token');
  const redirectUri = import.meta.env.VITE_REDIRECT_URI || 'https://roombooking.mfu.ac.th/auth/callback';
  
  // Clear local storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');

  if (idToken) {
    // MFU SSO Logout URL
    const logoutUrl = `https://authsso.mfu.ac.th/adfs/oauth2/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = logoutUrl;
  } else {
    // Fallback: just redirect to login page if no id_token
    window.location.href = '/';
  }
};
</script>

<template>
  <div class="app-container">
    <header v-if="showLogout" class="app-header">
      <div class="logo">Booking4Room</div>
      <button @click="handleLogout" class="logout-btn">
        Logout
      </button>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* Global Resets */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: #3b82f6;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #fee2e2;
  color: #ef4444;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #fecaca;
}

.main-content {
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
