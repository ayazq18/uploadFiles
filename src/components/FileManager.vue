<template>
  <div class="main">
    <div class="file-manager">
      <h2 class="title">File Manager</h2>

      <button class="btn btn-danger" @click='Logout'>
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>

      <!-- File Upload Section -->
      <input type="file" ref="fileInput" @change="handleFileChange" class="file-input" />
      <label for="file-input" class="file-label">
        <!-- SVG Icon for Upload -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100px" height="100px">
          <path d="M24 12H8C6.9 12 6 12.9 6 14v36c0 1.1 0.9 2 2 2h48c1.1 0 2-0.9 2-2V26H30l-6-6z" fill="#ffab40" />
          <path d="M32 42v-18M32 42l-6-6M32 42l6-6" stroke="#007bff" stroke-width="3" stroke-linecap="round"
            stroke-linejoin="round" />
          <circle cx="32" cy="32" r="30" fill="none" stroke="#81d4fa" stroke-width="4" />
        </svg>

      </label>

      <div v-if="newFile" class="selected-file-name">{{ newFile.name }}</div>
      <button @click="uploadFile" class="upload-button">
        <i class="fas fa-upload"></i> Upload
      </button>
    </div>

    <!-- Folder Creation Section -->
    <div class="folder-create">
      <input type="text" v-model="newFolderName" placeholder="New Folder Name" class="inputFiled" />
      <button @click="createFolder" :disabled="!newFolderName" class="create-folder-button">
        Create Folder
      </button>
    </div>
    <!-- Files and Folders Section -->
    <div v-if="folders.length > 0 || files.length > 0">
      <h2 class="title">File List</h2>

      <ul class="file-list" @dragover.prevent @drop="dropFile">
        <li v-for="file in files" :key="file.id" class="file-item" @mouseenter="animateItem($event)"
          @mouseleave="resetItem($event)" draggable="true" @dragstart="startDrag(file)">
          <h4 class="file-name">{{ file.name }} ({{ formatFileSize(file.size) }})</h4>
          <div>
            <button @click="downloadFile(file)" class="download-button dwnBtn">
              <i class="fas fa-download"></i>
            </button>
            <button @click="deleteFile(file.id)" class="delete-button delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </li>
        <h1 v-if="files.length == 0" style="color: black;">No files</h1>
      </ul>

      <div>
        <h3>Folders</h3>
        <ul class="folder-list">
          <li v-for="folder in folders" :key="folder.id" class="folder-item" @dragover.prevent
            @dragleave="folderDragLeave" @drop="dropFileInFolder(folder)">
            <div class="folder-container">
              <div class="folder-iconName">
                <i class="material-icons" color="yellow">folder</i>
                <span class="folder-name">{{ folder.name }}</span>
              </div>
              <div class="folder-actions">
                <button @click="downloadFolder(folder)" class="action-button dwnBtn" title="Download Folder">
                  <i class="material-icons">cloud_download</i>
                </button>
                <button @click="deleteFolder(folder.id)" class="action-button delete" title="Delete Folder">
                  <i class="material-icons">delete</i>
                </button>
              </div>
            </div>
            <ul class="folder-files" v-if="folder.files && Array.isArray(folder.files) && folder.files.length > 0">
              <li v-for="file in folder.files" :key="file.id" class="file-item folder-file-item" draggable="true"
                @dragstart="startDrag(file, folder)" @dragend="clearDraggedFile">
                <span class="file-name">{{ file.name }} ({{ formatFileSize(file.size) }})</span>
                <div class="file-actions">
                  <button @click="downloadFile(file)" class="action-button dwnBtn" title="Download">
                    <i class="material-icons">cloud_download</i>
                  </button>
                  <button @click="removeFileFromFolder(file)" class="action-button delete" title="Delete">
                    <i class="material-icons">delete</i>
                  </button>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>

    </div>
    <div v-else class="empty">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48px" height="48px">
        <path d="M10 4H2v16h20V8H12l-2-4z" fill="#ffab40" />
      </svg>
      <p>No files or folders created yet.</p>

    </div>
  </div>
</template>

<script>
import { updatePath } from '@/api/fileApi';
import axios from 'axios';
import { gsap } from 'gsap';
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

