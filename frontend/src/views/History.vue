<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

// Mock history data
const historyItems = ref([
  {
    id: 1,
    roomName: "Room D1 301",
    location: "อาคารโรงอาหารและกิจกรรม",
    date: "02/03/2026",
    time: "09:00 - 11:00",
    status: "Approved"
  },
  {
    id: 2,
    roomName: "Room C5 301",
    location: "อาคาร พลตำรวจเอก เผ่า สารสิน",
    date: "01/28/2026",
    time: "13:00 - 15:00",
    status: "Completed"
  }
]);
</script>

<template>
  <div class="page-container">
    <div class="header-bar">
      <button @click="goBack" class="back-btn"><span>←</span> Back</button>
      <h1>Booking History</h1>
    </div>

    <div class="history-list">
      <div v-for="item in historyItems" :key="item.id" class="history-card glass-card">
        <div class="card-content">
          <div class="card-header">
            <h2>{{ item.roomName }}</h2>
            <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
          </div>
          <div class="card-body">
            <div class="detail-row">
              <span class="icon">📍</span>
              <span>{{ item.location }}</span>
            </div>
            <div class="detail-row">
              <span class="icon">📅</span>
              <span>{{ item.date }}</span>
            </div>
            <div class="detail-row">
              <span class="icon">⏰</span>
              <span>{{ item.time }}</span>
            </div>
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

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  padding: 20px;
  transition: transform 0.2s;
}

.glass-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: white;
}

.card-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.approved {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.status-badge.completed {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}
</style>
