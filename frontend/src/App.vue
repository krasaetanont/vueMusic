<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Player from './components/player.vue';
</script>

<template>
  <div class="flex mt-4 ml-4 mb-4 items-center">
    <i class="pi pi-sparkles" style="font-size: 2.5rem"></i>
    <h1 class="text-2xl mx-4">sparkleMusic</h1>
  </div>
  <div class="flex">
    <router-view />
    <Navbar />
  </div>
  <Player />
</template>

