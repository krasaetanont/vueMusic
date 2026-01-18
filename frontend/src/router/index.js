import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import UploadView from '../views/UploadView.vue';
import PlaylistsView from '../views/PlaylistsView.vue';
import GenresView from '../views/GenresView.vue';
import ArtistsView from '../views/ArtistsView.vue';
import AddPlaylistView from '../views/AddPlaylistView.vue';
import EachGroupView from '../views/EachGroupView.vue';
import AddToPlaylistView from '../views/AddToPlaylistView.vue';
import MusicsView from '../views/MusicsView.vue';
import { authState } from '../store/auth';

const routes = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: false }
        },
        {
            path: '/upload',
            name: 'upload',
            component: UploadView,
            meta: { requiresAuth: true }
        },
        {
            path: '/playlists',
            name: 'playlists',
            component: PlaylistsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/genres',
            name: 'genres',
            component: GenresView,
            meta: { requiresAuth: true }
        },
        {
            path: '/artists',
            name: 'artists',
            component: ArtistsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/musics',
            name: 'musics',
            component: MusicsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/:group/:id',
            name: 'each-group',
            component: EachGroupView,
            meta: { requiresAuth: true }
        },
        {
            path: '/add/playlist',
            name: 'add-playlist',
            component: AddPlaylistView,
            meta: { requiresAuth: true }
        },
        {
            path: '/add/to-playlist/:id',
            name: 'add-to-playlist',
            component: AddToPlaylistView,
            meta: { requiresAuth: true }
        }
    ]
});

// Navigation guard to check authentication
routes.beforeEach((to, from, next) => {
    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    if (requiresAuth && !authState.isAuthenticated) {
        // Redirect to home page if not authenticated
        next({ path: '/' });
    } else {
        // Allow navigation
        next();
    }
});

export default routes;