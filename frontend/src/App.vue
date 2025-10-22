<script setup>
import { ref } from 'vue';
import SongBar from './components/SongBar.vue';
import Player from './components/player.vue';
import Upload from './components/upload.vue';

const showUpload = ref(false);
const songBarRef = ref(null);

const openUpload = () => {
  showUpload.value = true;
};

const closeUpload = () => {
  showUpload.value = false;
};

const handleUploaded = () => {
  // Refresh the song list after upload
  if (songBarRef.value) {
    songBarRef.value.refreshSongs();
  }
};
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Music Player</h1>
      <button class="upload-btn" @click="openUpload">
        Upload Music
      </button>
    </header>
    
    <SongBar ref="songBarRef" />
    <Player />
    
    <Upload 
      v-if="showUpload" 
      @close="closeUpload" 
      @uploaded="handleUploaded"
    />
  </div>
</template>
