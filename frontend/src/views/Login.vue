<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  auth, 
  googleProvider 
} from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const router = useRouter();
const errorMessage = ref('');
const loading = ref(false);
const isLoggedIn = ref(false); // State to switch between login and dashboard

// Dummy Credentials Data
const email = ref('');
const password = ref('');

// Room Data
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
  // Future implementation: navigate to booking detail
};

const handleLogin = async (provider) => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('User signed in:', user);
    isLoggedIn.value = true; // Switch view to Dashboard
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/api-key-not-valid-please-pass-a-valid-api-key') {
      errorMessage.value = 'Configuration Error: Please update src/firebase.js with valid keys.';
    } else {
      errorMessage.value = error.message;
    }
  } finally {
    loading.value = false;
  }
};

const loginWithGoogle = () => handleLogin(googleProvider);


// Dummy Login Handler
const loginWithEmail = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  // Simulate network request
  setTimeout(() => {
    loading.value = false;
    // Always succeed for dummy
    console.log('Dummy login successful with:', email.value);
    isLoggedIn.value = true; // Switch view to Dashboard
  }, 1500);
};

</script>

<template>
  <div class="page-container">
    <!-- View 1: Login Form -->
    <div v-if="!isLoggedIn" class="login-wrapper">
      <div class="glass-card login-card">
        <div class="header">
          <h1>Welcome Back</h1>
          <p class="subtitle">Sign in to continue to Booking4Room</p>
        </div>

        <div class="error-alert" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <!-- Social Login Buttons -->
        <div class="social-buttons">
          <button @click="loginWithGoogle" :disabled="loading" class="social-btn google">
            <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span class="btn-text">Sign in with Google</span>
          </button>


        </div>
        
        <div class="divider">
          <span>OR</span>
        </div>

        <!-- Traditional Login (Dummy) -->
        <form class="form-group" @submit.prevent="loginWithEmail">
            <input 
              v-model="email" 
              type="email" 
              placeholder="Email (e.g., user@example.com)" 
              class="input-field" 
              :disabled="loading"
            />
            <input 
              v-model="password" 
              type="password" 
              placeholder="Password (any)" 
              class="input-field" 
              :disabled="loading"
            />
            <button type="submit" class="login-btn" :disabled="loading">
              <span v-if="!loading">Log In</span>
              <span v-else>Logging in...</span>
            </button>
        </form>
      </div>
    </div>

    <!-- View 2: Dashboard/Room Select -->
    <div v-if="isLoggedIn" class="dashboard-view-wrapper">
       <button class="logout-btn" @click="isLoggedIn = false">Logout</button>
       
       <div class="dashboard-container">
          <div class="header-section">
            <div class="header-row">
                <h1>Select a Room Type</h1>
            </div>
            <p>Choose the type of room you would like to book today.</p>
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
    </div>
  </div>
</template>

<style scoped>
/* Page & Common */
.page-container {
  width: 100%;
}

/* Wrapper to hold fixed elements if needed, though button is fixed to viewport */
.dashboard-view-wrapper {
  /* No transform here to keep fixed button relative to viewport if it was inside, 
     but we are keeping it inside this wrapper. 
     If this wrapper has no transform, we are good. */
}

/* --- Login Styles --- */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
  min-height: 80vh;
}

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
  animation: fadeIn 0.8s ease-out;
}

.header {
  margin-bottom: 30px;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 10px;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.95rem;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.social-btn:active {
  transform: translateY(0);
}

.social-btn.github {
  background: #24292e;
  color: white;
}

.social-btn.facebook {
   background: #1877F2;
   color: white;
}
.social-btn.facebook .icon {
  fill: white;
}


.divider {
  margin: 25px 0;
  position: relative;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider span {
  position: relative;
  background: transparent;
  padding: 0 10px;
  color: var(--text-muted);
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
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
}

.input-field:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.1);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, #818cf8 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.error-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

/* --- Dashboard / Room Grid Styles --- */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

.header-section {
  margin-bottom: 50px;
  position: relative;
}

.header-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.header-section h1 {
  font-size: 3rem;
  margin-bottom: 0;
}

.header-section p {
  color: var(--text-muted);
  font-size: 1.1rem;
}




.logout-btn {
  position: fixed;
  top: 30px;
  right: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 24px;
  border-radius: 30px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: background 0.3s, border-color 0.3s, color 0.3s, transform 0.3s;
  z-index: 1000;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
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
  .header-section h1 {
      font-size: 2rem;
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

.room-card p {
  color: var(--text-muted);
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
