<script setup>
import { RouterLink, useRoute } from 'vue-router'

const isActiveLink = (routePath) => {
  const route = useRoute()
  return route.path === routePath;
}
</script>
<template>
  <div class="flex flex-col">
    <RouterLink
      to="/"
      :class="[isActiveLink('/')
        ? 'bg-accent-hover text-[var(--color-accent)]'
        : 'hover:bg-accent hover:text-white', 'text-white',
          'px-3',
          'py-2',
          'rounded-md']"
        >Home
    </RouterLink>
    <RouterLink
      to="/playlists"
      :class="[isActiveLink('/playlists')
        ? 'bg-accent-hover text-[var(--color-accent)]'
        : 'hover:bg-accent hover:text-white', 'text-white',
          'px-3',
          'py-2',
          'rounded-md']"
        >Playlists
    </RouterLink>
    <RouterLink
      to="/Artists"
      :class="[isActiveLink('/Artists')
        ? 'bg-accent-hover text-[var(--color-accent)]'
        : 'hover:bg-accent hover:text-white', 'text-white',
          'px-3',
          'py-2',
          'rounded-md']"
        >Artists
    </RouterLink>
    <RouterLink
      to="/genres"
      :class="[isActiveLink('/genres')
        ? 'bg-accent-hover text-[var(--color-accent)]'
        : 'hover:bg-accent hover:text-white', 'text-white',
          'px-3',
          'py-2',
          'rounded-md']"
        >Genres
    </RouterLink>
    <!-- <RouterLink
      to="/upload"
      :class="[isActiveLink('/playlists')
        ? 'bg-accent-hover text-[var(--color-accent)]'
        : 'hover:bg-accent hover:text-white', 'text-white',
          'px-3',
          'py-2',
          'rounded-md']"
        >Upload
    </RouterLink> -->
      
  </div>
</template>