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
            statusRaw: item.ROOMBOOKINGSTATUSNAMEENG, 
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

const getTranslatedStatus = (statusRaw) => {
    if (!statusRaw) return t.value.statusUnknown;
    const s = statusRaw.toLowerCase();
    
    if (s.includes('not approved')) return t.value.statusNotApproved;
    if (s.includes('approve')) return t.value.statusApproved;
    if (s.includes('pending')) return t.value.statusPending;
    if (s.includes('cancel')) return t.value.statusCancelled;
    
    return statusRaw; // Fallback to raw English if no match
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
  <div class="page-wrapper">
    <!-- Top Nav Bar -->
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="brand">
          <button @click="goBack" class="back-btn"><span>←</span> {{ t.back }}</button>
          <span class="brand-text">{{ t.historyTitle }}</span>
        </div>
        <div class="nav-group">
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </div>
    </div>

    <div class="content-area">
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
              <div class="badge status-badge" :class="item.statusClass">{{ getTranslatedStatus(item.statusRaw) }}</div>
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
    </div>  <!-- end content-area -->

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

    <!-- Footer -->
    <div class="footer-bar">
      <p>&copy; Mae Fah Luang University &mdash; Center for Information Technology Services</p>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
}

.top-bar {
  background: var(--primary);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.content-area {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px;
  width: 100%;
}

/* --- History Grid --- */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  animation: fadeIn 0.5s ease-out;
}

.room-card {
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: var(--card-shadow);
  height: 100%;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--primary-light);
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
  border-radius: 6px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.approved { background: #16A34A; }
.status-badge.pending { background: #EAB308; color: #713f12; }
.status-badge.cancelled { background: #DC2626; }
.status-badge.unknown { background: #94A3B8; }

.card-content {
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.room-header {
  margin-bottom: 4px;
}

.room-header h2 {
  font-size: 1.2rem;
  color: var(--text-main);
  margin: 0 0 4px 0;
  font-weight: 600;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--primary);
  background: rgba(193, 2, 48, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
}

.room-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.cancel-btn {
  margin-top: auto;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.3);
  color: #DC2626;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: inherit;
}

.cancel-btn:hover {
  background: rgba(220, 38, 38, 0.15);
  transform: translateY(-1px);
}

/* Responsiveness */
@media (max-width: 1600px) { .rooms-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 1300px) { .rooms-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px) { .rooms-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .rooms-grid { grid-template-columns: 1fr; } }

/* Footer */
.footer-bar {
  background: var(--accent);
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 16px 20px;
  font-size: 0.85rem;
}

.footer-bar p { margin: 0; }

/* Loading/Empty States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 60px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--card-border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
