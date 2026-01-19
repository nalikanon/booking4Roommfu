<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const rooms = [
  {
    id: 1,
    title: "Classroom",
    description:
      "Standard classrooms equipped with projectors and whiteboards.",
    icon: "📚",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 2,
    title: "Laboratory",
    description: "Computer labs and science labs with specialized equipment.",
    icon: "🔬",
    color: "from-green-400 to-green-600",
  },
  {
    id: 3,
    title: "Equipment Room",
    description: "Room for storing and checking out various equipment.",
    icon: "🔧",
    color: "from-orange-400 to-orange-600",
  },
  {
    id: 4,
    title: "Meeting Room",
    description: "Professional meeting spaces with conference facilities.",
    icon: "💼",
    color: "from-purple-400 to-purple-600",
  },
];

const isPopupVisible = ref(false);
const filters = ref({
  roomdate: "",
  timefrom: "",
  timeto: "",
  roomcapacity: 40,
});

const handleSelect = (room) => {
  console.log("Selected room:", room);
  if (room.id === 1) {
    console.log("Opening popup for Classroom");
    isPopupVisible.value = true;
  } else {
    alert(`You selected: ${room.title} (Feature coming soon)`);
  }
};

const closePopup = () => {
  isPopupVisible.value = false;
};

const handleSearch = () => {
  if (
    !filters.value.roomdate ||
    !filters.value.timefrom ||
    !filters.value.timeto
  ) {
    alert("Please fill in all filter fields");
    return;
  }

  router.push({
    path: "/classroom-list",
    query: {
      roomdate: filters.value.roomdate,
      timefrom: filters.value.timefrom,
      timeto: filters.value.timeto,
      roomcapacity: filters.value.roomcapacity,
    },
  });
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

    <!-- Booking Filter Popup -->
    <Transition name="fade">
      <div v-if="isPopupVisible" class="popup-overlay" @click.self="closePopup">
        <div class="popup-content">
          <div class="popup-header">
            <h2>Search Classrooms</h2>
            <button class="close-btn" @click="closePopup">&times;</button>
          </div>

          <div class="filter-form">
            <div class="form-group">
              <label>Select Date</label>
              <input
                type="date"
                v-model="filters.roomdate"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Time From</label>
                <input
                  type="time"
                  v-model="filters.timefrom"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Time To</label>
                <input
                  type="time"
                  v-model="filters.timeto"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Capacity (People)</label>
              <input
                type="number"
                v-model="filters.roomcapacity"
                class="form-input"
                min="1"
              />
            </div>

            <button class="search-btn" @click="handleSearch">
              Search Available Rooms
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Custom gradient classes for icons (simulated with CSS variables or direct styles for simplicity in scoped) */
/* Actually, let's keep it simple with inline styles or specific classes if we wanted Tailwind-like, 
   but since we are using vanilla CSS, I'll use specific classes below. */

.from-blue-400.to-blue-600 {
  background: linear-gradient(135deg, #60a5fa, #2563eb);
}
.from-green-400.to-green-600 {
  background: linear-gradient(135deg, #4ade80, #16a34a);
}
.from-orange-400.to-orange-600 {
  background: linear-gradient(135deg, #fb923c, #ea580c);
}
.from-purple-400.to-purple-600 {
  background: linear-gradient(135deg, #c084fc, #9333ea);
}

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
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: popupSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popupSlide {
  from {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.popup-header h2 {
  font-size: 1.8rem;
  margin: 0;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: white;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: 4px;
}

.form-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #6366f1;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.search-btn {
  margin-top: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.5);
}

.search-btn:active {
  transform: translateY(0);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
