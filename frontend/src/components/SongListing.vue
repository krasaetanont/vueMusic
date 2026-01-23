<script setup>
import { reactive, onMounted, defineExpose, inject, defineProps } from 'vue';
import axios from 'axios';
import Song from '@/components/Song.vue';

defineProps({
  limit: Number
})

const playSong = inject('playSong');

const state = reactive({
    songs: [],
    isLoading: true
});

const fetchSongs = async () => {
    state.isLoading = true;
    try {
        const response = await axios.get(`/api/musics`);
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

const handleSongRemoved = (songId) => {
    // Remove song from local state
    state.songs = state.songs.filter(s => s.id !== songId);
};

const handlePlaySong = (song) => {
    // Find the index of the song in the current list
    const idx = state.songs.findIndex(s => s.id === song.id);
    
    console.log('SongListing handlePlaySong:', { 
        songId: song.id, 
        foundIndex: idx, 
        totalSongs: state.songs.length,
        filePath: song.file_path,
        songObject: song
    });
    
    // Dispatch custom event to Player component
    const event = new CustomEvent('play-song-with-queue', {
        detail: {
            song: song,
            index: idx !== -1 ? idx : 0,
            queue: state.songs
        }
    });
    window.dispatchEvent(event);
};

const playRandomSong = () => {
    if (state.songs.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * state.songs.length);
    const randomSong = state.songs[randomIndex];
    
    console.log('Playing random song:', { 
        randomIndex, 
        songId: randomSong.id, 
        totalSongs: state.songs.length 
    });
    
    // Dispatch custom event to Player component
    const event = new CustomEvent('play-song-with-queue', {
        detail: {
            song: randomSong,
            index: randomIndex,
            queue: state.songs
        }
    });
    window.dispatchEvent(event);
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
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">My Music Library</h2>
      <div class="flex gap-2">
        <button
          v-if="state.songs.length > 0"
          @click="playRandomSong"
          class="random-button"
          title="Play random song"
        >
          <i class="pi pi-bolt"></i>
          Random
        </button>
        <RouterLink 
          to="/upload" 
          class="add-button"
        >
          <i class="pi pi-plus"></i>
        </RouterLink>
      </div>
    </div>
    
    <div v-if="state.isLoading" class="loading text-muted text-center py-8">
      Loading songs...
    </div>
    
    <div v-else-if="state.songs.length === 0" class="empty-state text-muted text-center py-8">
      No songs yet. Upload your first song!
    </div>
    
    <div v-else class="space-y-1">
      <Song 
        v-for="songItem in state.songs.slice(0, limit || state.songs.length)" 
        :key="songItem.id" 
        :song="songItem"
        @play="handlePlaySong"
        @removed="handleSongRemoved"
      />
    </div>
  </div>
</template>

<style scoped>
.random-button {
    background: var(--color-accent);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
}

.random-button:hover {
    background: var(--color-accent-hover);
    transform: translateY(-1px);
}

.random-button i {
    font-size: 16px;
}

.add-button {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    text-decoration: none;
}

.add-button:hover {
    background: var(--color-border);
}
</style>