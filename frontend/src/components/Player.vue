<!-- /frontend/src/components/Player.vue -->
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, provide } from 'vue';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://music.nijserver.link';
const api = axios.create({ baseURL: API_BASE });

const currentSong = ref(null);
const audio = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const isMuted = ref(false);
const showQueue = ref(false);
const showLyrics = ref(false);
const queue = ref([]);
const currentIndex = ref(0);
const lyrics = ref('');
const isRepeat = ref(false);
const isShuffle = ref(false);

const showLyricEditor = ref(false);
const newLyricText = ref('');
const isSubmittingLyric = ref(false);
const isDeletingLyric = ref(false);

onMounted(() => {
    audio.value = new Audio();
    
    audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value.currentTime;
    });
    
    audio.value.addEventListener('loadedmetadata', () => {
        duration.value = audio.value.duration;
    });
    
    audio.value.addEventListener('ended', () => {
        if (isRepeat.value) {
            audio.value.currentTime = 0;
            audio.value.play();
        } else {
            playNext();
        }
    });

    window.addEventListener('play-song', handlePlaySong);
    window.addEventListener('play-song-with-queue', handlePlaySongWithQueue);
});

onBeforeUnmount(() => {
    if (audio.value) {
        audio.value.pause();
        audio.value.src = '';
    }
    window.removeEventListener('play-song', handlePlaySong);
    window.removeEventListener('play-song-with-queue', handlePlaySongWithQueue);
});

const handlePlaySong = async (event) => {
    const song = event.detail;
    await playSong(song);
};

const handlePlaySongWithQueue = async (event) => {
    const { song, index, queue } = event.detail;
    console.log('handlePlaySongWithQueue received:', { 
        songId: song.id, 
        index, 
        queueLength: queue?.length 
    });
    await playSong(song, index, queue);
};

const playSong = async (song, index = null, queueOverride = null) => {
    console.log('playSong called:', { songId: song.id, index, queueLength: queueOverride?.length });
    
    currentSong.value = song;
    
    // If caller provided a queue, replace the entire queue
    if (Array.isArray(queueOverride) && queueOverride.length > 0) {
        queue.value = [...queueOverride];
        
        if (index !== null && index >= 0 && index < queue.value.length) {
            currentIndex.value = index;
        } else {
            const foundIndex = queue.value.findIndex(s => s.id === song.id);
            currentIndex.value = foundIndex !== -1 ? foundIndex : 0;
        }
        
        console.log('Queue updated:', queue.value.length, 'songs, currentIndex:', currentIndex.value);
    } else {
        // No queue override - use existing queue logic
        if (index !== null && index >= 0 && index < queue.value.length) {
            currentIndex.value = index;
        } else if (queue.value.length > 0) {
            const foundIndex = queue.value.findIndex(s => s.id === song.id);
            if (foundIndex !== -1) {
                currentIndex.value = foundIndex;
            } else {
                queue.value.push(song);
                currentIndex.value = queue.value.length - 1;
            }
        } else {
            await loadQueue();
        }
    }
    
    if (audio.value) {
        audio.value.src = `${API_BASE}${song.file_path}`;
        audio.value.load();
        try {
            await audio.value.play();
            isPlaying.value = true;
        } catch (error) {
            console.error('Error playing audio:', error);
            isPlaying.value = false;
        }
    }

    if (song.lyric_path) {
        try {
            const response = await api.get(song.lyric_path, { responseType: 'text' });
            lyrics.value = response.data;
            showLyricEditor.value = false;
        } catch (error) {
            lyrics.value = 'Lyrics not available';
        }
    } else {
        lyrics.value = 'No lyrics available for this song';
    }
};

const loadQueue = async () => {
    try {
        const response = await api.get('/api/musics');
        queue.value = response.data;
        
        if (currentSong.value) {
            const foundIndex = queue.value.findIndex(s => s.id === currentSong.value.id);
            if (foundIndex !== -1) {
                currentIndex.value = foundIndex;
            }
        }
    } catch (error) {
        console.error('Error loading queue:', error);
    }
};

