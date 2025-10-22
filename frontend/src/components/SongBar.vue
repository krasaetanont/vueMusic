<script setup>
import { reactive, onMounted, defineExpose } from 'vue';
import axios from 'axios';

const state = reactive({
    songs: [],
    isLoading: true
});

const fetchSongs = async () => {
    state.isLoading = true;
    try {
        const response = await axios.get(`http://localhost:3000/api/musicFiles`);
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
  <div class="song-bar">
    <h2 class="songs-title">My Music Library</h2>
    
    <div v-if="state.isLoading" class="loading">
      Loading songs...
    </div>
    
    <div v-else-if="state.songs.length === 0" class="empty-state">
      No songs yet. Upload your first song!
    </div>
    
    <div v-else class="songs-grid">
      <div v-for="song in state.songs" :key="song.id" class="song-item">
        <div class="song-info">
          <h3 class="song-title">{{ song.title }}</h3>
          <p class="song-artist">{{ song.artist }}</p>
          <p class="song-genre">{{ song.genre }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.song-bar {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.songs-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.song-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.song-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-title {
  font-size: 18px;
  color: #333;
  font-weight: 600;
  margin: 0;
}

.song-artist {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.song-genre {
  font-size: 12px;
  color: #999;
  margin: 0;
  text-transform: uppercase;
}
</style>