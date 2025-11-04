<script setup>
import { reactive, onMounted, defineExpose, defineProps } from 'vue';
import axios from 'axios';
import ListCard from '@/components/ListCard.vue';

defineProps({
  limit: Number
})

const state = reactive({
    playlists: [],
    isLoading: true
});

const fetchPlaylists = async () => {
    state.isLoading = true;
    try {
        const response = await axios.get(`/api/playlists`);
        state.playlists = response.data;
        // console.log('Fetched playlists:', state.playlists);
    } catch (error) {
        console.error('Error fetching song details:', error);
    } finally {
        state.isLoading = false;
    }
};

const refreshPlaylists = () => {
    fetchPlaylists();
};

onMounted(() => {
    fetchPlaylists();
});

// Expose method to parent component
defineExpose({
    refreshPlaylists
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">My Playlist Library</h2>
      <routerLink 
        to="/add/playlist" 
        class="pi pi-plus text-2xl" 
      >
      </routerLink> 
    </div>
    
    <div v-if="state.isLoading" class="loading">
      Loading playlists...
    </div>
    
    <div v-else-if="state.playlists.length === 0" class="empty-state">
      No playlist yet. Upload your first playlist!
    </div>
    
    <div v-else class="m-2">
      <ListCard type="playlist"
        v-for="playlist in state.playlists.slice(0, limit || state.playlists.length)"
        :item="playlist"
      />
    </div>
  </div>
</template>