const togglePlay = () => {
    if (!audio.value || !currentSong.value) return;
    
    if (isPlaying.value) {
        audio.value.pause();
        isPlaying.value = false;
    } else {
        audio.value.play().then(() => {
            isPlaying.value = true;
        }).catch(error => {
            console.error('Error playing audio:', error);
            isPlaying.value = false;
        });
    }
};

const playNext = () => {
    if (queue.value.length === 0) return;
    
    let nextIndex;
    if (isShuffle.value) {
        nextIndex = Math.floor(Math.random() * queue.value.length);
    } else {
        nextIndex = (currentIndex.value + 1) % queue.value.length;
    }
    playSong(queue.value[nextIndex], nextIndex);
};

const playPrevious = () => {
    if (queue.value.length === 0) return;
    
    if (currentTime.value > 3) {
        audio.value.currentTime = 0;
        return;
    }
    
    const prevIndex = currentIndex.value === 0 ? queue.value.length - 1 : currentIndex.value - 1;
    playSong(queue.value[prevIndex], prevIndex);
};

const seek = (event) => {
    if (!audio.value || !duration.value) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    audio.value.currentTime = percent * duration.value;
};

const changeVolume = (event) => {
    const newVolume = parseFloat(event.target.value);
    volume.value = newVolume;
    if (audio.value) {
        audio.value.volume = newVolume;
        isMuted.value = newVolume === 0;
    }
};

const toggleMute = () => {
    if (!audio.value) return;
    
    if (isMuted.value) {
        audio.value.volume = volume.value;
        isMuted.value = false;
    } else {
        audio.value.volume = 0;
        isMuted.value = true;
    }
};

const toggleRepeat = () => {
    isRepeat.value = !isRepeat.value;
};

const toggleShuffle = () => {
    isShuffle.value = !isShuffle.value;
};

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const progressPercent = computed(() => {
    if (!duration.value) return 0;
    return (currentTime.value / duration.value) * 100;
});

const volumeIcon = computed(() => {
    if (isMuted.value || volume.value === 0) return 'pi-volume-off';
    if (volume.value < 0.5) return 'pi-volume-down';
    return 'pi-volume-up';
});

const toggleQueue = () => {
    showQueue.value = !showQueue.value;
    if (showQueue.value) {
        showLyrics.value = false;
    }
};

const toggleLyrics = () => {
    showLyrics.value = !showLyrics.value;
    if (showLyrics.value) {
        showQueue.value = false;
    }
};

const closeModal = () => {
    showQueue.value = false;
    showLyrics.value = false;
};

