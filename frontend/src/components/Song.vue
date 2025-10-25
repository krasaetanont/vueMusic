<script setup>
import { defineProps, ref } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
    song: {
        type: Object,
        required: true
    }
})


</script>
<template>
    <div class="" >
        <h1 @click="$emit('play', song)">{{ song.title }}</h1>
        <br/>
        <RouterLink 
        :to="`/artists/${song.artist}`"
        class=""
        >{{ song.artist }}</RouterLink>&nbsp;-&nbsp;
        <RouterLink
        :to="`/genres/${song.genre}`"
        class=""
        >{{ song.genre }}</RouterLink>
        <br/>
    </div>
</template>