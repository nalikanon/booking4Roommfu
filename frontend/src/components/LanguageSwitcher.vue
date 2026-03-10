<script setup>
import { useLanguage } from '../composables/useLanguage';

const { currentLanguage, toggleLanguage } = useLanguage();
</script>

<template>
  <button class="lang-btn" @click="toggleLanguage">
    <span :class="{ active: currentLanguage === 'EN' }">EN</span>
    <span class="divider">|</span>
    <span :class="{ active: currentLanguage === 'TH' }">TH</span>
  </button>
</template>

<style scoped>
.lang-btn {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
  padding: 6px 10px;
  transition: color 0.2s;
}

.lang-btn span {
  transition: color 0.2s;
}

.lang-btn .active {
  color: white;
  font-weight: 700;
}

.lang-btn:hover {
  color: white;
}

.divider {
  font-size: 0.8rem;
  opacity: 0.4;
}
</style>
