<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const playlistId = route.params.id;

const state = reactive({
  playlist: null,
  allSongs: [],
  playlistSongs: [],
  isLoading: true,
  isAdding: false
});

const selectedSongs = ref(new Set());
const searchQuery = ref('');
const errorMessage = ref('');
const successMessage = ref('');

// Fetch playlist details and all songs
const fetchData = async () => {
  state.isLoading = true;
  try {
    // Fetch playlist songs - FIXED: Use relative URL
    const playlistResponse = await axios.get(`/api/playlist/${playlistId}`);
    state.playlistSongs = Array.isArray(playlistResponse.data) ? playlistResponse.data: [];
    
    // Fetch all songs - FIXED: Use relative URL
    const allSongsResponse = await axios.get('/api/musics');
    state.allSongs = allSongsResponse.data;
    
    // Get playlist name (from the first song's playlists array)
    if (state.playlistSongs.length > 0 && state.playlistSongs[0].playlists.length > 0) {
      state.playlist = state.playlistSongs[0].playlists.find(p => p.id === parseInt(playlistId));
    } else {
      // If no songs in playlist, fetch playlist info directly - FIXED: Use relative URL
      const playlistsResponse = await axios.get('/api/playlists');
      state.playlist = playlistsResponse.data.find(p => p.id === parseInt(playlistId));
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    errorMessage.value = 'Failed to load data';
  } finally {
    state.isLoading = false;
  }
};

// Get songs that are not already in the playlist
const availableSongs = () => {
  const playlistSongIds = new Set(state.playlistSongs.map(s => s.id));
  return state.allSongs.filter(song => !playlistSongIds.has(song.id));
};

// Filter songs based on search query
const filteredSongs = () => {
  const available = availableSongs();
  if (!searchQuery.value.trim()) {
    return available;
  }
  
  const query = searchQuery.value.toLowerCase();
  return available.filter(song => {
    const title = song.title.toLowerCase();
    const artists = getArtistNames(song).toLowerCase();
    return title.includes(query) || artists.includes(query);
  });
};

const toggleSong = (songId) => {
  if (selectedSongs.value.has(songId)) {
    selectedSongs.value.delete(songId);
  } else {
    selectedSongs.value.add(songId);
  }
};

const selectAll = () => {
  const filtered = filteredSongs();
  filtered.forEach(song => selectedSongs.value.add(song.id));
};

const deselectAll = () => {
  selectedSongs.value.clear();
};

const addSelectedSongs = async () => {
  if (selectedSongs.value.size === 0) {
    errorMessage.value = 'Please select at least one song';
    return;
  }

  state.isAdding = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Add each selected song to the playlist - FIXED: Use relative URL
    const promises = Array.from(selectedSongs.value).map(songId =>
      axios.post(`/api/playlists/${playlistId}/musics`, {
        music_id: songId
      })
    );

    await Promise.all(promises);

    successMessage.value = `Successfully added ${selectedSongs.value.size} song(s) to playlist`;
    selectedSongs.value.clear();

    // Refresh data
    await fetchData();

    // Redirect back to playlist after 1.5 seconds
    setTimeout(() => {
      router.push(`/playlist/${playlistId}`);
    }, 1500);

  } catch (error) {
    console.error('Error adding songs:', error);
    errorMessage.value = error.response?.data?.error || 'Failed to add songs to playlist';
  } finally {
    state.isAdding = false;
  }
};

const cancel = () => {
  router.push(`/playlist/${playlistId}`);
};

const getArtistNames = (song) => {
  if (song.artists && Array.isArray(song.artists)) {
    return song.artists.map(a => a.name).join(', ');
  }
  return song.artist || 'Unknown Artist';
};