const playFromQueue = (song, index) => {
    playSong(song, index);
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

const refreshLyrics = async () => {
    if (!currentSong.value || !currentSong.value.id) return;
    try {
        const res = await api.get(`/api/musics/${currentSong.value.id}`);
        const updated = res.data;
        currentSong.value.lyric_path = updated.lyric_path;
        if (updated.lyric_path) {
            const r = await api.get(updated.lyric_path, { responseType: 'text' });
            lyrics.value = r.data;
        } else {
            lyrics.value = 'No lyrics available for this song';
        }
    } catch (err) {
        console.error('Failed to refresh lyrics:', err);
        lyrics.value = 'Lyrics not available';
    } finally {
        showLyricEditor.value = false;
        newLyricText.value = '';
    }
};

const openLyricEditor = () => {
    showLyricEditor.value = true;
    newLyricText.value = '';
};

const prepareEditLyric = () => {
    showLyricEditor.value = true;
    newLyricText.value = lyrics.value || '';
};

const submitLyric = async () => {
    if (!currentSong.value || !currentSong.value.id) return;
    if (!newLyricText.value || newLyricText.value.trim() === '') {
        alert('Please enter lyric text');
        return;
    }
    isSubmittingLyric.value = true;
    try {
        await api.post(
            `/api/upload/lyric/${currentSong.value.id}`,
            newLyricText.value,
            { headers: { 'Content-Type': 'text/plain' } }
        );
        await refreshLyrics();
    } catch (err) {
        console.error('Failed to upload lyric:', err);
        alert('Failed to upload lyric');
    } finally {
        isSubmittingLyric.value = false;
    }
};

const deleteLyric = async () => {
    if (!currentSong.value || !currentSong.value.id) return;
    if (!confirm('Delete lyric for this song?')) return;
    isDeletingLyric.value = true;
    try {
        await api.delete(`/api/delete/lyric/${currentSong.value.id}`);
        await refreshLyrics();
    } catch (err) {
        console.error('Failed to delete lyric:', err);
        alert('Failed to delete lyric');
    } finally {
        isDeletingLyric.value = false;
    }
};

const hasLyrics = computed(() => !!(currentSong.value && currentSong.value.lyric_path));

provide('playSong', playSong);
</script>

<template>
    <div class="player-container">
        <Transition name="slide-up">
            <div v-if="showQueue || showLyrics" class="modal-overlay" @click.self="closeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-tabs">
                            <button 
                                @click="showQueue = true; showLyrics = false"
                                :class="['tab-button', { active: showQueue }]"
                            >
                                <i class="pi pi-list"></i>
                                Queue
                            </button>
                            <button 
                                @click="showLyrics = true; showQueue = false"
                                :class="['tab-button', { active: showLyrics }]"
                            >
                                <i class="pi pi-align-left"></i>
                                Lyrics
                            </button>
                        </div>
                        <button @click="closeModal" class="close-button">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>

                    <div v-if="showQueue" class="modal-body">
                        <div class="queue-header">
                            <h3>Playing from Queue</h3>
                            <p class="text-sm text-muted">{{ queue.length }} songs</p>
                        </div>
                        
                        <div v-if="queue.length === 0" class="empty-state">
                            <i class="pi pi-music text-4xl mb-4 text-muted"></i>
                            <p>No songs in queue</p>
                        </div>
                        
                        <div v-else class="queue-list">
                            <div 
                                v-for="(song, index) in queue" 
                                :key="song.id"
                                @click="playFromQueue(song, index)"
                                :class="['queue-item', { active: currentSong && currentSong.id === song.id }]"
                            >
                                <div class="queue-item-number">
                                    <span v-if="currentSong && currentSong.id === song.id && isPlaying">
                                        <i class="pi pi-volume-up text-accent"></i>
                                    </span>
                                    <span v-else class="text-muted">{{ index + 1 }}</span>
                                </div>
                                <div class="queue-item-info">
                                    <div class="queue-item-title">{{ song.title }}</div>
                                    <div class="queue-item-artist">{{ getArtistNames(song) }}</div>
                                </div>
                                <div class="queue-item-genre">{{ getGenreNames(song) }}</div>
                            </div>
                        </div>
                    </div>

                    <div v-if="showLyrics" class="modal-body lyrics-container">
                        <div class="lyrics-header">
                            <h3>{{ currentSong?.title || 'No song playing' }}</h3>
                            <p class="text-sm text-muted">{{ currentSong ? getArtistNames(currentSong) : '' }}</p>
                        </div>
                        <div class="lyrics-content">
                            <div v-if="lyrics === 'No lyrics available for this song'">
                                <p class="text-muted mb-4">{{ lyrics }}</p>
                                <button class="icon-button" @click="openLyricEditor">
                                    <i class="pi pi-plus"></i> Add Lyric
                                </button>

                                <div v-if="showLyricEditor" class="mt-4">
                                    <textarea
                                        v-model="newLyricText"
                                        rows="12"
                                        class="w-full p-3 border rounded-md bg-background text-text"
                                        placeholder="Enter lyrics or HTML content here..."
                                    ></textarea>
                                    <div class="mt-3 flex gap-2">
                                        <button class="btn btn-primary" :disabled="isSubmittingLyric" @click="submitLyric">
                                            {{ isSubmittingLyric ? 'Saving...' : 'Enter' }}
                                        </button>
                                        <button class="btn" @click="showLyricEditor = false" :disabled="isSubmittingLyric">Cancel</button>
                                    </div>
                                </div>
                            </div>

                            <div v-else>
                                <div class="mb-4" v-html="lyrics"></div>

                                <div class="flex gap-2">
                                    <button v-if="hasLyrics" class="icon-button text-red-500" :disabled="isDeletingLyric" @click="deleteLyric">
                                        <i class="pi pi-trash"></i> {{ isDeletingLyric ? 'Deleting...' : 'Delete Lyric' }}
                                    </button>
                                    <button v-if="hasLyrics" class="icon-button" @click="prepareEditLyric">
                                        <i class="pi pi-pencil"></i> Edit Lyric
                                    </button>

                                    <div v-if="showLyricEditor" class="w-full mt-3">
                                        <textarea
                                            v-model="newLyricText"
                                            rows="12"
                                            class="w-full p-3 border rounded-md bg-background text-text"
                                        ></textarea>
                                        <div class="mt-3 flex gap-2">
                                            <button class="btn btn-primary" :disabled="isSubmittingLyric" @click="submitLyric">
                                                {{ isSubmittingLyric ? 'Saving...' : 'Enter' }}
                                            </button>
                                            <button class="btn" @click="showLyricEditor = false" :disabled="isSubmittingLyric">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <div class="player-bar">
            <div class="progress-container" @click="seek">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progressPercent + '%' }">
                        <div class="progress-thumb"></div>
                    </div>
                </div>
            </div>

            <div class="player-content">
                <div class="song-section">
                    <div v-if="currentSong" class="song-details">
                        <div class="song-cover">
                            <i class="pi pi-music"></i>
                        </div>
                        <div class="song-text">
                            <div class="song-title">{{ currentSong.title }}</div>
                            <div class="song-artist">{{ getArtistNames(currentSong) }}</div>
                        </div>
                    </div>
                    <div v-else class="song-details">
                        <div class="song-cover">
                            <i class="pi pi-music"></i>
                        </div>
                        <div class="song-text">
                            <div class="song-title text-muted">No song playing</div>
                        </div>
                    </div>
                </div>

                <div class="controls-section">
                    <div class="control-buttons">
                        <button @click="toggleShuffle" :class="['icon-button', { active: isShuffle }]" title="Shuffle">
                            <i class="pi pi-random"></i>
                        </button>
                        <button @click="playPrevious" class="icon-button" :disabled="!currentSong" title="Previous">
                            <i class="pi pi-step-backward"></i>
                        </button>
                        <button @click="togglePlay" class="play-button" :disabled="!currentSong" title="Play/Pause">
                            <i :class="['pi', isPlaying ? 'pi-pause' : 'pi-play']"></i>
                        </button>
                        <button @click="playNext" class="icon-button" :disabled="!currentSong" title="Next">
                            <i class="pi pi-step-forward"></i>
                        </button>
                        <button @click="toggleRepeat" :class="['icon-button', { active: isRepeat }]" title="Repeat">
                            <i class="pi pi-refresh"></i>
                        </button>
                    </div>
                    <div class="time-display">
                        <span>{{ formatTime(currentTime) }}</span>
                        <span class="text-muted">/</span>
                        <span>{{ formatTime(duration) }}</span>
                    </div>
                </div>

                <div class="extra-section">
                    <button @click="toggleQueue" :class="['icon-button', { active: showQueue }]" title="Queue">
                        <i class="pi pi-list"></i>
                    </button>
                    <button @click="toggleMute" class="icon-button" title="Mute/Unmute">
                        <i :class="['pi', volumeIcon]"></i>
                    </button>
                    <div class="volume-container">
                        <input type="range" min="0" max="1" step="0.01" :value="isMuted ? 0 : volume" @input="changeVolume" class="volume-slider" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.player-container { position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000; background: var(--color-surface); border-top: 1px solid var(--color-border); }
