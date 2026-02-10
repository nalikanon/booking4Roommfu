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
               <span v-if="type === 'danger'">⚠️</span>
               <span v-else-if="type === 'success'">✅</span>
               <span v-else>ℹ️</span>
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: rgba(30, 41, 59, 0.7); /* Darker glass for contrast */
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transform: translateY(0);
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
    background: rgba(255, 255, 255, 0.1);
}

.icon-wrapper.danger { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.icon-wrapper.success { background: rgba(34, 197, 94, 0.2); color: #86efac; }
.icon-wrapper.primary { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }

h3 {
    margin: 0;
    font-size: 1.25rem;
    color: white;
    font-weight: 600;
}

.modal-body {
    text-align: center;
    color: #cbd5e1;
    font-size: 1rem;
    line-height: 1.5;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 8px;
}

button {
    flex: 1;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.95rem;
}

.btn-cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #cbd5e1;
}

.btn-cancel:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.btn-confirm.danger {
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-confirm.danger:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
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

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-fade-leave-active .modal-container {
    animation: popIn 0.3s reverse;
}

@keyframes popIn {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
