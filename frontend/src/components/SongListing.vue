<script setup>
import { reactive, onMounted, defineExpose } from 'vue';
import axios from 'axios';
import song from '@/components/Song.vue';

const state = reactive({
    songs: [],
    isLoading: true
});

const fetchSongs = async () => {
    state.isLoading = true;
    try {
        const response = await axios.get(`http://localhost:3000/api/musics`);
        state.songs = response.data;
    } catch (error) {
        console.error('Error fetching song details:', error);
    } finally {
        state.isLoading = false;
    }
};

const refreshSongs = () => {
    fetchSongs();
};

onMounted(() => {
    fetchSongs();
});

// Expose method to parent component
defineExpose({
    refreshSongs
});
</script>

<template>
  <div class="w-full p-4">
    <h2 class="text-2xl font-bold">My Music Library</h2>
    
    <div v-if="state.isLoading" class="loading">
      Loading songs...
    </div>
    
    <div v-else-if="state.songs.length === 0" class="empty-state">
      No songs yet. Upload your first song!
    </div>
    
    <div v-else class="m-2">
      <song 
        v-for="songItem in state.songs" 
        :key="songItem.id" 
        :song="songItem" 
        class="mb-4"
      />
    </div>
  </div>
</template>