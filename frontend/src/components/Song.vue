<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    song: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['play']);

const handlePlay = () => {
    emit('play', props.song);
};

const getArtistNames = () => {
    if (props.song.artists && Array.isArray(props.song.artists)) {
        return props.song.artists.map(a => a.name).join(', ');
    }
    return props.song.artist || 'Unknown Artist';
};

const getGenreNames = () => {
    if (props.song.genres && Array.isArray(props.song.genres)) {
        return props.song.genres.map(g => g.name).join(', ');
    }
    return props.song.genre || 'Unknown Genre';
};
</script>

<template>
    <div class="song-item p-3 rounded-lg hover:bg-surface cursor-pointer transition-colors" @click="handlePlay">
        <h3 class="text-lg font-semibold text-[var(--color-text)] mb-1">{{ song.title }}</h3>
        <div class="text-sm text-[var(--color-muted)]">
            <span>{{ getArtistNames() }}</span>
            <span v-if="getGenreNames()"> • {{ getGenreNames() }}</span>
        </div>
    </div>
</template>

<style scoped>
.song-item:hover h3 {
    color: var(--color-accent);
}
</style>