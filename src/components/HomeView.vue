<template>
    <div class="dashboard">
        <FileNotification />
        <FileManager />
    </div>
</template>

<script>
import FileNotification from "../components/FileNotification.vue";
import FileManager from "./FileManager.vue";

export default {
    components: { FileNotification, FileManager },
};
</script>