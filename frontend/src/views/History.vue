</script>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import LogoutButton from "../components/LogoutButton.vue";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import { useLanguage } from "../composables/useLanguage";

const { t } = useLanguage();

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const historyItems = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Modal State
const showModal = ref(false);
const modalLoading = ref(false);
const pendingCancelGuid = ref(null);

const fetchHistory = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.getBookingHistory();
    // API returns { data: [...], code: 200, ... }
    const historyData = response.data || response; 
    
    if (Array.isArray(historyData)) {
        historyItems.value = historyData.map(item => ({
            id: item.BOOKINGID,
            // Try to find the GUID. The exact casing might vary (UPPERCASE from Oracle usually).
            guid: item.ROOMBOOKINGGUID || item.roombookingguid || item.BOOKINGID, 
            roomName: item.ROOMNAME, 
            date: item.ROOMBOOKINGDATE,
            time: `${formatTime(item.TIMEFROM)} - ${formatTime(item.TIMETO)}`,
            status: item.ROOMBOOKINGSTATUSNAMEENG, 
            statusClass: getStatusClass(item.ROOMBOOKINGSTATUSNAMEENG),
            image: getRandomImage(item.BOOKINGID)
        }));
    } else {
        historyItems.value = [];
    }
  } catch (err) {
    console.error("Failed to fetch history:", err);
    error.value = "Failed to load booking history.";
  } finally {
    isLoading.value = false;
  }
};

const getStatusClass = (status) => {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s.includes('not approved')) return 'cancelled'; // Map to red style
    if (s.includes('approve')) return 'approved';
    if (s.includes('pending')) return 'pending';
    if (s.includes('cancel')) return 'cancelled';
    return 'unknown';
};

const openCancelModal = (bookingGuid) => {
    pendingCancelGuid.value = bookingGuid;
    showModal.value = true;
};

const handleConfirmCancel = async () => {
    if (!pendingCancelGuid.value) return;
    
    modalLoading.value = true;
    try {
        const result = await api.cancelBooking(pendingCancelGuid.value);
        if (result.success) {
            // Success
            showModal.value = false;
            fetchHistory(); // Refresh list
            // Optional: Show success toast here if we had a toast component
        } else {
            alert("Failed to cancel: " + (result.message || "Unknown error"));
            showModal.value = false;
        }
    } catch (e) {
        console.error(e);
        alert("An error occurred.");
        showModal.value = false;
    } finally {
        modalLoading.value = false;
        pendingCancelGuid.value = null;
    }
};

const formatTime = (timeStr) => {
    if (!timeStr) return "";
    // Insert colon if missing (e.g., 0900 -> 09:00)
    if (timeStr.length === 4 && !timeStr.includes(':')) {
        return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
    }
    return timeStr;
}

const getRandomImage = (id) => {
    // Generate a pseudo-random index based on the ID string
    let hash = 0;
    if (id) {
       for (let i = 0; i < id.length; i++) {
           hash = id.charCodeAt(i) + ((hash << 5) - hash);
       }
    }
    const index = Math.abs(hash);
    
    const images = [
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1592305285741-6a05786a3d16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1565514020176-db792f4b6d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1510531704581-5b2870972060?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    ];
    return images[index % images.length];
};

onMounted(() => {
    fetchHistory();
});
</script>

<template>
  <div class="page-container">
    <div class="header-bar">
      <div class="left-group">
        <button @click="goBack" class="back-btn"><span>←</span> {{ t.back }}</button>
        <h1>{{ t.historyTitle }}</h1>
      </div>
      <div class="right-group">
        <LanguageSwitcher />
        <LogoutButton />
      </div>
    </div>

    <div class="history-list">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>{{ t.loadingHistory }}</span>
      </div>
      
      <div v-else-if="error" class="error-state">
        <span class="error-icon">⚠️</span> {{ error }}
      </div>

      <div v-else-if="historyItems.length === 0" class="empty-state">
        <span class="empty-icon">📂</span> {{ t.noHistory }}
      </div>

      <div v-else class="rooms-grid">
         <div v-for="item in historyItems" :key="item.id" class="room-card glass-card">
            <div
              class="card-image"
              :style="{ backgroundImage: `url(${item.image})` }"
            >
              <div class="badge status-badge" :class="item.statusClass">{{ item.status }}</div>
            </div>

            <div class="card-content">
              <div class="room-header">
                <h2>Room {{ item.roomName }}</h2>
              </div>

              <div class="room-details">
                 <div class="detail-item full-width">
                   <span class="icon">📅</span>
                   <span><strong>{{ item.date }}</strong></span>
                 </div>
                 <div class="detail-item">
                   <span class="icon">⏰</span>
                   <span>{{ item.time }}</span>
                 </div>
              </div>
              
              <button 
                class="cancel-btn" 
                @click="openCancelModal(item.guid)"
                v-if="item.statusClass !== 'cancelled'" 
              >
                <span>✖</span> {{ t.cancelBooking || 'Cancel' }}
              </button>
            </div>
         </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal 
        :visible="showModal"
        :title="t.confirmCancelTitle || 'Cancel Booking'"
        :message="t.confirmCancelMsg || 'Are you sure you want to cancel this booking? This action cannot be undone.'"
        :confirmText="t.confirmYes || 'Yes, Cancel'"
        :cancelText="t.confirmNo || 'No, Keep it'"
        :isLoading="modalLoading"
        type="danger"
        @confirm="handleConfirmCancel"
        @cancel="showModal = false"
    />
  </div>
</template>

<style scoped>
.page-container {
  max-width: 95%;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.left-group, .right-group {
  display: flex;
  align-items: center;
  gap: 15px; /* Add gap for switcher and logout */
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  margin-right: 20px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-3px);
}

h1 {
  font-size: 2rem;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

/* --- History Grid -- */
/* Match structure of rooms-list from ClassroomList.vue */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  animation: slideUp 0.6s ease-out;
}

.room-card {
  display: flex;
  flex-direction: column;
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  height: 100%;
}

.room-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card-image {
  width: 100%;
  height: 160px;
  background-size: cover;
  background-position: center;
  position: relative;
  flex: none;
}

.badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 4px 12px;
    border-radius: 20px;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    backdrop-filter: blur(4px);
}
/* Re-use status colors logic */
.status-badge.approved { background: rgba(74, 222, 128, 0.9); color: #064e3b; }
.status-badge.pending { background: rgba(250, 204, 21, 0.9); color: #713f12; }
.status-badge.cancelled { background: rgba(248, 113, 113, 0.9); color: #7f1d1d; }
.status-badge.unknown { background: rgba(148, 163, 184, 0.9); }

.card-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.room-header {
  margin-bottom: 5px;
}

.room-header h2 {
  font-size: 1.4rem;
  color: #fff;
  margin: 0 0 5px 0;
}

.date-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    color: #a5b4fc;
    background: rgba(99, 102, 241, 0.1);
    padding: 2px 8px;
    border-radius: 6px;
}

.room-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #94a3b8;
  font-size: 0.95rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.cancel-btn {
  margin-top: auto;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
  color: white;
}

.detail-item .icon {
    opacity: 0.8;
}

/* Responsiveness */
@media (max-width: 1600px) { .rooms-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 1300px) { .rooms-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px) { .rooms-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .rooms-grid { grid-template-columns: 1fr; } }


/* Loading/Empty States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 60px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
