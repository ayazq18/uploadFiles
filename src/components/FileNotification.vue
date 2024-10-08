<template>
  <div class="notifications">
    <!-- Progress bar container -->
    <div v-if="percentage" class="progress-container">
      <div class="progress-bar" :style="{ width: `${percentage}%` }"></div>
      <!-- <p v-if="percentage" style="font-size: 15px;">{{ `${message}: ${percentage}%` }}</p> -->
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";

export default {
  data() {
    return {
      message: "",
      percentage: "",
      socket: null,
    };
  },
  mounted() {
    this.initializeSocket();
  },
  methods: {
    initializeSocket() {
      this.socket = io(process.env.VUE_APP_API_URL, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      });

      this.socket.on("upload-progress-file", (data) => {
        this.message = "File Uploading"
        this.percentage = data;
        if (data == 100) {
          setTimeout(() => {
            this.percentage = "";
          }, 1000);
        }
      });
      this.socket.on("upload-progress-folder", (data) => {
        this.message = "Folder Uploading"
        this.percentage = data;
        if (data == 100) {
          setTimeout(() => {
            this.percentage = "";
          }, 1000);
        }
        console.log(data);
      });
    },

  },
};
</script>

<style scoped>
.progress-container {
  width: 50%;
  background-color: #f3f3f3;
  border-radius: 10px;
  height: 15px;
  margin-top: 10px;
}

/* Style the actual progress bar */
.progress-bar {
  height: 100%;
  background-color: #4caf50;
  width: 0%;
  border-radius: 10px;
  transition: width 0.4s ease;
}
</style>