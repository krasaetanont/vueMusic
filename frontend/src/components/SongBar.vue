<script setup>
import { reactive, defineProps, onMounted } from 'vue';
import axios from 'axios';
const state = reactive({
    songs: [],
    isLoading: true
});


onMounted( async () => {
    // Example: Fetch additional song details if needed
    try {
        const response = await axios.get(`http://localhost:3000/api/musicFiles`);
        state.songs = response.data;
    } catch (error) {
        console.error('Error fetching song details:', error);
    } finally {
        state.isLoading = false;
    }
})
</script>

<template>
  <div class="song-bar">
    <div v-if="state.isLoading">Loading songs...</div>
    <div v-else>
      <div v-for="song in state.songs" :key="song.id" class="song-item">
        <h3>{{ song.title }}</h3>
        <p>Artist: {{ song.artist }}</p>
        <p>Genre: {{ song.genre }}</p>
      </div>
    </div>
  </div>
</template>