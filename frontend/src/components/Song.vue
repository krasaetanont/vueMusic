<script setup>
import { defineProps } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
    song: {
        type: Object,
        required: true
    }
})

const playSong = (id) => {

}

</script>
<template>
    <div class="">
        <RouterLink 
        :to="`/songs/${song.id}`" 
        class="text-[var(--color-text-dark)] text-xl"
        >{{  song.title }}
        </RouterLink>
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