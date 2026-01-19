<script setup>
import { ref } from 'vue';

const rooms = [
  {
    id: 1,
    title: "Classroom",
    description: "Standard classrooms equipped with projectors and whiteboards.",
    icon: "📚",
    color: "from-blue-400 to-blue-600"
  },
  {
    id: 2,
    title: "Laboratory",
    description: "Computer labs and science labs with specialized equipment.",
    icon: "🔬",
    color: "from-green-400 to-green-600"
  },
  {
    id: 3,
    title: "Equipment Room",
    description: "Room for storing and checking out various equipment.",
    icon: "🔧",
    color: "from-orange-400 to-orange-600"
  },
  {
    id: 4,
    title: "Meeting Room",
    description: "Professional meeting spaces with conference facilities.",
    icon: "💼",
    color: "from-purple-400 to-purple-600"
  }
];

const handleSelect = (room) => {
  alert(`You selected: ${room.title}`);
  // In a real app, router.push('/booking/' + room.id)
};
</script>

<template>
  <div class="dashboard-container">
    <div class="header-section">
      <h1>Select a Room Type</h1>
      <p>Choose the type of room you would like to book.</p>
    </div>

    <div class="grid-container">
      <div 
        v-for="room in rooms" 
        :key="room.id" 
        class="room-card"
        @click="handleSelect(room)"
      >
        <div class="icon-wrapper" :class="room.color">
          <span class="emoji">{{ room.icon }}</span>
        </div>
        <h3>{{ room.title }}</h3>
        <p>{{ room.description }}</p>
        <button class="select-btn">Select</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.header-section {
  margin-bottom: 50px;
  animation: slideDown 0.8s ease-out;
}

.header-section h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-section p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  perspective: 1000px;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}

.room-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 30px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.room-card:hover {
  transform: translateY(-10px) scale(1.02);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

/* Custom gradient classes for icons (simulated with CSS variables or direct styles for simplicity in scoped) */
/* Actually, let's keep it simple with inline styles or specific classes if we wanted Tailwind-like, 
   but since we are using vanilla CSS, I'll use specific classes below. */

.from-blue-400.to-blue-600 { background: linear-gradient(135deg, #60A5FA, #2563EB); }
.from-green-400.to-green-600 { background: linear-gradient(135deg, #4ADE80, #16A34A); }
.from-orange-400.to-orange-600 { background: linear-gradient(135deg, #FB923C, #EA580C); }
.from-purple-400.to-purple-600 { background: linear-gradient(135deg, #C084FC, #9333EA); }

.emoji {
  font-size: 2.5rem;
}

h3 {
  font-size: 1.5rem;
  margin: 10px 0;
  color: #fff;
}

p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
  flex-grow: 1;
}

.select-btn {
  margin-top: auto;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
}

.room-card:hover .select-btn {
  background: white;
  color: var(--primary);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
