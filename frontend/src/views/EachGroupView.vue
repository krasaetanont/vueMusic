<script setup>
import { reactive, onMounted, defineExpose, inject, defineProps } from 'vue';
import axios from 'axios';
import Song from '@/components/Song.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const itemId = route.params.id;
const itemType = route.path.split('/')[1];

const playSong = inject('playSong');

const state = reactive({
    songs: [],
    isLoading: true
});

const fetchSongs = async () => {
    state.isLoading = true;
    try {
        const response = await axios.get(`http://localhost:3000/api/${itemType}/${itemId}`);
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

const handlePlaySong = (song) => {
    if (playSong) {
        playSong(song);
    }
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
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold mb-4">My Music Library</h2>
      <routerLink 
        to="/upload" 
        class="pi pi-plus text-2xl float-right" 
      >
      </routerLink>
    </div>
    
    <div v-if="state.isLoading" class="loading text-[var(--color-muted)] text-center py-8">
      Loading songs...
    </div>
    
    <div v-else-if="state.songs.length === 0" class="empty-state text-[var(--color-muted)] text-center py-8">
      No songs yet. Upload your first song!
    </div>
    
    <div v-else class="space-y-1">
      <Song 
        v-for="songItem in state.songs" 
        :key="songItem.id" 
        :song="songItem"
        @play="handlePlaySong"
      />
    </div>
  </div>
</template>