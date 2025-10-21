<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const musicUrl = 'http://localhost:3000/api/musicFiles/Free-Huntrix.mp3';
</script>

<template>
    <div class="music-player">
        <audio controls :src="musicUrl"></audio>
    </div>
</template>