.progress-container { cursor: pointer; padding: 0 16px; padding-top: 8px; }
.progress-container:hover .progress-thumb { opacity: 1; }
.progress-bar { height: 4px; background: var(--color-border); border-radius: 2px; position: relative; overflow: visible; }
.progress-fill { height: 100%; background: var(--color-accent); border-radius: 2px; position: relative; transition: width 0.1s ease; }
.progress-thumb { position: absolute; right: -6px; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; background: white; border-radius: 50%; opacity: 0; transition: opacity 0.2s; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); }
.player-content { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; padding: 12px 16px; gap: 16px; }
.song-section { display: flex; align-items: center; min-width: 0; }
.song-details { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
.song-cover { width: 48px; height: 48px; background: var(--color-border); border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.song-cover i { font-size: 20px; color: var(--color-muted); }
.song-text { min-width: 0; flex: 1; }
.song-title { font-size: 14px; font-weight: 500; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.song-artist { font-size: 12px; color: var(--color-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.controls-section { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.control-buttons { display: flex; align-items: center; gap: 16px; }
.icon-button { background: none; border: none; color: var(--color-muted); cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.icon-button:hover:not(:disabled) { color: var(--color-text); }
.icon-button.active { color: var(--color-accent); }
.icon-button:disabled { opacity: 0.3; cursor: not-allowed; }
.icon-button i { font-size: 16px; }
.play-button { width: 32px; height: 32px; background: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.play-button:hover:not(:disabled) { transform: scale(1.05); }
.play-button:disabled { opacity: 0.5; cursor: not-allowed; }
.play-button i { color: black; font-size: 14px; margin-left: 2px; }
.play-button .pi-pause { margin-left: 0; }
.time-display { display: flex; gap: 6px; font-size: 12px; color: var(--color-text); }
.extra-section { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.volume-container { width: 100px; }
.volume-slider { width: 100%; height: 4px; -webkit-appearance: none; appearance: none; background: var(--color-border); border-radius: 2px; outline: none; cursor: pointer; }
.volume-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 12px; height: 12px; background: white; border-radius: 50%; cursor: pointer; }
.volume-slider::-moz-range-thumb { width: 12px; height: 12px; background: white; border-radius: 50%; cursor: pointer; border: none; }
.modal-overlay { position: absolute; bottom: 100%; left: 0; right: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px); max-height: 60vh; }
.modal-content { background: var(--color-background); border-top: 1px solid var(--color-border); max-height: 60vh; display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--color-border); }
.modal-tabs { display: flex; gap: 8px; }
.tab-button { background: none; border: none; color: var(--color-muted); cursor: pointer; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
.tab-button:hover { background: var(--color-surface); color: var(--color-text); }
.tab-button.active { background: var(--color-accent); color: white; }
.close-button { background: none; border: none; color: var(--color-muted); cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.close-button:hover { background: var(--color-surface); color: var(--color-text); }
.modal-body { flex: 1; overflow-y: auto; padding: 24px; }
.queue-header { margin-bottom: 24px; }
.queue-header h3 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; color: var(--color-muted); }
.queue-list { display: flex; flex-direction: column; gap: 4px; }
.queue-item { display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 16px; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.queue-item:hover { background: var(--color-surface); }
.queue-item.active { background: var(--color-accent-hover); }
.queue-item.active .queue-item-title { color: var(--color-accent); }
.queue-item-number { text-align: center; font-size: 14px; }
.queue-item-info { min-width: 0; }
.queue-item-title { font-size: 14px; font-weight: 500; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.queue-item-artist { font-size: 12px; color: var(--color-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.queue-item-genre { font-size: 12px; color: var(--color-muted); }
.lyrics-container { max-width: 800px; margin: 0 auto; }
.lyrics-header { text-align: center; margin-bottom: 32px; }
.lyrics-header h3 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
.lyrics-content { color: var(--color-text); white-space: pre-line; line-height: 1.8; font-size: 14px; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from { transform: translateY(20px); opacity: 0; }
.slide-up-leave-to { transform: translateY(20px); opacity: 0; }
.modal-body::-webkit-scrollbar { width: 8px; }
.modal-body::-webkit-scrollbar-track { background: transparent; }
.modal-body::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
.modal-body::-webkit-scrollbar-thumb:hover { background: var(--color-muted); }
@media (max-width: 768px) {
    .player-content { grid-template-columns: 1fr auto 1fr; gap: 8px; }
    .volume-container { display: none; }
    .song-text { display: none; }
}
</style>