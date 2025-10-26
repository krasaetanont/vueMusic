<script setup>
    import SongListing from '../components/SongListing.vue';
    import PlaylistListing from '../components/PlaylistListing.vue';
    import ArtistListing from '../components/ArtistListing.vue';
    import GenreListing from '../components/GenreListing.vue';
</script>

<template>
    <div class="flex flex-col w-full p-4 space-y-8">
        <GenreListing />
    </div>
</template>