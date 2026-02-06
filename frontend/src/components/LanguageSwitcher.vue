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
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.4);
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.lang-btn span {
  transition: color 0.3s;
}

.lang-btn .active {
  color: #a5b4fc; /* Active Color (Blueish) */
  font-weight: 700;
}

.lang-btn:hover {
  color: white;
}

.divider {
  font-size: 0.8rem;
  opacity: 0.3;
}
</style>
