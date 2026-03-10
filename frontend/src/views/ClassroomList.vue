<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "../services/api";
import LogoutButton from "../components/LogoutButton.vue";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";
import { useLanguage } from "../composables/useLanguage";

// --- Setup & Routing ---
const { t } = useLanguage(); 
const router = useRouter();
const route = useRoute();

// --- State: Search & Filters ---
const searchCriteria = ref({});
const searchQuery = ref("");
const showFilter = ref(false);
const selectedBuilding = ref("");

// --- State: Data ---
const classrooms = ref([]);
const currentUser = { // Mock Data (Potentially unused)
  name: "John Doe",
  department: "Computer Science",
  faculty: "Information Technology"
};

// --- State: Booking Modal ---
const showBookingModal = ref(false);
const showSuccessModal = ref(false);
const selectedRoom = ref(null);
const isBooking = ref(false);
const bookingForm = ref({
  bookingFor: "Make Up Class 1006041",
  officerId: "30971",
  departmentId: "60",
  tel: "6411/6412",
  qty: "40",
  softwareNeeded: "No"
});

// --- Computed Properties ---
const formattedRoomDate = computed(() => {
  if (!searchCriteria.value.roomdate) return "";
  const [year, month, day] = searchCriteria.value.roomdate.split('-');
  return `${day}/${month}/${year}`;
});

const availableBuildings = computed(() => {
  const buildings = new Set(classrooms.value.map(r => r.location));
  return Array.from(buildings).sort();
});

const filteredClassrooms = computed(() => {
  let result = classrooms.value;

  // Filter by Building
  if (selectedBuilding.value) {
    result = result.filter(room => room.location === selectedBuilding.value);
  }

  // Filter by Capacity
  if (searchCriteria.value.roomcapacity) {
     const minCap = parseInt(searchCriteria.value.roomcapacity);
     if (!isNaN(minCap)) {
       result = result.filter(room => room.capacity >= minCap);
     }
  }

  // Filter by Search Query
  if (searchQuery.value) {
    const query = searchQuery.value.trim().toLowerCase();
    if (query) {
       result = result.filter(room => {
        const displayName = `Room ${room.name}`;
        const nameMatch = 
          (room.name && room.name.toString().toLowerCase().includes(query)) ||
          (displayName.toLowerCase().includes(query));
          
        const locationMatch = room.location && room.location.toString().toLowerCase().includes(query);
        return nameMatch || locationMatch;
      });
    }
  }
  
  return result;
});

const computedIsLoading = computed(() => {
  return false; // logic
});

// --- Methods: API & Data ---
const fetchRooms = async () => {
    // Call API
    const roomsResponse = await api.getEmptyRooms({
        ...searchCriteria.value
    });
  
  if (roomsResponse && roomsResponse.data && Array.isArray(roomsResponse.data)) {
// ... existing fetch logic ...
    const apiRooms = roomsResponse.data;
    
    // Helper for random image
// ... existing helpers ...
    const getRandomImage = (id) => {
        const images = [
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1592305285741-6a05786a3d16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1565514020176-db792f4b6d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1510531704581-5b2870972060?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ];
        return images[id % images.length];
    };

    classrooms.value = apiRooms.map(r => ({
      id: r.ROOMID,
      name: r.ROOMNAME, // "C1 312"
      location: r.BUILDINGNAME || r.BUILDINGCODE || 'Unknown', // "à¸­à¸²à¸„à¸²à¸£à¹€à¸£à¸µà¸¢à¸™à¸£à¸§à¸¡ 1"
      capacity: r.CAPACITY,
      status: 'Available', // API doesn't send status, assume available if in list
      description: r.ROOMTYPECODEDESC,
      image: getRandomImage(r.ROOMID)
    }));
  } else {
    // Fallback or error handling
    console.warn('API returned unexpected format:', roomsResponse);
    classrooms.value = []; // Clear current list on error/invalid
  }
};

