<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Mock data for classrooms
const classrooms = ref([
  {
    id: 101,
    location: "D1",
    name: "301",
    capacity: 50,
    status: "Available",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 102,
    location: "E2",
    name: "201",
    capacity: 30,
    status: "Available",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 103,
    location: "D1",
    name: "302",
    capacity: 45,
    status: "Available",
    image: "https://images.unsplash.com/photo-1592305285741-6a05786a3d16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 104,
    location: "C3",
    name: "105",
    capacity: 120,
    status: "Available",
    image: "https://images.unsplash.com/photo-1565514020176-db792f4b6d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 105,
    location: "E2",
    name: "205",
    capacity: 35,
    status: "Available",
    image: "https://images.unsplash.com/photo-1510531704581-5b2870972060?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }
]);

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
      <button @click="goBack" class="back-btn">
        <span>←</span> Back
      </button>
      <h1>Available Classrooms</h1>
    </div>

    <div class="rooms-list">
      <div v-for="room in classrooms" :key="room.id" class="room-card">
        <div class="card-image" :style="{ backgroundImage: `url(${room.image})` }">
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
              <span>Capacity: <strong>{{ room.capacity }} People</strong></span>
            </div>
            <div class="detail-item">
              <span class="icon">📍</span>
              <span>Building: <strong>{{ room.location }}</strong></span>
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
  max-width: 800px;
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

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slideUp 0.6s ease-out;
}

.room-card {
  display: flex;
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  height: 180px;
}

.room-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08); /* Slightly lighter on hover */
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card-image {
  flex: 0 0 240px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(34, 197, 94, 0.9);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.card-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsiveness */
@media (max-width: 600px) {
  .room-card {
    flex-direction: column;
    height: auto;
  }
  
  .card-image {
    height: 160px;
    flex: none;
  }
  
  .card-content {
    padding: 16px;
  }
}
</style>
