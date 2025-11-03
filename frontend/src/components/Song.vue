<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { useRoute } from 'vue-router';
import { onClickOutside } from '@vueuse/core'

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

const emit = defineEmits(['play', 'removed']); // added 'removed' event

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
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// Delete handler: remove music from playlist on backend
const onDelete = async () => {
  try {
    // close menu immediately for better UX
    showMenu.value = false;

    if (!itemId || !props.song || !props.song.id) {
      console.error('Missing playlist id or song id');
      return;
    }

    const res = await fetch(`http://localhost:3000/api/playlists/${encodeURIComponent(itemId)}/musics/${encodeURIComponent(props.song.id)}`, {
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

    // reload page so UI reflects backend state (small delay for smoother UX)
    setTimeout(() => {
      window.location.reload();
    }, 150);

  } catch (error) {
    console.error('Error removing music from playlist', error);
    alert('Error removing song from playlist');
  }
}
onClickOutside(menuRef, () => showMenu.value = false)
</script>

<template>
    <div class="song-item flex flex-row items-center justify-between p-3 rounded-lg hover:bg-surface cursor-pointer transition-colors" @click="handlePlay">
        <div>
            <h3 class="text-lg font-semibold text-[var(--color-text)] mb-1">{{ song.title }}</h3>
            <div class="text-sm text-[var(--color-muted)]">
                <span>{{ getArtistNames() }}</span>
                <span v-if="getGenreNames()"> • {{ getGenreNames() }}</span>
            </div>
        </div>
        <div 
            v-if="itemType == 'playlist'"
            ref="menuRef">
            <button
                @click.stop="toggleMenu"
                class="p-2 rounded-full hover:bgj-[var(--color-hover)] transition"
            >
                <i class="pi pi-ellipsis-v right-0"></i>
            </button>
            <!-- dropdown menu -->
            <div 
                v-if="showMenu" 
                class="absolute right-0 mt-2 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-10"
            >
            <button
                @click="onDelete"
                class="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white"
            >
                <i class="pi pi-trash mr-2"></i> Delete

            </button>
            </div>
        </div>
    </div>
    
</template>