const debounce = (fn, delay) => {
// ... existing debounce ...
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const debouncedFetch = debounce(fetchRooms, 800);

// --- Methods: UI Interaction ---
const toggleFilter = () => {
// ...
  showFilter.value = !showFilter.value;
};

// ... existing helper methods ...
const selectBuilding = (building) => {
  selectedBuilding.value = building;
  showFilter.value = false;
};

const goBack = () => {
  router.go(-1);
};

const goToHistory = () => {
  router.push('/history');
};

// ... existing booking methdos ...
const bookRoom = (room) => {
  selectedRoom.value = room;
  showBookingModal.value = true;
};
const closeBookingModal = () => {
  showBookingModal.value = false;
  setTimeout(() => {
    selectedRoom.value = null;
    showSuccessModal.value = false;
    isBooking.value = false;
  }, 300); // Wait for animation
};
// ...
const confirmBooking = async () => {
// ...
  if (!selectedRoom.value) return;

  isBooking.value = true;

  // Format Date: YYYY-MM-DD -> MM/DD/YYYY
  const [year, month, day] = searchCriteria.value.roomdate.split('-');
  const formattedDate = `${month}/${day}/${year}`;

  // Format Time: HH:mm -> HHMM
  const formatTime = (t) => t ? t.replace(':', '') : '';

  const payload = {
    roomid: selectedRoom.value.id,
    bookingdate: formattedDate,
    usetypecode: "L", // Default to Lecture
    timefrom: formatTime(searchCriteria.value.timefrom),
    timeto: formatTime(searchCriteria.value.timeto),
    bookingfor: bookingForm.value.bookingFor,
    officerid: bookingForm.value.officerId,
    tel: bookingForm.value.tel,
    qty: bookingForm.value.qty,
    softwareneeded: bookingForm.value.softwareNeeded,
    departmentid: bookingForm.value.departmentId
  };

  console.log("Submitting Booking:", payload);

  const result = await api.bookRoom(payload);

  isBooking.value = false;

  if (result.success) {
    showBookingModal.value = false;
    setTimeout(() => {
      showSuccessModal.value = true;
    }, 300);
  } else {
    alert(`Booking Failed: ${result.message}`);
  }
};
// ...
const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

// --- Lifecycle & Watchers ---
onMounted(async () => {
  const query = { ...route.query };
  // Remove roomtype if present, as requested by user
  if (query.roomtype) {
    delete query.roomtype;
    // Update URL to remove it immediately without trigger (replace)
    router.replace({ query }); 
  }
  
  // Set Officer ID from Token (Remove UAT prefix)
  const currentUser = api.getUser();
  if (currentUser) {
      // Remove all non-digits (leaves only the number)
      const cleanId = currentUser.replace(/\D/g, '');
      bookingForm.value.officerId = cleanId;
      console.log(`Setting Officer ID: ${cleanId} (from ${currentUser})`);
  }

  searchCriteria.value = query;
  await fetchRooms();
});

watch(searchCriteria, (newVal) => {
    // Update URL query params without reloading
    router.replace({ query: { ...newVal } });
    debouncedFetch();
}, { deep: true });
</script>

<template>
  <div class="page-wrapper">
    <!-- Top Nav Bar -->
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="brand">
          <button @click="goBack" class="back-btn"><span>â†</span> {{ t.back }}</button>
          <span class="brand-text">{{ t.title }}</span>
        </div>
        <div class="nav-group">
          <LanguageSwitcher />
          <button @click="goToHistory" class="nav-btn" :title="t.historyTitle">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
            </svg>
            <span>{{ t.historyTitle }}</span>
          </button>
          <LogoutButton />
        </div>
      </div>
    </div>

    <div class="content-area">
    <div class="search-summary">
      <div class="summary-item">
        <span class="label">{{ t.date }}</span>
        <input 
          type="date" 
          v-model="searchCriteria.roomdate" 
          class="filter-input"
        />
      </div>
      <div class="summary-item">
        <span class="label">{{ t.time }}</span>
        <div class="time-inputs">
           <input 
            type="time" 
            v-model="searchCriteria.timefrom" 
            class="filter-input"
          />
          <span class="separator">-</span>
           <input 
            type="time" 
            v-model="searchCriteria.timeto" 
            class="filter-input"
          />
        </div>
      </div>
      <div class="summary-item">
        <span class="label">{{ t.minCapacity }}</span>
        <input 
          type="number" 
          v-model="searchCriteria.roomcapacity" 
          class="filter-input capacity-input"
          min="1"
        />
      </div>
      
      <div class="right-actions">
        <div class="filter-wrapper">
          <button 
            class="filter-btn" 
            title="Filter by Building" 
            @click.stop="toggleFilter"
            :class="{ active: showFilter || selectedBuilding }"
          >
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
            </svg>
            <div v-if="selectedBuilding" class="filter-badge"></div>
          </button>
          
          <transition name="fade">
            <div v-if="showFilter" class="filter-dropdown glass-card">
              <div 
                class="filter-option" 
                :class="{ selected: selectedBuilding === '' }"
                @click="selectBuilding('')"
              >
                {{ t.allBuildings }}
              </div>
              <div 
                v-for="b in availableBuildings" 
                :key="b"
                class="filter-option"
                :class="{ selected: selectedBuilding === b }"
                @click="selectBuilding(b)"
              >
                {{ b }}
              </div>
            </div>
          </transition>
        </div>
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="t.searchPlaceholder" 
            class="room-search-input"
          />
          <span class="search-icon">ðŸ”</span>
        </div>
      </div>
    </div>

    <div class="rooms-list">
      <div v-for="room in filteredClassrooms" :key="room.id" class="room-card">
        <div
          class="card-image"
          :style="{ backgroundImage: `url(${room.image})` }"
        >
          <div class="badge status-badge">{{ room.status }}</div>
        </div>

        <div class="card-content">
          <div class="room-header">
            <h2>Room {{ room.name }}</h2>
            <span class="location-badge">{{ room.location }}</span>
          </div>

          <div class="room-details">
            <div class="detail-item">
              <span class="icon">ðŸ‘¥</span>
              <span
                >{{ t.capacity }} <strong>{{ room.capacity }} {{ t.people }}</strong></span
              >
            </div>
            <div class="detail-item">
              <span class="icon">ðŸ“</span>
              <span
                >{{ t.building }} <strong>{{ room.location }}</strong></span
              >
            </div>
          </div>

          <div class="card-actions">
            <button class="book-btn" @click="bookRoom(room)">{{ t.bookNow }}</button>
          </div>
        </div>
      </div>
    </div>


    <!-- Booking Modal Overlay -->
    <transition name="modal-fade">
      <div v-if="showBookingModal || showSuccessModal" class="modal-overlay" @click.self="closeBookingModal">
        
        <!-- Confirmation Modal -->
        <div v-if="showBookingModal && selectedRoom" class="modal-content glass-card" key="booking">
          <div class="modal-header">
            <h3>{{ t.confirmBookingTitle }}</h3>
            <button class="close-btn" @click="closeBookingModal">Ã—</button>
          </div>
          
          <div class="modal-body">
            <div class="user-info-section">
              <div class="form-grid">
                  <div class="form-group full-width">
                     <label>{{ t.bookingFor }}</label>
                     <div class="input-wrapper">
                       <span class="input-icon">ðŸ“</span>
                       <input v-model="bookingForm.bookingFor" type="text" class="modal-input with-icon" :placeholder="t.bookingForPlaceholder" />
                     </div>
                  </div>
                  <div class="form-group full-width">
                    <label>{{ t.tel }}</label>
                    <div class="input-wrapper">
                      <span class="input-icon">ðŸ“ž</span>
                      <input v-model="bookingForm.tel" type="text" class="modal-input with-icon" :placeholder="t.telPlaceholder" />
                    </div>
                 </div>
                 <!-- Hardcoded hidden fields: Officer ID, Dept ID, Quantity -->
                 <div class="form-group full-width">
                    <label>{{ t.softwareNeeded }}</label>
                    <div class="toggle-container">
                      <button 
                        class="toggle-btn" 
                        :class="{ active: bookingForm.softwareNeeded === 'No' }"
                        @click="bookingForm.softwareNeeded = 'No'"
                      >
                        {{ t.noSoftware }}
                      </button>
                      <button 
                        class="toggle-btn" 
                        :class="{ active: bookingForm.softwareNeeded === 'Yes' }"
                        @click="bookingForm.softwareNeeded = 'Yes'"
                      >
                        {{ t.yesNeeded }}
                      </button>
                    </div>
                 </div>
              </div>
            </div>

            <div class="ticket-info">
               <div class="ticket-header">
                 <span class="ticket-label">{{ t.bookingDetails }}</span>
                 <div class="ticket-status">{{ selectedRoom.status }}</div>
               </div>
               <div class="ticket-body">
                 <div class="ticket-main-info">
                    <div class="room-big-name">{{ selectedRoom.name }}</div>
                    <div class="room-sub-loc">{{ selectedRoom.location }}</div>
                 </div>
                 <div class="ticket-meta">
                    <div class="meta-item">
                      <span class="meta-label">{{ t.date }}</span>
                      <span class="meta-val">{{ formattedRoomDate }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">{{ t.time }}</span>
                      <span class="meta-val">{{ searchCriteria.timefrom }} - {{ searchCriteria.timeto }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">{{ t.capacity }}</span>
                      <span class="meta-val">{{ selectedRoom.capacity }}</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeBookingModal" :disabled="isBooking">{{ t.cancel }}</button>
            <button class="confirm-btn" @click="confirmBooking" :disabled="isBooking">
              {{ isBooking ? t.booking : t.confirm }}
            </button>
          </div>
        </div>

        <!-- Success Modal -->
        <div v-if="showSuccessModal" class="modal-content glass-card success-modal" key="success">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#4ade80" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 4L12 14.01l-3-3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>{{ t.successTitle }}</h3>
          <p>{{ t.successMsg }}</p>
          <button class="confirm-btn" @click="closeSuccessModal">{{ t.done }}</button>
        </div>

      </div>
    </transition>
    </div>  <!-- end content-area -->

    <!-- Footer -->
    <div class="footer-bar">
      <p>&copy; Mae Fah Luang University &mdash; Center for Information Technology Services</p>
    </div>
  </div>
</template>

<style scoped>
/* --- Page Layout --- */
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

.nav-btn {
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

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.25);
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

.search-summary {
  display: flex;
  gap: 20px;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 14px 20px;
  margin-bottom: 24px;
  box-shadow: var(--card-shadow);
}

.filter-input {
  background: var(--bg-main);
  border: 1px solid var(--card-border);
  color: var(--text-main);
  padding: 6px 10px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.filter-input:focus {
  border-color: var(--primary);
}

.capacity-input { width: 70px; }

.time-inputs {
  display: flex;
  align-items: center;
  gap: 5px;
}

.separator { color: var(--text-muted); }

.right-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-btn {
  background: transparent;
  border: 1px solid var(--card-border);
  color: var(--text-secondary);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
}

.filter-btn.active {
  background: rgba(125, 41, 35, 0.08);
  color: var(--primary);
  border-color: var(--primary);
}

.search-box { position: relative; }

.room-search-input {
  background: var(--bg-main);
  border: 1px solid var(--card-border);
  padding: 8px 16px 8px 36px;
  border-radius: 8px;
  color: var(--text-main);
  width: 200px;
  transition: all 0.2s ease;
  outline: none;
  font-family: inherit;
}

.room-search-input::placeholder { color: var(--text-muted); }

.room-search-input:focus {
  border-color: var(--primary);
  width: 240px;
  box-shadow: 0 0 0 3px rgba(125, 41, 35, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  pointer-events: none;
  opacity: 0.6;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.rooms-list {
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

.status-badge { background: var(--success); }

.card-content {
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 1600px) { .rooms-list { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 1300px) { .rooms-list { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px) { .rooms-list { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) {
  .rooms-list { grid-template-columns: 1fr; }
  .search-summary { flex-direction: column; align-items: stretch; gap: 12px; }
  .right-actions { flex-direction: row; width: 100%; margin-left: 0; gap: 10px; }
  .search-box { flex: 1; width: auto; }
  .room-search-input { width: 100%; }
  .room-search-input:focus { width: 100%; }
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.room-header h2 {
  font-size: 1.2rem;
  color: var(--text-main);
  margin: 0;
  font-weight: 600;
}

.location-badge {
  background: rgba(125, 41, 35, 0.08);
  color: var(--primary);
  border: 1px solid rgba(125, 41, 35, 0.15);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.room-details {
  display: flex;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.book-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 22px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(125, 41, 35, 0.2);
}

.book-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(125, 41, 35, 0.3);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.filter-wrapper { position: relative; }

.filter-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
}

.filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  width: 200px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 6px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.filter-option {
  padding: 10px 14px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
  font-size: 0.9rem;
}

.filter-option:hover {
  background: var(--bg-main);
  color: var(--text-main);
}

.filter-option.selected {
  background: rgba(125, 41, 35, 0.08);
  color: var(--primary);
  font-weight: 500;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width { grid-column: 1 / -1; }

.form-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.modal-input {
  background: var(--bg-main);
  border: 1px solid var(--card-border);
  color: var(--text-main);
  padding: 10px 14px;
  border-radius: 8px;
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

.modal-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(125, 41, 35, 0.1);
}

.input-wrapper { position: relative; width: 100%; }

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  opacity: 0.7;
  pointer-events: none;
}

.modal-input.with-icon { padding-left: 40px; }

.toggle-container {
  display: flex;
  background: var(--bg-main);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--card-border);
}

.toggle-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  font-weight: 500;
  font-family: inherit;
}

.toggle-btn.active {
  background: var(--primary);
  color: white;
  box-shadow: 0 2px 6px rgba(125, 41, 35, 0.25);
}

.ticket-info {
  margin-top: 20px;
  background: var(--bg-main);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 18px;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--card-border);
  padding-bottom: 10px;
}

.ticket-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  font-weight: 600;
  text-transform: uppercase;
}

.ticket-status {
  background: rgba(22, 163, 74, 0.1);
  color: var(--success);
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.ticket-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-big-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-main);
}

.room-sub-loc {
  font-size: 0.85rem;
  color: var(--primary);
  margin-top: 2px;
}

.ticket-meta {
  display: flex;
  gap: 15px;
  text-align: right;
}

.meta-item { display: flex; flex-direction: column; }

.meta-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.meta-val {
  font-size: 0.9rem;
  color: var(--text-main);
  font-weight: 500;
}

@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }

.footer-bar {
  background: var(--accent);
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 16px 20px;
  font-size: 0.85rem;
}

.footer-bar p { margin: 0; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  color: var(--text-main);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--primary);
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
  line-height: 1;
}

.close-btn:hover { color: var(--text-main); }

.modal-body { margin-bottom: 20px; }

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--card-border);
  color: var(--text-secondary);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.cancel-btn:hover {
  background: var(--bg-main);
  color: var(--text-main);
}

.confirm-btn {
  background: var(--primary);
  border: none;
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(125, 41, 35, 0.2);
  transition: all 0.2s;
  font-family: inherit;
}

.confirm-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(125, 41, 35, 0.3);
}

.success-modal { text-align: center; padding: 40px; }

.success-icon {
  margin-bottom: 20px;
  animation: popIn 0.4s ease-out;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-content, .modal-fade-leave-to .modal-content { transform: translateY(15px); opacity: 0; }
.modal-content { transition: all 0.3s ease; }
</style>