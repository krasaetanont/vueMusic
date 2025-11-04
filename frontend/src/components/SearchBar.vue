<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { onClickOutside } from '@vueuse/core';

const router = useRouter();
const searchQuery = ref('');
const searchResults = ref({
  songs: [],
  artists: [],
  genres: [],
  playlists: []
});
const isLoading = ref(false);
const showResults = ref(false);
const searchContainer = ref(null);
const isSearchFocused = ref(false);

// Close search results when clicking outside
onClickOutside(searchContainer, () => {
  showResults.value = false;
  isSearchFocused.value = false;
});

// Debounce timer
let debounceTimer = null;

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (!newQuery.trim()) {
    searchResults.value = {
      songs: [],
      artists: [],
      genres: [],
      playlists: []
    };
    showResults.value = false;
    return;
  }

  // Debounce search by 300ms
  debounceTimer = setTimeout(async () => {
    await performSearch(newQuery);
  }, 300);
});

const performSearch = async (query) => {
  if (!query.trim()) return;

  isLoading.value = true;
  showResults.value = true;

  try {
    const [songsRes, artistsRes, genresRes, playlistsRes] = await Promise.all([
      axios.get('http://localhost:3000/api/musics'),
      axios.get('http://localhost:3000/api/artists'),
      axios.get('http://localhost:3000/api/genres'),
      axios.get('http://localhost:3000/api/playlists')
    ]);

    const lowerQuery = query.toLowerCase();

    // Filter songs
    searchResults.value.songs = songsRes.data.filter(song => {
      const titleMatch = song.title.toLowerCase().includes(lowerQuery);
      const artistMatch = song.artists?.some(a => a.name.toLowerCase().includes(lowerQuery));
      const genreMatch = song.genres?.some(g => g.name.toLowerCase().includes(lowerQuery));
      return titleMatch || artistMatch || genreMatch;
    }).slice(0, 5);

    // Filter artists
    searchResults.value.artists = artistsRes.data.filter(artist =>
      artist.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    // Filter genres
    searchResults.value.genres = genresRes.data.filter(genre =>
      genre.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    // Filter playlists
    searchResults.value.playlists = playlistsRes.data.filter(playlist =>
      playlist.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

  } catch (error) {
    console.error('Search error:', error);
  } finally {
    isLoading.value = false;
  }
};

const hasResults = computed(() => {
  return searchResults.value.songs.length > 0 ||
         searchResults.value.artists.length > 0 ||
         searchResults.value.genres.length > 0 ||
         searchResults.value.playlists.length > 0;
});

const playSong = (song) => {
  const event = new CustomEvent('play-song', { detail: song });
  window.dispatchEvent(event);
  closeSearch();
};

const navigateTo = (type, id) => {
  router.push(`/${type}/${id}`);
  closeSearch();
};

const closeSearch = () => {
  showResults.value = false;
  isSearchFocused.value = false;
  searchQuery.value = '';
};

const getArtistNames = (song) => {
  if (song.artists && Array.isArray(song.artists)) {
    return song.artists.map(a => a.name).join(', ');
  }
  return 'Unknown Artist';
};

const handleFocus = () => {
  isSearchFocused.value = true;
  if (searchQuery.value.trim()) {
    showResults.value = true;
  }
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    closeSearch();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>

<template>
  <div ref="searchContainer" class="search-container">
    <div class="search-input-wrapper">
      <i class="pi pi-search search-icon"></i>
      <input
        v-model="searchQuery"
        @focus="handleFocus"
        type="text"
        placeholder="Search songs, artists, genres, playlists..."
        class="search-input"
      />
      <button
        v-if="searchQuery"
        @click="closeSearch"
        class="clear-button"
        title="Clear search"
      >
        <i class="pi pi-times"></i>
      </button>
      <i v-if="isLoading" class="pi pi-spinner pi-spin loading-icon"></i>
    </div>

    <!-- Search Results Dropdown -->
    <Transition name="fade-slide">
      <div v-if="showResults" class="search-results">
        <!-- No Results -->
        <div v-if="!isLoading && !hasResults && searchQuery.trim()" class="empty-results">
          <i class="pi pi-search text-4xl mb-3 text-[var(--color-muted)]"></i>
          <p>No results found for "{{ searchQuery }}"</p>
        </div>

        <!-- Songs Section -->
        <div v-if="searchResults.songs.length > 0" class="results-section">
          <div class="section-header">
            <i class="pi pi-music"></i>
            <span>Songs</span>
          </div>
          <div
            v-for="song in searchResults.songs"
            :key="'song-' + song.id"
            @click="playSong(song)"
            class="result-item"
          >
            <div class="result-icon">
              <i class="pi pi-play"></i>
            </div>
            <div class="result-info">
              <div class="result-title">{{ song.title }}</div>
              <div class="result-subtitle">{{ getArtistNames(song) }}</div>
            </div>
          </div>
        </div>

        <!-- Artists Section -->
        <div v-if="searchResults.artists.length > 0" class="results-section">
          <div class="section-header">
            <i class="pi pi-user"></i>
            <span>Artists</span>
          </div>
          <div
            v-for="artist in searchResults.artists"
            :key="'artist-' + artist.id"
            @click="navigateTo('artist', artist.id)"
            class="result-item"
          >
            <div class="result-icon">
              <i class="pi pi-user"></i>
            </div>
            <div class="result-info">
              <div class="result-title">{{ artist.name }}</div>
              <div class="result-subtitle">Artist</div>
            </div>
          </div>
        </div>

        <!-- Genres Section -->
        <div v-if="searchResults.genres.length > 0" class="results-section">
          <div class="section-header">
            <i class="pi pi-tag"></i>
            <span>Genres</span>
          </div>
          <div
            v-for="genre in searchResults.genres"
            :key="'genre-' + genre.id"
            @click="navigateTo('genre', genre.id)"
            class="result-item"
          >
            <div class="result-icon">
              <i class="pi pi-tag"></i>
            </div>
            <div class="result-info">
              <div class="result-title">{{ genre.name }}</div>
              <div class="result-subtitle">Genre</div>
            </div>
          </div>
        </div>

        <!-- Playlists Section -->
        <div v-if="searchResults.playlists.length > 0" class="results-section">
          <div class="section-header">
            <i class="pi pi-list"></i>
            <span>Playlists</span>
          </div>
          <div
            v-for="playlist in searchResults.playlists"
            :key="'playlist-' + playlist.id"
            @click="navigateTo('playlist', playlist.id)"
            class="result-item"
          >
            <div class="result-icon">
              <i class="pi pi-list"></i>
            </div>
            <div class="result-info">
              <div class="result-title">{{ playlist.name }}</div>
              <div class="result-subtitle">{{ playlist.music_count || 0 }} songs</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--color-muted);
  font-size: 16px;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 48px 12px 48px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 24px;
  color: var(--color-text);
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--color-background);
}

.search-input::placeholder {
  color: var(--color-muted);
}

.clear-button {
  position: absolute;
  right: 48px;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  color: var(--color-text);
  background: var(--color-border);
}

.loading-icon {
  position: absolute;
  right: 16px;
  color: var(--color-accent);
  font-size: 16px;
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  max-height: 70vh;
  overflow-y: auto;
  z-index: 1000;
}

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--color-muted);
  text-align: center;
}

.results-section {
  padding: 12px 0;
}

.results-section:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-header i {
  font-size: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  background: var(--color-background);
}

.result-icon {
  width: 40px;
  height: 40px;
  background: var(--color-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-icon i {
  font-size: 18px;
  color: var(--color-accent);
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.result-subtitle {
  font-size: 12px;
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Scrollbar */
.search-results::-webkit-scrollbar {
  width: 8px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: var(--color-muted);
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 768px) {
  .search-container {
    max-width: 100%;
  }

  .search-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .search-results {
    max-height: 60vh;
  }
}
</style>