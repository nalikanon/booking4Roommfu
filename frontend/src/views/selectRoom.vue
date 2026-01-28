<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// State for Modal
const showModal = ref(false);
const selectedRoom = ref(null);
const searchParams = reactive({
  date: "",
  startHour: "09",
  startMinute: "00",
  startPeriod: "AM",
  endHour: "12",
  endMinute: "00",
  endPeriod: "PM",
  capacity: 40,
});

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];
const periods = ["AM", "PM"];

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
  selectedRoom.value = room;
  updateTimeDefaults();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const openDatePicker = (event) => {
  try {
    event.target.showPicker();
  } catch (error) {
    // Fallback for browsers not supporting showPicker
  }
};

const formattedDate = computed(() => {
  if (!searchParams.date) return "";
  const [year, month, day] = searchParams.date.split('-');
  return `${day}/${month}/${year}`;
});

const minDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});


const convertTo24Hour = (hour, minute, period) => {
  let h = parseInt(hour, 10);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute}`;
};

// Automatically set time to next available slot if today
const updateTimeDefaults = () => {
  const now = new Date();
  
  // Default date to today if empty or set it always to ensure freshness?
  // Let's keep existing date if user set it, unless it's empty.
  // Actually, for "convenience", defaulting to today is good.
  if (!searchParams.date) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    searchParams.date = `${y}-${m}-${d}`;
  }

  // Check if selected date is today
  const [sy, sm, sd] = searchParams.date.split('-').map(Number);
  const selDate = new Date(sy, sm - 1, sd);
  const today = new Date();
  today.setHours(0,0,0,0);

  if (selDate.getTime() === today.getTime()) {
    const currentNow = new Date();
    let h = currentNow.getHours();
    let m = currentNow.getMinutes();

    // Round up to next 15 minute slot
    // If 10:05 -> 10:15
    // If 10:15 -> 10:30 (to avoid "just passed" ambiguous states, let's allow current slot if very fresh? 
    // No, strictly next is safer for "passed time" request)
    let nextM = (Math.floor(m / 15) + 1) * 15;
    
    if (nextM === 60) {
      h++;
      nextM = 0;
    }

    // Handle late night overflow (next day?) 
    // For simplicity, just cap at 23:45 or roll over. 
    // If h >= 24, we technically should move to tomorrow, but let's just clamp for this simplified view.
    if (h > 23) {
       h = 23;
       nextM = 45; 
    }

    const period = h >= 12 ? 'PM' : 'AM';
    let displayH = h % 12;
    if (displayH === 0) displayH = 12;

    searchParams.startHour = String(displayH).padStart(2, '0');
    searchParams.startMinute = String(nextM).padStart(2, '0');
    searchParams.startPeriod = period;

    // Default End Time: Start + 1 hour
    let endH = h + 1;
    // Cap end time
    if (endH > 23) endH = 23;
    
    const endPeriod = endH >= 12 ? 'PM' : 'AM';
    let displayEndH = endH % 12;
    if (displayEndH === 0) displayEndH = 12;

    searchParams.endHour = String(displayEndH).padStart(2, '0');
    searchParams.endMinute = String(nextM).padStart(2, '0');
    searchParams.endPeriod = endPeriod;
  }
};

const submitSearch = () => {
  if (!searchParams.date) {
    alert("Please select a date");
    return;
  }

  const timeFrom = convertTo24Hour(searchParams.startHour, searchParams.startMinute, searchParams.startPeriod);
  const timeTo = convertTo24Hour(searchParams.endHour, searchParams.endMinute, searchParams.endPeriod);

  if (timeFrom >= timeTo) {
    alert("End time must be after start time on the same day");
    return;
  }

  // Validate past date/time
  const now = new Date();
  const [sy, sm, sd] = searchParams.date.split('-').map(Number);
  const selectedDateObj = new Date(sy, sm - 1, sd); // Local midnight
  const todayZero = new Date();
  todayZero.setHours(0, 0, 0, 0);

  if (selectedDateObj < todayZero) {
     alert("Cannot select a past date.");
     return;
  }

  if (selectedDateObj.getTime() === todayZero.getTime()) {
      const [h, m] = timeFrom.split(':').map(Number);
      const selectedDateTime = new Date();
      selectedDateTime.setHours(h, m, 0, 0);
      
      if (selectedDateTime < now) {
          alert("Cannot select a past time.");
          return;
      }
  }

  router.push({
    path: "/classroom-list",
    query: {
      roomdate: searchParams.date,
      timefrom: timeFrom,
      timeto: timeTo,
      roomcapacity: searchParams.capacity,
    },
  });
  closeModal();
};

// Helper logic for disabling past times
const isToday = computed(() => {
  if (!searchParams.date) return false;
  const today = new Date();
  const selDate = new Date(searchParams.date);
  return (
    selDate.getDate() === today.getDate() &&
    selDate.getMonth() === today.getMonth() &&
    selDate.getFullYear() === today.getFullYear()
  );
});

const isPeriodDisabled = (p) => {
  if (!isToday.value) return false;
  const now = new Date();
  const currentHour = now.getHours(); // 0-23
  
  if (p === 'AM') {
    // Disable AM if it is effectively past noon (12:00 PM onwards)
    // Actually, if it's 10AM, AM is still valid. If it's 12:00 PM (noon), AM is gone.
    return currentHour >= 12; 
  }
  return false; // PM is almost always valid unless it's 11:59PM, but rare to block whole chunk
};

const isHourDisabled = (h) => {
  if (!isToday.value) return false;
  const now = new Date();
  const currentHour24 = now.getHours();
  
  // Convert checked hour to 24h format for comparison
  let checkH = parseInt(h, 10);
  const p = searchParams.startPeriod; // Dependence on currently selected period
  
  if (p === 'AM') {
    if (checkH === 12) checkH = 0; // 12 AM is 0
  } else {
    if (checkH !== 12) checkH += 12; // 1 PM is 13
  }
  
  return checkH < currentHour24; 
};

const isMinuteDisabled = (m) => {
  if (!isToday.value) return false;
  const now = new Date();
  const currentHour24 = now.getHours();
  const currentMinute = now.getMinutes();

  let checkH = parseInt(searchParams.startHour, 10);
  const p = searchParams.startPeriod;
  
  if (p === 'AM') {
    if (checkH === 12) checkH = 0;
  } else {
    if (checkH !== 12) checkH += 12;
  }
  
  if (checkH > currentHour24) return false; // Future hour, all minutes ok
  if (checkH < currentHour24) return true;  // Past hour (already disabled), but if selected...
  
  // If current hour, check minute
  return parseInt(m, 10) < currentMinute;
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
            <h2>Search {{ selectedRoom ? selectedRoom.title : 'Classroom' }}</h2>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Select Date</label>
              <div class="date-input-container">
                <input 
                  type="text" 
                  :value="formattedDate" 
                  class="input-field display-date"
                  placeholder="dd/mm/yyyy" 
                  readonly
                />
                <input 
                  type="date" 
                  v-model="searchParams.date" 
                  class="input-field date-trigger" 
                  @click="openDatePicker"
                  :min="minDate"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Time From</label>
                <div class="time-inputs">
                  <select v-model="searchParams.startHour" class="input-field time-select">
                    <option 
                      v-for="h in hours" 
                      :key="h" 
                      :value="h"
                      :disabled="isHourDisabled(h)"
                    >
                      {{ h }}
                    </option>
                  </select>
                  <span class="colon">:</span>
                  <select v-model="searchParams.startMinute" class="input-field time-select">
                    <option 
                      v-for="m in minutes" 
                      :key="m" 
                      :value="m"
                      :disabled="isMinuteDisabled(m)"
                    >
                      {{ m }}
                    </option>
                  </select>
                   <select v-model="searchParams.startPeriod" class="input-field time-select period-select">
                    <option 
                      v-for="p in periods" 
                      :key="p" 
                      :value="p"
                      :disabled="isPeriodDisabled(p)"
                    >
                      {{ p }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Time To</label>
                <div class="time-inputs">
                  <select v-model="searchParams.endHour" class="input-field time-select">
                    <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                  </select>
                  <span class="colon">:</span>
                  <select v-model="searchParams.endMinute" class="input-field time-select">
                    <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <select v-model="searchParams.endPeriod" class="input-field time-select period-select">
                    <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
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

.date-input {
  cursor: pointer;
  position: relative;
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}


.date-input-container {
  position: relative;
  width: 100%;
}

.date-trigger {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.display-date {
  background: rgba(255, 255, 255, 0.05); /* Match standard input style */
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

.time-inputs {
  display: flex;
  align-items: center;
  gap: 5px;
}

.time-select {
  padding: 12px 10px;
  text-align: center;
  appearance: none;
  cursor: pointer;
  flex: 1;
}

.colon {
  font-weight: bold;
  color: white;
  font-size: 1.2rem;
}

.time-select option:disabled {
  color: rgba(255, 255, 255, 0.3);
  background-color: #2a2a2f;
}

.time-select option {
  background-color: #1e1e24;
  color: white;
}
</style>
