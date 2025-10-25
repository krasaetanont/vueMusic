<script setup>
import { provide } from 'vue';
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Player from './components/Player.vue';

// Provide a global play function
const playSong = (song) => {
    // Dispatch custom event that Player component will listen to
    const event = new CustomEvent('play-song', { detail: song });
    window.dispatchEvent(event);
};

provide('playSong', playSong);
</script>

<template>
  <div class="flex mt-4 ml-4 mb-4 items-center">
    <i class="pi pi-sparkles" style="font-size: 2.5rem"></i>
    <h1 class="text-2xl mx-4">sparkleMusic</h1>
  </div>
  <div class="flex" style="margin-bottom: 120px;">
    <router-view />
    <Navbar />
  </div>
  <Player />
</template>