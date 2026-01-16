<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  auth, 
  googleProvider, 
  facebookProvider, 
  githubProvider 
} from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const router = useRouter();
const errorMessage = ref('');
const loading = ref(false);

// Dummy Credentials Data
const email = ref('');
const password = ref('');

const handleLogin = async (provider) => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('User signed in:', user);
    router.push('/');
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
const loginWithFacebook = () => handleLogin(facebookProvider);
const loginWithGithub = () => handleLogin(githubProvider);

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
    // Simple dummy check (optional: remove specific check to allow any non-empty input)
    if (email.value === 'user@example.com' && password.value === 'password') {
      console.log('Dummy login successful');
      router.push('/');
    } else {
       // For better UX in testing, let's allow ANY input for now, 
       // but strictly speaking a dummy usually implies specific test creds.
       // Let's stick to specific creds or just default success to make it easy?
       // User asked "what is user/pass", implying they expect one.
       // But they also said "make dummy", so I will allow ANY, but logging a specific one is helpful.
       
       // actually, let's just make it always succeed for ANY input for "mock" purposes
       // unless they specifically wanted a "check".
       // Re-reading: "What is email/pass" -> "Make dummy". 
       // I'll make it work with specific credentials and show them on screen or in alert to guide them.
       // Just making it always work is easiest.
       
       console.log('Dummy login successful with:', email.value);
       router.push('/');
    }
  }, 1500);
};

</script>

<template>
  <div class="login-container">
    <div class="glass-card">
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

        <button @click="loginWithFacebook" :disabled="loading" class="social-btn facebook">
          <svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span class="btn-text">Sign in with Facebook</span>
        </button>

        <button @click="loginWithGithub" :disabled="loading" class="social-btn github">
          <svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          <span class="btn-text">Sign in with GitHub</span>
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
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.glass-card {
  width: 100%;
  max-width: 400px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 24px;
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
  background: #151e32; /* Match approximate bg for cut-out effect logic, transparent is better but tricky with line */
  background: transparent;  /* Actually better to just put text over line with background clip? No, simple bg works if solid, but we have gradient. */
  /* Using padding to clear line? */
  background-color: #162032; /* Tweak to match dark theme roughly, or just clear */
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
