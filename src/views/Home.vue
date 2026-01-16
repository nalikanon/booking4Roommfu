<template>
  <div class="home-container">
    <h1>Welcome to Booking4Room</h1>
    <p>Please login to continue.</p>
    <router-link to="/login" class="btn-primary">Go to Login</router-link>
  </div>
</template>

<style scoped>
.home-container {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.btn-primary {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.8rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: scale(1.05);
}
</style>
