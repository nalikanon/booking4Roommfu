<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import LogoutButton from "../components/LogoutButton.vue";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";
import { useLanguage } from "../composables/useLanguage";
import logooImg from '../assets/logoo.png';

const { t } = useLanguage();
const router = useRouter();

const goToHistory = () => {
  router.push('/history');
};

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

const rooms = computed(() => [
  {
    id: 1,
    title: t.value.classroomTitle,
    description: t.value.classroomDesc,
    icon: "📚",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 2,
    title: t.value.labTitle,
    description: t.value.labDesc,
    icon: "🔬",
    color: "from-green-400 to-green-600",
  },
  {
    id: 3,
    title: t.value.equipTitle,
    description: t.value.equipDesc,
    icon: "🔬",
    color: "from-orange-400 to-orange-600",
    disabled: true,
    externalLink: "https://lab-stic.mfu.ac.th",
    buttonName: "Lab-stic",
  },
  {
    id: 4,
    title: t.value.meetTitle,
    description: t.value.meetDesc,
    icon: "💼",
    color: "from-purple-400 to-purple-600",
    disabled: true,
    externalLink: "https://eoffice.mfu.ac.th",
    buttonName: "Eoffice",
  },
]);

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

  // islab: 1 = Computer Lab, 2 = Classroom (room id 2 = lab, room id 1 = classroom)
  const islab = selectedRoom.value?.id === 2 ? 1 : 2;

  router.push({
    path: "/classroom-list",
    query: {
      roomdate: searchParams.date,
      timefrom: timeFrom,
      timeto: timeTo,
      roomcapacity: searchParams.capacity,
      islab,
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
  <div class="page-wrapper">
    <!-- Top Nav Bar -->
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="brand">
          <img :src="logooImg" class="brand-logo" alt="MFU Logo" />
          <span class="brand-text">MFU Room Booking</span>
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
      <div class="header-section">
        <h1>{{ t.selectRoomTitle }}</h1>
        <p>{{ t.selectRoomSubtitle }}</p>
      </div>

      <div class="grid-container">
        <div
          v-for="room in rooms"
          :key="room.id"
          class="room-card"
          :class="{ disabled: room.disabled }"
          @click="!room.disabled && handleSelect(room)"
        >
          <div v-if="room.disabled" class="dev-badge">{{ t.underDevelopment }}</div>
          <div class="icon-wrapper" :class="room.color">
            <span class="emoji">{{ room.icon }}</span>
          </div>
          <h3>{{ room.title }}</h3>
          <p>{{ room.description }}</p>
          <a v-if="room.externalLink" :href="room.externalLink" target="_blank" rel="noopener noreferrer" class="select-btn" @click.stop>{{ t.systemLabel }} {{ room.buttonName }}</a>
          <button v-else class="select-btn" @click.stop="handleSelect(room)">{{ t.select }}</button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-bar">
      <p>&copy; Mae Fah Luang University &mdash; Center for Information Technology Services</p>
    </div>

    <!-- Custom Modal -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h2>{{ t.searchRoomTitle }} - {{ selectedRoom ? selectedRoom.title : '' }}</h2>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>{{ t.selectDate }}</label>
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
                <label>{{ t.timeFrom }}</label>
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
                <label>{{ t.timeTo }}</label>
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
              <label>{{ t.minCapacity }}</label>
              <input 
                type="number" 
                v-model="searchParams.capacity" 
                min="1" 
                class="input-field"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-cancel" @click="closeModal">{{ t.cancelBtn }}</button>
            <button class="btn btn-primary" @click="submitSearch">{{ t.searchBtn }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
}

/* Top Bar */
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
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-size: 1.2rem;
  font-weight: 700;
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

/* Content */
.content-area {
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
}

.header-section {
  margin-bottom: 40px;
  text-align: center;
  animation: fadeIn 0.6s ease-out;
}

.header-section h1 {
  font-size: 2.2rem;
  margin-bottom: 8px;
  color: var(--text-main);
  font-weight: 700;
}

.header-section p {
  color: var(--text-secondary);
  font-size: 1.05rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}

.room-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 30px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--card-shadow);
  position: relative;
}

.room-card:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--primary-light);
}

.room-card.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  position: relative;
}

.dev-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #F59E0B;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.from-blue-400.to-blue-600 {
  background: linear-gradient(135deg, #DBEAFE, #93C5FD);
}
.from-green-400.to-green-600 {
  background: linear-gradient(135deg, #D1FAE5, #6EE7B7);
}
.from-orange-400.to-orange-600 {
  background: linear-gradient(135deg, #FFEDD5, #FDBA74);
}
.from-purple-400.to-purple-600 {
  background: linear-gradient(135deg, #EDE9FE, #C4B5FD);
}

.emoji {
  font-size: 2.2rem;
}

h3 {
  font-size: 1.3rem;
  margin: 8px 0;
  color: var(--text-main);
  font-weight: 600;
}

p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 18px;
  flex-grow: 1;
}

.select-btn {
  margin-top: auto;
  padding: 10px 28px;
  background: transparent;
  border: 2px solid var(--primary);
  border-radius: 8px;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.room-card:hover:not(.disabled) .select-btn {
  background: var(--primary);
  color: white;
}

.select-btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #999;
  color: #999;
}

/* Footer */
.footer-bar {
  background: var(--accent);
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 16px 20px;
  font-size: 0.85rem;
}

.footer-bar p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  color: var(--text-main);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h2 {
  font-size: 1.3rem;
  color: var(--primary);
  margin: 0;
  font-weight: 600;
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
  color: var(--text-main);
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
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-main);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 0.95rem;
  transition: border-color 0.2s;
  font-family: inherit;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(125, 41, 35, 0.1);
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
  background: var(--bg-main);
}

.modal-footer {
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: inherit;
}

.btn-cancel {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--card-border);
}

.btn-cancel:hover {
  background: var(--bg-main);
  color: var(--text-main);
}

.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 2px 8px rgba(125, 41, 35, 0.2);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(125, 41, 35, 0.3);
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
  animation: modalSlideIn 0.3s ease-out;
}

.modal-fade-leave-active .modal-content {
  animation: modalSlideIn 0.3s reverse;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 5px;
}

.time-select {
  padding: 10px 8px;
  text-align: center;
  appearance: none;
  cursor: pointer;
  flex: 1;
}

.colon {
  font-weight: bold;
  color: var(--text-main);
  font-size: 1.1rem;
}

.time-select option:disabled {
  color: #CBD5E1;
}

.time-select option {
  background-color: white;
  color: var(--text-main);
}

@media (max-width: 600px) {
  .top-bar { padding: 0 12px; }
  .top-bar-inner { height: auto; min-height: 56px; padding: 8px 0; }
  .brand-logo { height: 28px; }
  .brand-text { font-size: 0.9rem; white-space: nowrap; }
  .nav-btn span { display: none; }
  .nav-btn { padding: 6px 10px; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
