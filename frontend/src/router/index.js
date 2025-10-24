import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import UploadView from '../views/UploadView.vue';
import PlaylistView from '../views/PlaylistView.vue';
import EditPlaylistView from '../views/EditPlaylistView.vue';
import EditSongView from '../views/EditSongView.vue';
import GenreView from '../views/GenreView.vue';


const routes = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/upload',
            name: 'upload',
            component: UploadView
        },
        {
            path: '/playlists',
            name: 'playlists',
            component: PlaylistView
        },
        {
            path: '/genres',
            name: 'genres',
            component: GenreView
        },
        {
            path: '/edit/playlist/:id',
            name: 'edit-playlist',
            component: EditPlaylistView
        },
        {
            path: '/edit/song/:id',
            name: 'edit-song',
            component: EditSongView
        },
    ]
})


export default routes;