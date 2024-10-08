<template>
  <div class="login-container">
    <div class="logo">
      <img src="@/assets/logo.png" alt="Website Logo" />
    </div>
    <h2>Login</h2>
    <button class="btn btn-primary" @click="loginWithGoogle">
      <i class="fab fa-google"></i> Login with Google
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    loginWithGoogle() {
      // Redirect to the backend route for Google authentication
      window.location.href = 'http://localhost:5000/auth/google'; // Backend route
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* Full height of the viewport */
  background-color: #f7f7f7; /* Light background color */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.logo img {
  width: 150px; /* Adjust logo size */
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333; /* Dark text color */
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  background-color: #41b883;
  color: #f7f7f7;
  font-weight: 700;
}

.btn i {
  margin-right: 10px; /* Space between icon and text */
}
</style>
