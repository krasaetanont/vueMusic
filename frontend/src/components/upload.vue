<script setup>
import { ref, defineEmits } from 'vue';
import axios from 'axios';

const emit = defineEmits(['close', 'uploaded']);

const formData = ref({
  title: '',
  artist: '',
  genre: ''
});

const selectedFile = ref(null);
const isUploading = ref(false);
const uploadMessage = ref('');
const uploadError = ref('');

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('audio/')) {
    selectedFile.value = file;
    uploadError.value = '';
  } else {
    uploadError.value = 'Please select a valid audio file';
    selectedFile.value = null;
  }
};

const handleUpload = async () => {
  // Validation
  if (!formData.value.title || !formData.value.artist || !formData.value.genre) {
    uploadError.value = 'Please fill in all fields';
    return;
  }

  if (!selectedFile.value) {
    uploadError.value = 'Please select a file to upload';
    return;
  }

  isUploading.value = true;
  uploadError.value = '';
  uploadMessage.value = '';

  try {
    const data = new FormData();
    data.append('title', formData.value.title);
    data.append('artist', formData.value.artist);
    data.append('genre', formData.value.genre);
    data.append('musicFile', selectedFile.value);

    const response = await axios.post('http://localhost:3000/api/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    uploadMessage.value = 'Upload successful!';
    
    // Reset form
    formData.value = {
      title: '',
      artist: '',
      genre: ''
    };
    selectedFile.value = null;
    
    // Emit event to parent
    emit('uploaded');
    
    // Close modal after 2 seconds
    setTimeout(() => {
      emit('close');
    }, 2000);

  } catch (error) {
    console.error('Upload error:', error);
    uploadError.value = error.response?.data?.error || 'Failed to upload file';
  } finally {
    isUploading.value = false;
  }
};

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Upload Music</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleUpload">
          <div class="form-group">
            <label for="title">Title</label>
            <input 
              type="text" 
              id="title" 
              v-model="formData.title"
              placeholder="Enter song title"
              required
            />
          </div>

          <div class="form-group">
            <label for="artist">Artist</label>
            <input 
              type="text" 
              id="artist" 
              v-model="formData.artist"
              placeholder="Enter artist name"
              required
            />
          </div>

          <div class="form-group">
            <label for="genre">Genre</label>
            <input 
              type="text" 
              id="genre" 
              v-model="formData.genre"
              placeholder="Enter genre"
              required
            />
          </div>

          <div class="form-group">
            <label for="file">Music File</label>
            <input 
              type="file" 
              id="file" 
              @change="handleFileSelect"
              accept="audio/*"
              required
            />
            <span v-if="selectedFile" class="file-name">
              Selected: {{ selectedFile.name }}
            </span>
          </div>

          <div v-if="uploadMessage" class="success-message">
            {{ uploadMessage }}
          </div>

          <div v-if="uploadError" class="error-message">
            {{ uploadError }}
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-cancel" 
              @click="closeModal"
              :disabled="isUploading"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-upload"
              :disabled="isUploading"
            >
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
