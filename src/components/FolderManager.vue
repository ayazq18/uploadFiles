<template>
    <div>
        <h2>Create Folder</h2>
        <input v-model="folderName" placeholder="Folder Name" />
        <button @click="createFolder">Create Folder</button>

        <ul class="file-list">
            <h2 class="title">Folder List</h2>

            <li v-for="folder in folders" :key="folder._id" class="file-item">

                <h4 class="file-name">{{ folder.name }}</h4>

                <div>
                    <button @click="deleteFolder(folder._id)" class="delete-button">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button @click="downloadFolder(folder._id)" class="download-button">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            folderName: '',
            fileName: '',
            fileUrl: '',
            selectedFolder: null,
            folders: [] // Fetch this from your backend
        };
    },
    methods: {
        
        async createFolder() {
            const response = await axios.post('https://upload-files-backened.vercel.app/api/folders/create', {
                name: this.folderName,
                parentFolderId: this.selectedFolder // optional for subfolders
            });
            this.folders.push(response.data);
            this.folderName = '';
        },

        async fetchFolders() {
            const response = await axios.get('https://upload-files-backened.vercel.app/api/folders/fetchAll'); 
            this.folders = response.data;
        },
        async deleteFolder(folderId) {
            await axios.delete(`https://upload-files-backened.vercel.app/api/folders/${folderId}`);
            this.fetchFolders();
        },
        async downloadFolder(folderId) {
            try {
                const response = await axios.get(`https://upload-files-backened.vercel.app/api/folders/download/${folderId}`);
                window.location.href = response.data.url;
            } catch (err) {
                console.error('Error downloading folder:', err);
            }
        }
    },
    mounted() {
        this.fetchFolders();
    }
};
</script>