const getGenreNames = (song) => {
  if (song.genres && Array.isArray(song.genres)) {
    return song.genres.map(g => g.name).join(', ');
  }
  return song.genre || '';
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="w-full p-4 max-w-4xl">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-2">
        Add Songs to {{ state.playlist?.name || 'Playlist' }}
      </h2>
      <p class="text-[var(--color-muted)] text-sm">
        Select songs to add to your playlist
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="state.isLoading" class="text-center py-8">
      <i class="pi pi-spinner pi-spin text-2xl text-[var(--color-muted)]"></i>
      <p class="mt-2 text-[var(--color-muted)]">Loading songs...</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Search and Actions Bar -->
      <div class="flex gap-3 mb-4 items-center">
        <div class="flex-1 relative">
          <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)]"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search songs..."
            class="w-full pl-10"
          />
        </div>
        <button
          @click="selectAll"
          class="btn btn-secondary"
          :disabled="filteredSongs().length === 0"
        >
          Select All
        </button>
        <button
          @click="deselectAll"
          class="btn btn-secondary"
          :disabled="selectedSongs.size === 0"
        >
          Deselect All
        </button>
      </div>

      <!-- Selected Count -->
      <div v-if="selectedSongs.size > 0" class="mb-4 text-sm text-[var(--color-accent)]">
        {{ selectedSongs.size }} song(s) selected
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message mb-4">
        <i class="pi pi-check-circle mr-2"></i>
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message mb-4">
        <i class="pi pi-exclamation-circle mr-2"></i>
        {{ errorMessage }}
      </div>

      <!-- Available Songs List -->
      <div v-if="filteredSongs().length === 0" class="empty-state text-center py-8">
        <i class="pi pi-music text-4xl mb-4 text-[var(--color-muted)]"></i>
        <p class="text-[var(--color-muted)]">
          {{ availableSongs().length === 0 
            ? 'All songs have been added to this playlist' 
            : 'No songs match your search'
          }}
        </p>
      </div>

      <div v-else class="songs-list space-y-2 mb-6">
        <div
          v-for="song in filteredSongs()"
          :key="song.id"
          @click="toggleSong(song.id)"
          :class="[
            'song-item',
            { selected: selectedSongs.has(song.id) }
          ]"
        >
          <div class="checkbox-container">
            <input
              type="checkbox"
              :checked="selectedSongs.has(song.id)"
              @click.stop="toggleSong(song.id)"
              class="checkbox"
            />
          </div>
          <div class="song-info">
            <div class="song-title">{{ song.title }}</div>
            <div class="song-meta">
              <span>{{ getArtistNames(song) }}</span>
              <span v-if="getGenreNames(song)" class="text-[var(--color-muted)]"> • {{ getGenreNames(song) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 sticky bottom-4 bg-[var(--color-background)] py-4 border-t border-[var(--color-border)]">
        <button
          @click="cancel"
          class="btn btn-cancel flex-1"
          :disabled="state.isAdding"
        >
          Cancel
        </button>
        <button
          @click="addSelectedSongs"
          class="btn btn-primary flex-1"
          :disabled="state.isAdding || selectedSongs.size === 0"
        >
          <i v-if="state.isAdding" class="pi pi-spinner pi-spin mr-2"></i>
          <i v-else class="pi pi-plus mr-2"></i>
          {{ state.isAdding ? 'Adding...' : `Add ${selectedSongs.size || ''} Song${selectedSongs.size !== 1 ? 's' : ''}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.songs-list {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-surface);
  border: 2px solid transparent;
}

.song-item:hover {
  background: var(--color-border);
}

.song-item.selected {
  background: var(--color-accent-hover);
  border-color: var(--color-accent);
}

.checkbox-container {
  flex-shrink: 0;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.song-meta {
  font-size: 12px;
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: var(--color-surface);
  color: var(--color-text);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--color-border);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  padding: 8px 16px;
  font-size: 13px;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-border);
}

.btn-primary {
  background: var(--color-accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.success-message {
  padding: 12px 16px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: var(--radius-md);
  color: #22c55e;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.error-message {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: #ef4444;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--color-muted);
}

/* Scrollbar */
.songs-list::-webkit-scrollbar {
  width: 8px;
}

.songs-list::-webkit-scrollbar-track {
  background: transparent;
}

.songs-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.songs-list::-webkit-scrollbar-thumb:hover {
  background: var(--color-muted);
}
</style>