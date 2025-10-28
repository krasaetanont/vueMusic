import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import UploadView from '../views/UploadView.vue';
import PlaylistsView from '../views/PlaylistsView.vue'
import GenresView from '../views/GenresView.vue';
import ArtistsView from '../views/ArtistsView.vue';
import AddPlaylistView from '../views/AddPlaylistView.vue';
import EachGroupView from '../views/EachGroupView.vue';
import AddToPlaylistView from '../views/AddToPlaylistView.vue';


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
            component: PlaylistsView
        },
        {
            path: '/genres',
            name: 'genres',
            component: GenresView
        },
        {
            path: '/artists',
            name: 'artists',
            component: ArtistsView
        },
        {
            path: '/:group/:id',
            name: 'each-group',
            component: EachGroupView,
        },
        {
            path: '/add/playlist',
            name: 'add-playlist',
            component: AddPlaylistView
        },
        {
            path: '/add/to-playlist/:id',
            name: 'add-to-playlist',
            component: AddToPlaylistView
        }
    ]
})


export default routes;