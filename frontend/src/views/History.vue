<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import LogoutButton from "../components/LogoutButton.vue";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";
import { useLanguage } from "../composables/useLanguage";

const { t } = useLanguage();

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const historyItems = ref([]);
const isLoading = ref(true);
const error = ref(null);

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

const cancelBooking = async (bookingGuid) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
        // Real API Call
        try {
            const result = await api.cancelBooking(bookingGuid);
            
            if (result.success) {
                alert("Booking cancelled successfully!");
                // Refresh list to show updated status
                fetchHistory(); 
            } else {
                alert("Failed to cancel booking: " + (result.message || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred while cancelling.");
        }
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

      <div v-else class="history-list-container">
         <div v-for="item in historyItems" :key="item.id" class="history-row glass-panel">
            <!-- Left Side: Image & Basic Info -->
            <div class="row-left">
                <div
                    class="row-image"
                    :style="{ backgroundImage: `url(${item.image})` }"
                ></div>
                <div class="row-info">
                    <div class="row-header">
                        <h2>{{ item.roomName }}</h2>
                        <span class="badge status-badge" :class="item.statusClass">{{ item.status }}</span>
                    </div>
                    <span class="booking-id">ID: #{{ item.id }}</span>
                </div>
            </div>

            <!-- Middle: Date & Time -->
            <div class="row-middle">
                <div class="info-group">
                    <span class="icon">📅</span>
                    <span class="info-text">{{ item.date }}</span>
                </div>
                <div class="divider-vertical"></div>
                <div class="info-group">
                    <span class="icon">⏰</span>
                    <span class="info-text">{{ item.time }}</span>
                </div>
            </div>

            <!-- Right: Action -->
            <div class="row-right">
                <button class="cancel-btn-compact" @click="cancelBooking(item.guid)" title="Cancel Booking">
                    <span class="btn-icon">✖</span>
                    <span class="btn-text">Cancel</span>
                </button>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 0 10px;
}

.left-group, .right-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-3px);
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
}

/* --- History List (Compact Rows) -- */
.history-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.5s ease-out;
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 16px; /* Compact padding */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(12px);
}

.history-row:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

/* Row Layout Sections */
.row-left {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 2;
}

.row-middle {
    display: flex;
    align-items: center;
    gap: 24px;
    flex: 2;
    justify-content: center;
}

.row-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
}

/* Image & Badge */
.row-image {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.row-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.row-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.row-header h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: #fff;
}

.booking-id {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.4);
    font-family: monospace;
}

/* Status Badge */
.status-badge {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
}
.status-badge.approved { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
.status-badge.pending { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
.status-badge.cancelled { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
.status-badge.unknown { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }


/* Date & Time Info */
.info-group {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e2e8f0;
    font-size: 0.95rem;
}

.divider-vertical {
    width: 1px;
    height: 24px;
    background: rgba(255,255,255,0.1);
}

.icon {
    font-size: 1.1rem;
    opacity: 0.8;
}

/* Compact Cancel Button */
.cancel-btn-compact {
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.cancel-btn-compact:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: #ef4444;
    color: #fff;
}

.btn-icon {
    font-size: 0.9rem;
}

/* Responsiveness */
@media (max-width: 900px) {
    .row-middle { gap: 16px; }
}

@media (max-width: 768px) {
    .history-row {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }
    
    .row-left, .row-middle, .row-right {
        width: 100%;
        justify-content: flex-start;
    }

    .row-middle {
        justify-content: space-between;
        background: rgba(255,255,255,0.03);
        padding: 10px;
        border-radius: 8px;
    }

    .row-right {
        justify-content: flex-end;
    }
    
    .cancel-btn-compact {
        width: 100%;
        justify-content: center;
        padding: 10px;
    }
}

/* Loading/Empty States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  color: rgba(255,255,255,0.6);
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
@keyframes slideUp { 
    from { opacity: 0; transform: translateY(10px); } 
    to { opacity: 1; transform: translateY(0); } 
}
</style>
