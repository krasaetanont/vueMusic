<style scoped>
.upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.upload-header {
  margin-bottom: 32px;
}

.upload-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-text-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.upload-subtitle {
  color: var(--color-muted);
  font-size: 1rem;
  margin: 0;
}

.upload-body {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* File Upload Area */
.file-upload-area {
  position: relative;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: 48px 24px;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--color-background);
}

.file-upload-area.dragging {
  border-color: var(--color-accent);
  background: rgba(204, 156, 223, 0.05);
  transform: scale(1.02);
}

.file-upload-area.has-file {
  border-style: solid;
  border-color: var(--color-accent);
  background: rgba(204, 156, 223, 0.03);
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 4rem;
  color: var(--color-accent);
  opacity: 0.8;
}

.upload-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
}

.upload-or {
  color: var(--color-muted);
  font-size: 0.875rem;
  margin: 0;
}

.browse-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.browse-button:hover {
  background: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(204, 156, 223, 0.3);
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 8px 0 0 0;
}

/* File Preview */
.file-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.file-icon-wrapper {
  width: 56px;
  height: 56px;
  background: var(--color-accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon {
  font-size: 28px;
  color: white;
}

.file-details {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.file-name {
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin: 0;
}

.remove-file-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-border);
  border: none;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.remove-file-btn:hover:not(:disabled) {
  background: #ef4444;
  color: white;
}

.remove-file-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form Fields */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label i {
  color: var(--color-accent);
}

.required {
  color: #ef4444;
}

.form-input {
  padding: 12px 16px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(204, 156, 223, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.alert i {
  font-size: 1.125rem;
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn {
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  min-width: 140px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-secondary {
  background: var(--color-border);
  color: var(--color-text);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-muted);
}

.btn-primary {
  background: var(--color-accent);
  color: white;
  box-shadow: 0 2px 8px rgba(204, 156, 223, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(204, 156, 223, 0.4);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .upload-container {
    padding: 16px;
  }

  .upload-body {
    padding: 24px;
  }

  .upload-title {
    font-size: 1.5rem;
  }

  .file-upload-area {
    padding: 32px 16px;
  }

  .upload-icon {
    font-size: 3rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
<script setup>
import { ref, defineEmits } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const emit = defineEmits(['close', 'uploaded']);
const router = useRouter();

const formData = ref({
  title: '',
  artist: '',
  genre: ''
});

const selectedFile = ref(null);
const isUploading = ref(false);
const uploadMessage = ref('');
const uploadError = ref('');
const isDragging = ref(false);

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  validateAndSetFile(file);
};

const validateAndSetFile = (file) => {
  if (file && file.type.startsWith('audio/')) {
    selectedFile.value = file;
    uploadError.value = '';
  } else {
    uploadError.value = 'Please select a valid audio file';
    selectedFile.value = null;
  }
};

const handleDragOver = (event) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  validateAndSetFile(file);
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

    const response = await axios.post('/api/upload', data, {
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
    
    // Redirect to musics page after short delay
    setTimeout(() => {
      router.push('/musics');
    }, 1000);

  } catch (error) {
    console.error('Upload error:', error);
    uploadError.value = error.response?.data?.error || 'Failed to upload file';
  } finally {
    isUploading.value = false;
  }
};

const removeFile = () => {
  selectedFile.value = null;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
</script>

<template>
  <div class="upload-container">
    <div class="upload-header">
      <div>
        <h2 class="upload-title">Upload Music</h2>
        <p class="upload-subtitle">Share your music with the world</p>
      </div>
    </div>

    <div class="upload-body">
      <form @submit.prevent="handleUpload" class="upload-form">
        <!-- File Upload Area -->
        <div 
          class="file-upload-area"
          :class="{ 
            'dragging': isDragging,
            'has-file': selectedFile
          }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <input 
            type="file" 
            id="file" 
            @change="handleFileSelect"
            accept="audio/*"
            class="file-input"
            :disabled="isUploading"
          />
          
          <div v-if="!selectedFile" class="upload-prompt">
            <i class="pi pi-cloud-upload upload-icon"></i>
            <p class="upload-text">Drag & drop your audio file here</p>
            <p class="upload-or">or</p>
            <label for="file" class="browse-button">
              Browse Files
            </label>
            <p class="upload-hint">Supported formats: MP3, WAV, OGG (Max 50MB)</p>
          </div>

          <div v-else class="file-preview">
            <div class="file-icon-wrapper">
              <i class="pi pi-file-audio file-icon"></i>
            </div>
            <div class="file-details">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
            <button 
              type="button" 
              @click="removeFile" 
              class="remove-file-btn"
              :disabled="isUploading"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="form-fields">
          <div class="form-row">
            <div class="form-group">
              <label for="title" class="form-label">
                <i class="pi pi-music"></i>
                Song Title <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="title" 
                v-model="formData.title"
                placeholder="Enter song title"
                class="form-input"
                :disabled="isUploading"
                required
              />
            </div>

            <div class="form-group">
              <label for="artist" class="form-label">
                <i class="pi pi-user"></i>
                Artist <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="artist" 
                v-model="formData.artist"
                placeholder="Enter artist name"
                class="form-input"
                :disabled="isUploading"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="genre" class="form-label">
              <i class="pi pi-tag"></i>
              Genre <span class="required">*</span>
            </label>
            <input 
              type="text" 
              id="genre" 
              v-model="formData.genre"
              placeholder="e.g., Pop, Rock, Jazz"
              class="form-input"
              :disabled="isUploading"
              required
            />
          </div>
        </div>

        <!-- Messages -->
        <Transition name="fade">
          <div v-if="uploadMessage" class="alert alert-success">
            <i class="pi pi-check-circle"></i>
            <span>{{ uploadMessage }}</span>
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="uploadError" class="alert alert-error">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ uploadError }}</span>
          </div>
        </Transition>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="router.back()"
            :disabled="isUploading"
          >
            <i class="pi pi-arrow-left"></i>
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="isUploading || !selectedFile || !formData.title || !formData.artist || !formData.genre"
          >
            <i v-if="isUploading" class="pi pi-spinner pi-spin"></i>
            <i v-else class="pi pi-upload"></i>
            {{ isUploading ? 'Uploading...' : 'Upload Music' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>