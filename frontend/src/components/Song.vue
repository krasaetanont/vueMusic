<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { useRoute } from 'vue-router';
import { onClickOutside } from '@vueuse/core'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const showMenu = ref(false);
const menuRef = ref(null)
const route = useRoute();
const itemId = route.params.id;
const itemType = route.path.split('/')[1];

const props = defineProps({
    song: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['play', 'removed']);

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

// Toggle dropdown
const toggleMenu = (event) => {
  event.stopPropagation();
  showMenu.value = !showMenu.value;
}

// Delete from playlist handler
const onDeleteFromPlaylist = async () => {
  try {
    showMenu.value = false;

    if (!itemId || !props.song || !props.song.id) {
      console.error('Missing playlist id or song id');
      return;
    }

    const res = await fetch(`${API_BASE}/api/playlists/${encodeURIComponent(itemId)}/musics/${encodeURIComponent(props.song.id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Failed to remove music from playlist', err);
      alert(err.error || 'Failed to remove song from playlist');
      return;
    }

    // notify parent to update UI
    emit('removed', props.song.id);

  } catch (error) {
    console.error('Error removing music from playlist', error);
    alert('Error removing song from playlist');
  }
}

// Delete song completely (from database and file system)
const onDeleteSong = async () => {
  try {
    showMenu.value = false;

    if (!props.song || !props.song.id) {
      console.error('Missing song id');
      return;
    }

    // Confirm deletion
    const confirmDelete = confirm(`Are you sure you want to permanently delete "${props.song.title}"? This will remove the song from all playlists and delete the audio file.`);
    if (!confirmDelete) return;

    const res = await fetch(`${API_BASE}/api/musics/${encodeURIComponent(props.song.id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Failed to delete song', err);
      alert(err.error || 'Failed to delete song');
      return;
    }

    // notify parent to update UI
    emit('removed', props.song.id);

  } catch (error) {
    console.error('Error deleting song', error);
    alert('Error deleting song');
  }
}

onClickOutside(menuRef, () => showMenu.value = false)
</script>

<template>
  <div
    class="song-item relative flex flex-row items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ease-in-out"
    @click="handlePlay"
  >
    <div>
      <h3 class="song-title text-lg font-semibold text-text mb-1 transition-colors duration-200">
        {{ song.title }}
      </h3>
      <div class="text-sm text-muted">
        <span>{{ getArtistNames() }}</span>
        <span v-if="getGenreNames()"> • {{ getGenreNames() }}</span>
      </div>
    </div>

    <div ref="menuRef" class="relative">
      <button
        @click.stop="toggleMenu"
        class="p-2 rounded-full hover:bg-surface transition"
      >
        <i class="pi pi-ellipsis-v text-muted"></i>
      </button>

      <!-- dropdown menu -->
      <div
        v-if="showMenu"
        class="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg z-10"
      >
        <!-- Remove from Playlist option (only show in playlist view) -->
        <button
          v-if="itemType === 'playlist'"
          @click="onDeleteFromPlaylist"
          class="block w-full text-left px-4 py-2 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors first:rounded-t-xl"
        >
          <i class="pi pi-minus-circle mr-2"></i> Remove from Playlist
        </button>
        
        <!-- Delete Song Completely option (show everywhere) -->
        <button
          @click="onDeleteSong"
          class="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          :class="{ 'rounded-xl': itemType !== 'playlist', 'rounded-b-xl': itemType === 'playlist' }"
        >
          <i class="pi pi-trash mr-2"></i> Delete Song
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.song-item {
  transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease;
  will-change: transform, box-shadow;
}

/* subtle lift + shadow + background on hover */
.song-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  background: var(--color-surface);
}

/* change title color on hover */
.song-item:hover .song-title {
  color: var(--color-text-dark);
  transition: color 0.12s ease;
}
</style>