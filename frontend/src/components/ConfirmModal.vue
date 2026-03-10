<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  type: {
      type: String,
      default: 'danger' // primary, danger, warning
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const close = () => {
    if (!props.isLoading) {
        emit('cancel');
    }
};

const confirm = () => {
    emit('confirm');
};
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-container glass-panel">
        <div class="modal-header">
           <div class="icon-wrapper" :class="type">
               <span v-if="type === 'danger'">âš ï¸</span>
               <span v-else-if="type === 'success'">âœ…</span>
               <span v-else>â„¹ï¸</span>
           </div>
           <h3>{{ title }}</h3>
        </div>
        
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>

        <div class="modal-actions">
          <button 
            class="btn-cancel" 
            @click="close" 
            :disabled="isLoading"
          >
            {{ cancelText }}
          </button>
          
          <button 
            class="btn-confirm" 
            :class="type"
            @click="confirm" 
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-sm"></span>
            <span v-else>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #E2E8F0);
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.icon-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.icon-wrapper.danger { background: rgba(220, 38, 38, 0.1); }
.icon-wrapper.success { background: rgba(22, 163, 74, 0.1); }
.icon-wrapper.primary { background: rgba(125, 41, 35, 0.1); }

h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-main, #1E293B);
    font-weight: 600;
}

.modal-body {
    text-align: center;
    color: var(--text-secondary, #475569);
    font-size: 0.95rem;
    line-height: 1.5;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 4px;
}

button {
    flex: 1;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.95rem;
    font-family: inherit;
}

.btn-cancel {
    background: var(--bg-main, #F5F6FA);
    color: var(--text-secondary, #475569);
    border: 1px solid var(--card-border, #E2E8F0);
}

.btn-cancel:hover:not(:disabled) {
    background: #E2E8F0;
    color: var(--text-main, #1E293B);
}

.btn-confirm.danger {
    background: #DC2626;
    color: white;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.btn-confirm.danger:hover:not(:disabled) {
    background: #B91C1C;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.spinner-sm {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.8s linear infinite;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
    animation: popIn 0.3s ease-out;
}
.modal-fade-leave-active .modal-container {
    animation: popIn 0.3s reverse;
}

@keyframes popIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
