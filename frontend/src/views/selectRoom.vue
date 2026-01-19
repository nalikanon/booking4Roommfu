<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// State for Modal
const showModal = ref(false);
const selectedRoom = ref(null);
const searchParams = reactive({
  date: "",
  timeFrom: "",
  timeTo: "",
  capacity: 40,
});

const rooms = [
  {
    id: 1,
    title: "Classroom",
    description: "Standard classrooms equipped with projectors and whiteboards.",
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

const handleSelect = (room) => {
  if (room.id === 1) {
    selectedRoom.value = room;
    showModal.value = true;
  } else {
    alert(`You selected: ${room.title} (Feature coming soon)`);
  }
};

const closeModal = () => {
  showModal.value = false;
};

const submitSearch = () => {
  if (!searchParams.date || !searchParams.timeFrom || !searchParams.timeTo) {
    alert("Please fill in all fields");
    return;
  }

  router.push({
    path: "/classroom-list",
    query: {
      roomdate: searchParams.date,
      timefrom: searchParams.timeFrom,
      timeto: searchParams.timeTo,
      roomcapacity: searchParams.capacity,
    },
  });
  closeModal();
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
        <button class="select-btn" @click.stop="handleSelect(room)">Select</button>
      </div>
    </div>

    <!-- Custom Modal -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h2>Search Classrooms</h2>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Select Date</label>
              <input type="date" v-model="searchParams.date" class="input-field" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Time From</label>
                <input type="time" v-model="searchParams.timeFrom" class="input-field" />
              </div>
              <div class="form-group">
                <label>Time To</label>
                <input type="time" v-model="searchParams.timeTo" class="input-field" />
              </div>
            </div>

            <div class="form-group">
              <label>Capacity (People)</label>
              <input 
                type="number" 
                v-model="searchParams.capacity" 
                min="1" 
                class="input-field"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-cancel" @click="closeModal">Cancel</button>
            <button class="btn btn-primary" @click="submitSearch">Search Available Rooms</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
  position: relative;
  z-index: 1;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1e1e24; /* Fallback */
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #a5b4fc;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
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
  gap: 20px;
}

label {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: 4px;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  color-scheme: dark;
}

.input-field:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.modal-footer {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content {
  animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-leave-active .modal-content {
  animation: modalSlideIn 0.3s reverse;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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
</style>
