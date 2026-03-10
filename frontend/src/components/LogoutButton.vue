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
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.icon {
  font-size: 1rem;
}

@media (max-width: 600px) {
  .text {
    display: none;
  }
  .logout-btn {
    padding: 8px;
    border-radius: 8px;
    width: 36px;
    height: 36px;
    justify-content: center;
  }
}
</style>
