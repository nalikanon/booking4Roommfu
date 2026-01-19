<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Swal from 'sweetalert2';

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

const handleSelect = async (room) => {
  console.log('Room clicked:', room);
  if (room.id === 1) {
    try {
      console.log('Attempting to open SweetAlert');
      const result = await Swal.fire({
        title: '<h2 style="color: #4f46e5; margin: 0;">Search Classrooms</h2>',
        html: `
          <div style="text-align: left; display: flex; flex-direction: column; gap: 15px;">
            <div>
              <label style="display: block; margin-bottom: 5px; color: #64748b; font-weight: 500;">Select Date</label>
              <input id="swal-date" class="swal2-input" type="date" style="margin: 0; width: 100%; box-sizing: border-box;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; color: #64748b; font-weight: 500;">Time From</label>
                <input id="swal-timefrom" class="swal2-input" type="time" style="margin: 0; width: 100%; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; color: #64748b; font-weight: 500;">Time To</label>
                <input id="swal-timeto" class="swal2-input" type="time" style="margin: 0; width: 100%; box-sizing: border-box;">
              </div>
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px; color: #64748b; font-weight: 500;">Capacity (People)</label>
              <input id="swal-capacity" class="swal2-input" type="number" min="1" value="40" style="margin: 0; width: 100%; box-sizing: border-box;">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Search Available Rooms',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#d33',
        customClass: {
          popup: 'glass-popup'
        },
        preConfirm: () => {
          const date = document.getElementById('swal-date').value;
          const timefrom = document.getElementById('swal-timefrom').value;
          const timeto = document.getElementById('swal-timeto').value;
          const capacity = document.getElementById('swal-capacity').value;

          if (!date || !timefrom || !timeto) {
            Swal.showValidationMessage('Please fill in all fields');
            return false;
          }

          return {
            roomdate: date,
            timefrom: timefrom,
            timeto: timeto,
            roomcapacity: capacity
          };
        }
      });

      if (result.value) {
        console.log('Navigating with values:', result.value);
        router.push({
          path: "/classroom-list",
          query: result.value,
        });
      }
    } catch (error) {
      console.error('SweetAlert error:', error);
      alert('Error opening popup: ' + error.message);
    }
  } else {
    alert(`You selected: ${room.title} (Feature coming soon)`);
  }
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
</style>
