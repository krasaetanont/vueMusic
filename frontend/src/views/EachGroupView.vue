<script setup>
import { reactive, onMounted, defineExpose, inject, defineProps, computed } from 'vue'; // added computed
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
        console.log('Fetched songs:', state.songs[0].artists[0].name);
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

// safe computed artist name (returns fallback when data not ready)
const Name = computed(() => {
  if (!Array.isArray(state.songs) || state.songs.length === 0) return '';
  const first = state.songs[0];
  switch (itemType) {
    case 'artist':
      if (first.artists && Array.isArray(first.artists) && first.artists.length > 0) {
        return first.artists[0].name || '';
      }
      break;
    case 'genre':
      if (first.genres && Array.isArray(first.genres) && first.genres.length > 0) {
        return first.genres[0].name || '';
      }
      break;
    case 'playlist':
      return first.playlists && Array.isArray(first.playlists) && first.playlists.length > 0
        ? first.playlists[0].name || ''
        : '';
    default:
      return '';
  }
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex justify-between items-center">
      <!-- use computed artistName to avoid accessing nested props before data loads -->
      <h2 class="text-2xl font-bold mb-4">My {{ Name || '' }} Library</h2>
      <RouterLink
        v-if="itemType === 'playlist'"
        :to="`/add/to-playlist/${itemId}`"
        class="block"
        ><i class="pi pi-plus"></i>
      </RouterLink>
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