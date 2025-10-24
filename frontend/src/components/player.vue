<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const musicUrl = 'http://localhost:3000/api/musicFiles/Free-Huntrix.mp3';
</script>

<template>
    <div class="fixed bottom-0 left-0 w-full text-white p-4 flex items-center justify-center">
        <audio controls :src="musicUrl"></audio>
    </div>
</template>