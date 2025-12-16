import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'home',
      redirect: '/ptz-control',
      meta: { requiresAuth: true }
    },
    {
      path: '/ptz-control',
      name: 'PTZControl',
      component: () => import('../views/ptz/PTZControl.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/video-list',
      name: 'VideoList',
      component: () => import('../views/video/VideoPlayback.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/video-playback/:deviceId',
      name: 'VideoPlayer',
      component: () => import('../views/video/VideoTimeline.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/video-recordings/:deviceId',
      name: 'RecordingsList',
      component: () => import('../views/video/RecordingsList.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/alarms',
      name: 'Alarms',
      component: () => import('../views/alarms/AlarmManagement.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/map',
      name: 'Map',
      component: () => import('../views/map/ElectronicMap.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard to check for authentication
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // Check if token exists in cookies
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='));
    if (!token) {
      // Redirect to login page if no token exists
      next('/login');
    } else {
      // Token exists, allow access
      next();
    }
  } else {
    // Route doesn't require authentication, allow access
    next();
  }
});

export default router