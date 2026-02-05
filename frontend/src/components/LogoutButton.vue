<script setup>
const handleLogout = () => {
  const idToken = localStorage.getItem('id_token');
  const redirectUri = window.location.origin; // Redirect to Clean Login Page (root)

  // Clear Local Storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('app_token'); // Just in case

  if (idToken) {
    // MFU SSO Logout
    const logoutUrl = `https://authsso.mfu.ac.th/adfs/oauth2/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}`;
    window.location.href = logoutUrl;
  } else {
    // Fallback if no ID token (force local logout)
    window.location.href = '/';
  }
};
</script>

<template>
  <button class="logout-btn" @click="handleLogout" title="Logout">
    <span class="icon">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    </span>
    <span class="text">Logout</span>
  </button>
</template>

<style scoped>
.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.4);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.icon {
  font-size: 1.1rem;
}

/* Optional: Hide text on small screens if needed, or adjust */
@media (max-width: 600px) {
  .text {
    display: none;
  }
  .logout-btn {
    padding: 8px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    justify-content: center;
  }
}
</style>
