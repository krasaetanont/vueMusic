<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const playlistName = ref('');
const isCreating = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const createPlaylist = async () => {
  // Clear previous messages
  errorMessage.value = '';
  successMessage.value = '';

  // Validation
  if (!playlistName.value.trim()) {
    errorMessage.value = 'Please enter a playlist name';
    return;
  }

  isCreating.value = true;

  try {
    const response = await axios.post('/api/playlists', {
      name: playlistName.value.trim()
    });

    successMessage.value = 'Playlist created successfully!';
    
    // Clear form
    playlistName.value = '';

    // Redirect to playlists page after 1.5 seconds
    setTimeout(() => {
      router.push('/playlists');
    }, 1500);

  } catch (error) {
    console.error('Error creating playlist:', error);
    
    if (error.response?.status === 409) {
      errorMessage.value = 'A playlist with this name already exists';
    } else {
      errorMessage.value = error.response?.data?.error || 'Failed to create playlist';
    }
  } finally {
    isCreating.value = false;
  }
};

const cancel = () => {
  router.push('/playlists');
};
</script>

<template>
  <div class="w-full p-4 max-w-2xl">
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-2">Create New Playlist</h2>
      <p class="text-muted text-sm">Enter a name for your new playlist</p>
    </div>

    <form @submit.prevent="createPlaylist" class="space-y-4">
      <div class="form-group">
        <label for="playlistName" class="block text-sm font-medium mb-2">
          Playlist Name <span class="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          id="playlistName"
          v-model="playlistName"
          placeholder="Enter playlist name" 
          class="w-full"
          :disabled="isCreating"
          maxlength="100"
        />
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        <i class="pi pi-check-circle mr-2"></i>
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        <i class="pi pi-exclamation-circle mr-2"></i>
        {{ errorMessage }}
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-4">
        <button 
          type="button"
          @click="cancel"
          class="btn btn-cancel"
          :disabled="isCreating"
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="btn btn-primary"
          :disabled="isCreating || !playlistName.trim()"
        >
          <i v-if="isCreating" class="pi pi-spinner pi-spin mr-2"></i>
          <i v-else class="pi pi-plus mr-2"></i>
          {{ isCreating ? 'Creating...' : 'Create Playlist' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-group label {
  color: var(--color-text);
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

.btn-primary {
  background: var(--color-accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}
</style>