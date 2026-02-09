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
  tel: "6400",
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
      location: r.BUILDINGNAME || r.BUILDINGCODE || 'Unknown', // "อาคารเรียนรวม 1"
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
  <div class="page-container">
    <div class="header-bar">
      <div class="left-group">
        <button @click="goBack" class="back-btn"><span>←</span> {{ t.back }}</button>
        <h1>{{ t.title }}</h1>
      </div>
      <div class="right-group">
        <LanguageSwitcher />

        <button @click="goToHistory" class="history-btn" title="History">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
          </svg>
        </button>
        <LogoutButton />
      </div>
    </div>

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
          <span class="search-icon">🔍</span>
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
              <span class="icon">👥</span>
              <span
                >{{ t.capacity }} <strong>{{ room.capacity }} {{ t.people }}</strong></span
              >
            </div>
            <div class="detail-item">
              <span class="icon">📍</span>
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
            <button class="close-btn" @click="closeBookingModal">×</button>
          </div>
          
          <div class="modal-body">
            <div class="user-info-section">
              <div class="form-grid">
                  <div class="form-group full-width">
                     <label>{{ t.bookingFor }}</label>
                     <div class="input-wrapper">
                       <span class="input-icon">📝</span>
                       <input v-model="bookingForm.bookingFor" type="text" class="modal-input with-icon" :placeholder="t.bookingForPlaceholder" />
                     </div>
                  </div>
                  <div class="form-group full-width">
                    <label>{{ t.tel }}</label>
                    <div class="input-wrapper">
                      <span class="input-icon">📞</span>
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

  </div>
</template>

<style scoped>
/* --- Page Layout --- */
.page-container {
  max-width: 95%;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* --- Header & Navigation --- */
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  position: relative;
}

.left-group {
  display: flex;
  align-items: center;
}

.right-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.history-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.history-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
  color: #a5b4fc;
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

/* --- Search Summary Bar --- */
.search-summary {
  display: flex;
  gap: 20px;
  align-items: center; /* Center items vertically */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 25px;
  animation: fadeIn 0.8s ease-out;
}

.filter-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.filter-input:focus {
  border-color: #a5b4fc;
}

/* Fix for date/time icon colors in dark mode (browser dependent, but helpful) */
.filter-input::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.6;
    cursor: pointer;
}

.capacity-input {
  width: 70px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 5px;
}

.separator {
  color: #94a3b8;
}

.right-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: scale(1.1);
}

.search-box {
  position: relative;
}

.room-search-input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px 8px 36px;
  border-radius: 20px;
  color: white;
  width: 200px;
  transition: all 0.3s ease;
  outline: none;
}

.room-search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.room-search-input:focus {
  background: rgba(0, 0, 0, 0.4);
  border-color: #a5b4fc;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  pointer-events: none;
  opacity: 0.7;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-item .value {
  font-size: 0.95rem;
  color: #fff;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* --- Room Grid & Cards --- */
.rooms-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  animation: slideUp 0.6s ease-out;
}

.room-card {
  display: flex;
  flex-direction: column; /* Change to vertical layout */
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  height: 100%; /* Fill grid cell */
}

.room-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card-image {
  width: 100%;
  height: 160px; /* Fixed height for image on top */
  background-size: cover;
  background-position: center;
  position: relative;
  flex: none; /* Don't shrink */
}

.card-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 15px;
}

/* Response for smaller screens */
@media (max-width: 1600px) {
  .rooms-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1300px) {
  .rooms-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .rooms-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .rooms-list {
    grid-template-columns: 1fr;
  }

  .search-summary {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .right-actions {
    flex-direction: row;
    align-items: center;
    width: 100%;
    margin-left: 0;
    gap: 10px;
  }

  .search-box {
    flex: 1;
    width: auto;
  }

  .room-search-input {
    width: 100%;
  }

  .room-search-input:focus {
    width: 100%;
  }
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.room-header h2 {
  font-size: 1.5rem;
  color: #fff;
  margin: 0;
}

.location-badge {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.room-details {
  display: flex;
  gap: 20px;
  color: var(--text-muted, #94a3b8);
  font-size: 0.95rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.book-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.book-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5);
}

.book-btn:active {
  transform: translateY(0);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Old responsiveness block removed */
.filter-wrapper {
  position: relative;
}

.filter-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.filter-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #4f46e5;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 10px;
  width: 180px;
  background: #1e1e24;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  z-index: 100;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.filter-option {
  padding: 10px 16px;
  color: #a5b4fc;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.filter-option:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.filter-option.selected {
  background: rgba(99, 102, 241, 0.2);
  color: white;
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
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.modal-input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  width: 100%; /* Ensure full width */
  box-sizing: border-box; /* Include padding in width */
}

.modal-input:focus {
  border-color: #6366f1;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

/* Input Icons */
.input-wrapper {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  opacity: 0.7;
  pointer-events: none;
}

.modal-input.with-icon {
  padding-left: 40px;
}

/* Toggle Switch */
.toggle-container {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 500;
}

.toggle-btn.active {
  background: #6366f1;
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

/* Ticket Style Info */
.ticket-info {
  margin-top: 25px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  position: relative;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}

.ticket-label {
  font-size: 0.75rem;
  color: #94a3b8;
  letter-spacing: 1px;
  font-weight: 600;
}

.ticket-status {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
}

.ticket-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-big-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
}

.room-sub-loc {
  font-size: 0.9rem;
  color: #a5b4fc;
  margin-top: 2px;
}

.ticket-meta {
  display: flex;
  gap: 15px;
  text-align: right;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
}

.meta-val {
  font-size: 0.9rem;
  color: #fff;
  font-weight: 500;
}

/* Response for modal form mobile */
@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Modal Styles */
/* --- Modal System --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 500px; /* Increased width */
  background: linear-gradient(145deg, rgba(30, 30, 36, 0.95), rgba(40, 40, 48, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 35px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
  margin-bottom: 25px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.info-row .label {
  color: #94a3b8;
}

.info-row .value {
  color: #fff;
  font-weight: 500;
  text-align: right;
}

/* Removed old room-info-section styles */

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.cancel-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.4);
}

.confirm-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5);
}

/* Success Modal Specifics */
.success-modal {
  text-align: center;
  padding: 40px;
}

.success-icon {
  margin-bottom: 20px;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.modal-content {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
