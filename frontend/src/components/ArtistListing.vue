<script setup>
import { reactive, onMounted, defineExpose, defineProps } from 'vue';
import axios from 'axios';
import ListCard from '@/components/ListCard.vue';

defineProps({
  limit: Number
})

const state = reactive({
    artist: [],
    isLoading: true
});

const fetchArtists = async () => {
    state.isLoading = true;
    try {
        const response = await axios.get(`/api/artists`);
        state.artist = response.data;
    } catch (error) {
        console.error('Error fetching song details:', error);
    } finally {
        state.isLoading = false;
    }
};

const refreshSongs = () => {
    fetchArtists();
};

onMounted(() => {
    fetchArtists();
});

// Expose method to parent component
defineExpose({
    refreshSongs
});
</script>

<template>
  <div class="w-full p-4">
    <h2 class="text-2xl font-bold">My Artists Library</h2>
    
    <div v-if="state.isLoading" class="loading">
      Loading artists...
    </div>
    
    <div v-else-if="state.artist.length === 0" class="empty-state">
      No artists yet.
    </div>
    
    <div v-else class="m-2">
      <ListCard type="artist"
        v-for="artist in state.artist.slice(0, limit || state.artist.length)"
        :item="artist"
      />
    </div>
  </div>
</template>