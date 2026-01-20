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

const bookRoom = (room) => {
  alert(`Booking initiated for Room ${room.name} at ${room.location}`);
};
</script>

<template>
  <div class="page-container">
    <div class="header-bar">
      <button @click="goBack" class="back-btn"><span>←</span> Back</button>
      <h1>Available {{ roomTypeDisplay }}</h1>
    </div>

    <div v-if="searchCriteria.roomdate" class="search-summary">
      <div class="summary-item">
        <span class="label">Date:</span>
        <span class="value">{{ formattedRoomDate }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Time:</span>
        <span class="value"
          >{{ searchCriteria.timefrom }} - {{ searchCriteria.timeto }}</span
        >
      </div>
      <div class="summary-item">
        <span class="label">Min Capacity:</span>
        <span class="value">{{ searchCriteria.roomcapacity }}</span>
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
</style>
