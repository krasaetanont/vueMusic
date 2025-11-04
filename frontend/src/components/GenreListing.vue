<script setup>
import { reactive, onMounted, defineExpose } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ListCard from '@/components/ListCard.vue';

const state = reactive({
  genres: [],
  isLoading: true
});

const fetchGenres = async () => {
    state.isLoading = true;
    try {
        const response = await axios.get(`/api/genres`);
        state.genres = response.data;
    } catch (error) {
        console.error('Error fetching song details:', error);
    } finally {
        state.isLoading = false;
    }
};

const refreshGenres = () => {
    fetchGenres();
};

onMounted(() => {
    fetchGenres();
});

// Expose method to parent component
defineExpose({
    refreshGenres
});
</script>

<template>
  <div class="w-full p-4">
    <h2 class="text-2xl font-bold">My Genre Library</h2>
    
    <div v-if="state.isLoading" class="loading">
      Loading.genres...
    </div>
    
    <div v-else-if="state.genres.length === 0" class="empty-state">
      No playlist yet. Upload your first playlist!
    </div>
    
    <div v-else class="m-2">
      <ListCard type="genre"
        v-for="genre in state.genres" 
        :item="genre" 
      />
    </div>
  </div>
</template>