<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const searchCriteria = ref({});

onMounted(() => {
  searchCriteria.value = route.query;
});

// Mock data for classrooms
// Mock data for different room types
const allRoomsData = {
  "Classroom": [
    {
      id: 101,
      location: "D1",
      name: "301",
      capacity: 50,
      status: "Available",
      image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 102,
      location: "E2",
      name: "201",
      capacity: 30,
      status: "Available",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 103,
      location: "D1",
      name: "302",
      capacity: 45,
      status: "Available",
      image: "https://images.unsplash.com/photo-1592305285741-6a05786a3d16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 104,
      location: "C3",
      name: "105",
      capacity: 120,
      status: "Available",
      image: "https://images.unsplash.com/photo-1565514020176-db792f4b6d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 105,
      location: "E2",
      name: "205",
      capacity: 35,
      status: "Available",
      image: "https://images.unsplash.com/photo-1510531704581-5b2870972060?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
  ],
  "Laboratory": [
    {
      id: 201,
      location: "S1",
      name: "Lab-Chem-01",
      capacity: 20,
      status: "Available",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 202,
      location: "S1",
      name: "Lab-Bio-02",
      capacity: 25,
      status: "Available",
      image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 203,
      location: "IT2",
      name: "Computer-Lab-A",
      capacity: 40,
      status: "Available",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    }
  ],
  "Equipment Room": [
    {
      id: 301,
      location: "Media Center",
      name: "Camera Store",
      capacity: 5,
      status: "Available",
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 302,
      location: "Sports Complex",
      name: "Gym Equipment",
      capacity: 10,
      status: "Available",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    }
  ],
  "Meeting Room": [
    {
      id: 401,
      location: "Admin Bldg",
      name: "Conference A",
      capacity: 12,
      status: "Available",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 402,
      location: "Admin Bldg",
      name: "Board Room",
      capacity: 20,
      status: "Available",
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
     {
      id: 403,
      location: "Library",
      name: "Study Room 1",
      capacity: 6,
      status: "Available",
      image: "https://images.unsplash.com/photo-1464039397837-d760a5c4ceae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    }
  ]
};

const classrooms = ref([]);

onMounted(() => {
  searchCriteria.value = route.query;
  const roomType = searchCriteria.value.roomtype || "Classroom";
  classrooms.value = allRoomsData[roomType] || allRoomsData["Classroom"];
});

const roomTypeDisplay = computed(() => {
  const type = searchCriteria.value.roomtype || "Classroom";
  if (type === 'Laboratory') return 'Laboratories';
  if (type.endsWith('y')) return type.slice(0, -1) + 'ies'; 
  return type + 's';
});

const formattedRoomDate = computed(() => {
  if (!searchCriteria.value.roomdate) return "";
  const [year, month, day] = searchCriteria.value.roomdate.split('-');
  return `${day}/${month}/${year}`;

});

const searchQuery = ref("");
const showFilter = ref(false);
const selectedBuilding = ref("");

const availableBuildings = computed(() => {
  const buildings = new Set(classrooms.value.map(r => r.location));
  return Array.from(buildings).sort();
});

const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

const selectBuilding = (building) => {
  selectedBuilding.value = building;
  showFilter.value = false;
};

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

const goBack = () => {
  router.go(-1);
};

// --- Booking Modal Logic ---
const showBookingModal = ref(false);
const showSuccessModal = ref(false); // New success state
const selectedRoom = ref(null);

// Mock User Data
const currentUser = {
  name: "John Doe",
  department: "Computer Science",
  faculty: "Information Technology"
};

const bookRoom = (room) => {
  selectedRoom.value = room;
  showBookingModal.value = true;
};

const closeBookingModal = () => {
  showBookingModal.value = false;
  setTimeout(() => {
    selectedRoom.value = null;
    showSuccessModal.value = false;
  }, 300); // Wait for animation
};

const confirmBooking = () => {
  // Here we would normally make an API call
  // For now, simulate success
  showBookingModal.value = false;
  
  // Show success message or simple alert for now, or a second modal step
  // Let's use a nice success modal state instead of a browser alert
  setTimeout(() => {
     showSuccessModal.value = true;
  }, 300);
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
};
</script>

<template>
  <div class="page-container">
    <div class="header-bar">
      <button @click="goBack" class="back-btn"><span>←</span> Back</button>
      <h1>Available {{ roomTypeDisplay }}</h1>
    </div>

    <div class="search-summary">
      <div class="summary-item">
        <span class="label">Date:</span>
        <input 
          type="date" 
          v-model="searchCriteria.roomdate" 
          class="filter-input"
        />
      </div>
      <div class="summary-item">
        <span class="label">Time:</span>
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
        <span class="label">Min Capacity:</span>
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
                All Buildings
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
            placeholder="Search room name..." 
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
                >Capacity: <strong>{{ room.capacity }} People</strong></span
              >
            </div>
            <div class="detail-item">
              <span class="icon">📍</span>
              <span
                >Building: <strong>{{ room.location }}</strong></span
              >
            </div>
          </div>

          <div class="card-actions">
            <button class="book-btn" @click="bookRoom(room)">Book Now</button>
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
            <h3>Confirm Booking</h3>
            <button class="close-btn" @click="closeBookingModal">×</button>
          </div>
          
          <div class="modal-body">
            <div class="user-info-section">
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">{{ currentUser.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">Department:</span>
                <span class="value">{{ currentUser.department }}</span>
              </div>
              <div class="info-row">
                <span class="label">Faculty:</span>
                <span class="value">{{ currentUser.faculty }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="room-info-section">
               <h4>Booking Details</h4>
               <p class="room-name">Room {{ selectedRoom.name }}</p>
               <p class="room-location">{{ selectedRoom.location }}</p>
               <p class="room-capacity">Cap: {{ selectedRoom.capacity }} | Status: {{ selectedRoom.status }}</p>
            </div>
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeBookingModal">Cancel</button>
            <button class="confirm-btn" @click="confirmBooking">Confirm Booking</button>
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
          <h3>Booking Confirmed!</h3>
          <p>You have successfully booked the room.</p>
          <button class="confirm-btn" @click="closeSuccessModal">Done</button>
        </div>

      </div>
    </transition>

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
  margin-bottom: 30px;
  position: relative;
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
  max-width: 420px;
  background: #1e1e24; /* Fallback */
  background: linear-gradient(145deg, rgba(30, 30, 36, 0.9), rgba(40, 40, 48, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
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

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 20px 0;
}

.room-info-section h4 {
  margin: 0 0 10px 0;
  color: #a5b4fc;
  font-size: 1rem;
}

.room-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.room-location, .room-capacity {
  color: #94a3b8;
  margin: 4px 0 0 0;
  font-size: 0.9rem;
}

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
