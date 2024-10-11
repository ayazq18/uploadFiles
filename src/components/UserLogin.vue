<template>
  <div style="height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center;">
    <div class="loginContainer">
      <div class="form-wrapper" :class="{ 'shift-left': !isLogin }">
        <!-- Login Form -->
        <div class="form-container" v-if="isLogin">
          <h1>Login</h1>
          <form @submit.prevent="loginUser">
            <div class="nameDiv">
              <label for="email">Email:</label>
              <div class="input-wrapper">
                <input type="email" v-model="email" id="loginEmail" class="inputFiled" required />
              </div>
            </div>
            <div class="nameDiv">
              <label for="password">Password:</label>
              <div class="input-wrapper">
                <input type="password" v-model="password" id="loginPassword" class="inputFiled" required />
              </div>
            </div>
            <button class="submit-button" type="submit">Login</button>
          </form>
        </div>

        <!-- Register Form -->
        <div class="form-container" v-if="!isLogin">
          <h1>Register</h1>
          <form @submit.prevent="registerUser">
            <div class="nameDiv">
              <label for="name">Name:</label>
              <div class="input-wrapper">
                <input type="text" v-model="name" id="registerName" class="inputFiled" required />
              </div>
            </div>
            <div class="nameDiv">
              <label for="email">Email:</label>
              <div class="input-wrapper">
                <input type="email" v-model="email" id="registerEmail" class="inputFiled" required />
              </div>
            </div>
            <div class="nameDiv">
              <label for="password">Password:</label>
              <div class="input-wrapper">
                <input type="password" v-model="password" id="registerPassword" class="inputFiled" required />
              </div>
            </div>
            <button class="submit-button" type="submit">Register</button>
          </form>
        </div>
      </div>

      <!-- Toggle Link -->
      <div class="toggle-link">
        <button v-if="!isLogin" @click="loginWithGoogle" class="submit-button google-button">Register with
          Google</button>
        <p>
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <a href="#" @click.prevent="toggleForm">
            {{ isLogin ? "Register" : "Login" }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.css';
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      isLogin: true,
    };
  },
  methods: {
    loginWithGoogle() {
      window.location.href = 'https://uploadfiles-backened.onrender.com/auth/google';
    },
    toggleForm() {
      this.isLogin = !this.isLogin;
      this.clearForm();
    },
    clearForm() {
      this.name = "";
      this.email = "";
      this.password = "";
    },
    async registerUser() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(this.email)) {
        alert("Please enter a valid email address");
        return;
      }
      try {
        const response = await axios.post(
          "https://uploadfiles-backened.onrender.com/auth/user/register",
          {
            Name: this.name,
            email: this.email,
            password: this.password,
          }
        );
        if (response?.status === 200) {
          this.toggleForm();
          alert("Successfully Registered , now Please Login");
        }
      } catch (error) {
        if (error.response) {
          console.error("Error during registration:", error.response.data);
          alert("User already exists");
        } else {
          console.error("Error during registration:", error);
          alert("An error occurred. Please try again later.");
        }
      }
    },
    async loginUser() {
      try {
        const response = await axios.post("https://uploadfiles-backened.onrender.com/auth/user/login", {
          email: this.email,
          password: this.password,
        });
        if (response) {
          this.setCookie("lznk", response.data.user.email);
          this.$router.push('/Dashboard');
        }
      } catch (error) {
        if (error.response.data.message == "User Not Found") {
          console.error("Error during login:", error.response);
          alert("User Not Found Pls Register First");
        }
        else if (error.response) {
          console.error("Error during login:", error.response.data);
          alert("Please enter valid credentials");
        } else {
          console.error("Error during login:", error);
          alert("An error occurred. Please try again later.");
        }
      }
    },
    async setCookie(name, value) {
      const stringValue = JSON.stringify(value);
      const encryptedCookie = CryptoJS.AES.encrypt(
        stringValue,
        process.env.VUE_APP_SECRET_KEY
      ).toString();
      Cookies.set(name, encryptedCookie, { secure: true, sameSite: "Strict" });
    },

    async getCookie(name) {
      const encryptedCookie = Cookies.get(name);
      if (encryptedCookie) {
        const bytes = CryptoJS.AES.decrypt(
          encryptedCookie,
          process.env.VUE_APP_SECRET_KEY
        );
        const originalvalue = bytes.toString(CryptoJS.enc.Utf8);
        const parseValue = JSON.parse(originalvalue);
        return parseValue;
      } else {
        return "No token found";
      }
    },
  },
};
</script>

<style>
.loginContainer {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background: linear-gradient(135deg, #edf2f4, #ffffff);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow-x: hidden;
}

.form-wrapper {
  display: flex;
  width: 400px;
  /* transition: transform 0.6s ease-in-out; */
}

.form-container {
  width: 100%;
  margin: 0 auto;
  /* border: 1px solid red; */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container form {
  margin: 0 auto;
}

/* .shift-left {
  transform: translateX(-50%);
} */

h1 {
  text-align: center;
  font-family: "Poppins", sans-serif;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: bold;
}

.nameDiv {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

label {
  font-size: 14px;
  color: #34495e;
  margin-bottom: 5px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper i {
  position: absolute;
  left: 10px;
  top: 12px;
  color: #3498db;
}

.inputFiled {
  border: 1px solid #dfe6e9;
  height: 40px;
  width: 80%;
  border-radius: 25px;
  padding-left: 35px;
  font-size: 16px;
  /* transition: border-color 0.3s; */
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.05);
}

.inputFiled:focus {
  border-color: #3498db;
  outline: none;
}

.submit-button {
  padding: 12px;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 17px;
  font-weight: bold;
  cursor: pointer;
  /* transition: background-color 0.3s ease; */
  margin-top: 20px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.submit-button:hover {
  background: #2c3e50;
}

.google-button {
  background: #db4437;
}

.google-button:hover {
  background: #c0392b;
}

.toggle-link {
  text-align: center;
  margin-top: 5px;
}

a {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #2c3e50;
}
</style>
