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

      <div v-else class="rooms-grid">
         <div v-for="item in historyItems" :key="item.id" class="room-card glass-card">
            <div class="card-image-wrapper">
                <div
                    class="card-image"
                    :style="{ backgroundImage: `url(${item.image})` }"
                ></div>
                <div class="badge status-badge" :class="item.statusClass">{{ item.status }}</div>
            </div>

            <div class="card-content">
              <div class="room-header">
                <h2>Room {{ item.roomName }}</h2>
                <span class="room-id">#{{ item.id }}</span>
              </div>

              <div class="divider"></div>

              <div class="room-details">
                 <div class="detail-item">
                   <div class="icon-box">📅</div>
                   <div class="detail-text">
                       <span class="label">Date</span>
                       <span class="value">{{ item.date }}</span>
                   </div>
                 </div>
                 <div class="detail-item">
                   <div class="icon-box">⏰</div>
                   <div class="detail-text">
                       <span class="label">Time</span>
                       <span class="value">{{ item.time }}</span>
                   </div>
                 </div>
              </div>
              
              <button class="cancel-btn" @click="cancelBooking(item.guid)">
                <span>Cancel Booking</span>
              </button>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
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
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-3px);
}

h1 {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.5px;
}

/* --- History Grid -- */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.room-card {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
  position: relative;
}

.room-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.3);
}

.card-image-wrapper {
    position: relative;
    height: 180px;
    overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.room-card:hover .card-image {
    transform: scale(1.05);
}

.badge {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 6px 14px;
    border-radius: 100px;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.status-badge.approved { background: rgba(16, 185, 129, 0.85); color: #fff; }
.status-badge.pending { background: rgba(245, 158, 11, 0.85); color: #fff; }
.status-badge.cancelled { background: rgba(239, 68, 68, 0.85); color: #fff; }
.status-badge.unknown { background: rgba(100, 116, 139, 0.85); }

.card-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}

.room-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
}

.room-id {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.4);
    font-family: monospace;
}

.divider {
    height: 1px;
    background: linear-gradient(to right, rgba(255,255,255,0.1), transparent);
    margin-bottom: 20px;
}

.room-details {
  display: list-item; /* This forces a column layout for items */
  gap: 16px;
  margin-bottom: 24px;
  list-style: none; /* remove bullet points */ 
}

/* Reset list-item back to flex for layout control */
.room-details {
    display: flex;
    flex-direction: column;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.03);
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.icon-box {
    font-size: 1.2rem;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
}

.detail-text {
    display: flex;
    flex-direction: column;
}

.label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.5);
    font-weight: 600;
}

.value {
    font-size: 0.95rem;
    color: #e2e8f0;
    font-weight: 500;
}

.cancel-btn {
  margin-top: auto;
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cancel-btn:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.cancel-btn:active {
    transform: translateY(0);
}

/* Responsiveness */
@media (max-width: 768px) {
  .header-bar {
      flex-direction: column;
      gap: 20px;
      align-items: flex-start;
  }
  .right-group {
      width: 100%;
      justify-content: flex-end;
  }
}

/* Loading/Empty States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 32px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  margin-top: 40px;
  color: rgba(255,255,255,0.7);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp { 
    from { opacity: 0; transform: translateY(20px); } 
    to { opacity: 1; transform: translateY(0); } 
}
</style>
