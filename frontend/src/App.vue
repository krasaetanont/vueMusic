<script setup>
import { provide } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Player from './components/Player.vue';
import SearchBar from './components/SearchBar.vue';
import LoginButton from './components/LoginButton.vue';
import { authState } from './store/auth';

console.log('Auth State:', authState);
// Provide a global play function
const playSong = (song) => {
    // Dispatch custom event that Player component will listen to
    const event = new CustomEvent('play-song', { detail: song });
    window.dispatchEvent(event);
};

provide('playSong', playSong);
</script>

<template>
  <div class="app-header">
    <RouterLink 
      to="/"
      class="logo-link">
      <i class="pi pi-sparkles logo-icon"></i>
      <h1 class="logo-text">sparkleMusic</h1>
    </RouterLink>
    <div v-if="authState.isAuthenticated" class="search-wrapper">
      <SearchBar />
    </div>
    <div v-if="!authState.isAuthenticated">
      <LoginButton />
    </div>

    <div v-else>
      <span>Welcome, {{ authState.user?.name }}</span>
    </div>
  </div>
  <div v-if="authState.isAuthenticated" class="main-content">
    <div class="content-area">
      <router-view />
    </div>
    <aside class="sidebar">
      <Navbar />
    </aside>
  <Player />  
  </div>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  gap: 24px;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-background);
  z-index: 100;
  backdrop-filter: blur(10px);
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-text);
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 2.5rem;
  color: var(--color-accent);
}

.logo-text {
  font-size: 1.5rem;
  margin: 0 0 0 16px;
  font-weight: 600;
}

.search-wrapper {
  flex: 1;
  max-width: 600px;
  min-width: 0;
}

.main-content {
  display: flex;
  min-height: calc(100vh - 200px);
  margin-bottom: 120px;
}

.content-area {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 200px;
  padding: 16px;
  border-left: 1px solid var(--color-border);
  position: sticky;
  top: 80px;
  height: fit-content;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .app-header {
    padding: 12px 16px;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .sidebar {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .app-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .logo-link {
    order: 1;
  }

  .search-wrapper {
    order: 2;
    width: 100%;
    max-width: 100%;
  }

  .main-content {
    flex-direction: column-reverse;
    margin-bottom: 140px;
  }

  .sidebar {
    width: 100%;
    border-left: none;
    border-bottom: 1px solid var(--color-border);
    position: static;
    padding: 12px;
  }

  .logo-icon {
    font-size: 2rem;
  }

  .logo-text {
    font-size: 1.125rem;
    margin-left: 12px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 12px;
  }

  .logo-icon {
    font-size: 1.75rem;
  }

  .logo-text {
    font-size: 1rem;
  }
}
</style>