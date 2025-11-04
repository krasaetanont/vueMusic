<script setup>
import { defineProps } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    type: {
        type: String,
        required: true
    },
})


</script>

<template>
    <div class="">
        <RouterLink :to="`/${type}/${item.id}`" class="no-underline" :artist="item">
            <h3 class="text-lg font-semibold text-text mb-2">{{ item.name }}</h3>
        </RouterLink>
    </div>
</template>