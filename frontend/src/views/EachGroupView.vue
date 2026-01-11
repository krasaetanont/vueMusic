<!-- /frontend/src/views/EachGroupView.vue -->
<script setup>
import { reactive, onMounted, defineExpose, inject, computed } from 'vue';
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
        const response = await axios.get(`/api/${itemType}/${itemId}`);
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
    // Find the index of the song in the current list
    const idx = state.songs.findIndex(s => s.id === song.id);
    
    console.log('EachGroupView handlePlaySong:', { 
        songId: song.id, 
        foundIndex: idx, 
        totalSongs: state.songs.length,
        songsArray: state.songs
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

// Safe computed name (returns fallback when data not ready)
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
    return '';
});
</script>

<template>
    <div class="w-full p-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">My {{ Name || '' }} Library</h2>
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
                    v-if="itemType === 'playlist'"
                    :to="`/add/to-playlist/${itemId}`"
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
                v-for="(songItem, idx) in state.songs" 
                :key="songItem.id" 
                :song="songItem"
                @play="handlePlaySong"
                @removed="refreshSongs"  
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
}

.add-button:hover {
    background: var(--color-border);
}
</style>