export default {
  data() {
    return {
      files: [],
      folders: [],
      newFile: null,
      draggedFile: null,
      newFolderName: "",
      sourceFolder: null,
    };
  },
  methods: {

    async fetchFiles() {
      try {
        const mail = await this.getCookie('lznk');

        const response = await axios.get('http://localhost:5000/api/files/fetchAll', { params: { mail } });
        const data = response.data;
        this.files = [];

        if (data && Array.isArray(data)) {
          data.forEach((file) => {
            const { _id, name, size, url, pathref } = file;

            if (pathref === "file") {
              this.files.push({ name, size, source: url, id: _id });
            } else {
              let folder = this.folders.find((f) => f.name === pathref);
              if (!folder) {
                folder = { id: Date.now(), name: pathref, files: [] };
                // console.log('abs------>', folder)
                this.folders.push(folder);
              }
              folder.files.push({ name, size, source: url, id: _id });
            }
          });
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    },

    async fetchFolders() {
      try {
        const mail = await this.getCookie("lznk")
        const response = await axios.get('http://localhost:5000/api/folders/fetchAll', { params: { mail } });
        const data = response.data;
        this.folders = [];

        if (Array.isArray(data)) {
          this.folders = data.map((folder) => {
            const { files, _id, ...data } = folder;

            const updatedFiles = files.map((file) => {
              const { _id, ...rest } = file;
              return { id: _id, ...rest };
            });

            return { ...data, files: updatedFiles, id: _id };
          });
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    },

    handleFileChange(event) {
      this.newFile = event.target.files[0];
    },

    async uploadFile() {
      if (!this.newFile) {
        console.log('No file selected');
        return;
      }

      const mail = await this.getCookie('lznk')

      if (mail) {
        const formData = new FormData();
        formData.append('file', this.newFile);
        formData.append('mail', mail);

        await axios.post('http://localhost:5000/api/files/upload', formData);
        await this.fetchFiles();
        await this.fetchFolders();
        this.newFile = null
      } else {
        alert('Please Login First')
      }

    },

    async deleteFile(fileId) {
      let fileToDelete = this.files.find(file => file.id === fileId);
      let foundInFolder = false;  // Flag to check if the file is found in a folder

      // If the file is not found in the file list, look for it in folders
      if (!fileToDelete) {
        for (const folder of this.folders) {
          fileToDelete = folder.files.find(file => file.id === fileId);
          if (fileToDelete) {
            foundInFolder = true;  // Set the flag to indicate it's in a folder
            break;  // Exit the loop once the file is found in a folder
          }
        }
      }

      // If the file is found in either the file list or folders
      if (fileToDelete) {
        try {
          // Send a request to delete the file on the server
          await axios.delete(`http://localhost:5000/api/files/${fileId}`);

          // Remove the file from the files list if it's there
          if (!foundInFolder) {
            this.files = this.files.filter(file => file.id !== fileId);
          }

          // If found in a folder, remove it from that folder
          if (foundInFolder) {
            this.folders.forEach(folder => {
              folder.files = folder.files.filter(file => file.id !== fileId);
            });
          }

          // Optionally, refresh the data
          this.fetchFiles();
          this.fetchFolders();
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      } else {
        // Only log the error if the file is truly not found in either list or folder
        console.error('File not found for deletion');
      }
    },

    async downloadFile(file) {
      window.location.href = file.source || file.url;
    },

    async createFolder() {
      if (!this.newFolderName.trim()) return;
      const mail = await this.getCookie('lznk')
      const data = {
        name: this.newFolderName,
        mail: mail,
      }
      try {
        if (mail) {
          const response = await axios.post('http://localhost:5000/api/folders/create',
            data);

          this.folders.push(response.data);
          this.newFolderName = '';
        } else {
          alert('Please Login First')
        }
      } catch (error) {
        console.error("Error creating folder:", error);
      }
    },

    async deleteFolder(folderId) {
      await axios.delete(`http://localhost:5000/api/folders/${folderId}`);
      await this.fetchFolders();
    },

    async downloadFolder(folder) {
      try {
        const response = await axios.get(`http://localhost:5000/api/folders/folder-zip/${folder.id}`, {
          responseType: 'blob',
        });
        if (response && response.data) {
          const blob = response.data;

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(
            new Blob([blob], { type: "application/zip" })
          );

          link.download = `${folder.name}.zip`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.error("Failed to download folder");
        }
      } catch (error) {
        console.error("Error downloading folder:", error);
      }
    },

    startDrag(file, sourceFolder) {
      this.draggedFile = file;
      this.sourceFolder = sourceFolder;
      gsap.to(event.target, { scale: 1.1, duration: 0.2 });
    },

    clearDraggedFile() {
      this.draggedFile = null;
      this.sourceFolder = null;
    },

    async dropFile() {
      try {
        if (this.draggedFile) {
          const mail = await this.getCookie("lznk")
          console.log(this.draggedFile.id, this.sourceFolder.id)
          if (this.draggedFile.pathref == "file") {
            alert("We can't move file to self List");
          }
          console.log(this.sourceFolder)

          await updatePath(
            this.draggedFile.id,
            "file",
            this.draggedFile.pathref,
            "file",
            null,
            this.sourceFolder.id,
            mail
          );
          this.fetchFiles();
          this.fetchFolders();
          this.clearDraggedFile();
        }
      } catch (error) {
        console.error(error)
      }

    },

    // Drop file back into the main files list (outside folders)
    async dropFileInFolder(targetFolder) {
      try {
        if (this.draggedFile) {
          const mail = await this.getCookie("lznk")
          if (this.draggedFile.pathref != targetFolder.name) {
            const fileFolder = this.files.some(
              (file) => file.id === this.draggedFile.id
            );

            if (fileFolder) {
              console.log("ifFilefolder")
              await updatePath(
                this.draggedFile.id,
                targetFolder.name,
                "file",
                targetFolder.name,
                targetFolder.id, //toid
                mail
              );
            } else {
              console.log("elseFilefolder", this.sourceFolder.id)
              await updatePath(
                this.draggedFile.id,
                targetFolder.name,
                this.draggedFile.pathref,
                targetFolder.name,
                targetFolder.id, //toid
                this.sourceFolder.id, //fromid
                mail
              );
            }

            this.fetchFiles();
            this.fetchFolders();
            this.clearDraggedFile();
          } else {
            alert("We can't move file to self folder");
          }
        }
      } catch (error) {
        if (
          error.response &&
          error.response.status === 404 &&
          error.response.data.message == "From Path and To Path Can't be same"
        ) {
          alert("We can't move file to self folder");
        } else {
          console.log("An error occurred:", error.message);
        }
      }
    },

    async removeFileFromFolder(file) {
      try {
        await axios.delete(`http://localhost:5000/api/folders/file/${file.id}/${file.pathref}`);
        this.fetchFolders()
      } catch (err) {
        console.error('Error removing file from folder:', err);
      }
    },


    // async fetchUser() {
    //   try {
    //     const response = await axios.delete(`http://localhost:5000/auth/current_user`);
    //     console.log('------>', response)
    //   } catch (err) {
    //     console.error('Error removing file from folder:', err);
    //   }
    // },

    async Logout() {
      try {
        Cookies.remove("lznk");
        this.checkAuth();
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },
    async getUserData() {
      try {
        const response = await axios.get("http://localhost:5000/auth/session", {
          withCredentials: true,
        });
        this.setCookie("lznk", response.data.user.email);
      } catch (error) {
        console.error("Error deleting file:", error);
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

    async checkAuth() {
      setTimeout(async () => {
        const data = await this.getCookie("lznk")
        if (data == "No token found") {
          this.$router.push('/');
        }
      }, 2000);
    },

    formatFileSize(size) {
      const kb = size / 1024;
      return kb < 1024 ? `${kb.toFixed(2)} KB` : `${(kb / 1024).toFixed(2)} MB`;
    },

    animateItem(event) {
      gsap.to(event.target, { scale: 1.05 });
    },

    resetItem(event) {
      gsap.to(event.target, { scale: 1 });
    },
  },
  mounted() {
    this.fetchFiles();
    this.fetchFolders();
    this.getUserData();
    this.checkAuth();

  },
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
}

.main {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  text-align: center;
  color: #343a40;
  font-size: 1.5rem;
}

.file-input {
  margin-bottom: 10px;
}

.selected-file-name {
  margin: 10px 0;
  font-size: 16px;
  color: #007bff;
  text-align: center;
}

.upload-button {
  width: 100%;
  padding: 12px;
  font-size: 18px;
}

.upload-button:hover {
  background-color: #0056b3;
}

.file-list {
  list-style-type: none;
  padding: 0;
  min-height: 100px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.file-item {
  width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
}

.file-item:hover {
  background-color: #df307938;
}

.folder-file-item {
  background-color: antiquewhite;
}

.delete-button,
.download-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s;
}

.delete-button:hover,
.download-button:hover {
  transform: scale(1.1);
}

.file-actions {
  display: flex;
  gap: 10px;
}

.folder-list {
  list-style: none;
  padding: 0;
}

.folder-item {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 10px 0;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.folder-name {
  font-size: 1.2em;
  font-weight: bold;
  margin-right: 20px;
}

.folder-container {
  /* background-color: red; */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px
}

.folder-iconName {
  display: flex;
  align-items: center;
  gap: 10px;
}

.folder-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.action-button {
  /* background-color: #007bff; */
  color: black;
  border: none;
  border-radius: 5px;
  padding: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.material-icons {
  font-size: 20px;
}

.action-button:hover {
  background-color: #0056b3;
  color: #fff;
}

.file-name {
  flex: 1;
}

.file-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  /* Space between buttons */
}

.dwnBtn {
  color: #00a67d;
}

.delete {
  color: #dc3545;
  /* Red background for delete */
}

.delete:hover {
  color: #c82333;
  /* Darker red on hover */
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.folder-create{
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.create-folder-button, .upload-button{
  text-wrap: nowrap;
  padding: 10px;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 17px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.inputFiled {
  border: 1px solid #dfe6e9;
  height: 40px;
  width: 70%;
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
</style>
