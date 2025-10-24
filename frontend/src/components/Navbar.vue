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
      
  </div>
</template>