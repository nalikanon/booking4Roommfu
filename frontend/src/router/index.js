import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'

const routes = [
    { path: '/', component: Login, meta: { title: 'Login' } },
    { path: '/auth/callback', component: () => import('../views/AuthCallback.vue'), meta: { title: 'Loading' } },
    { path: '/select-room', component: () => import('../views/selectRoom.vue'), meta: { title: 'Home' } },
    { path: '/classroom-list', component: () => import('../views/ClassroomList.vue'), meta: { title: 'Room List' } },
    { path: '/history', component: () => import('../views/History.vue'), meta: { title: 'Booking History' } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.afterEach((to) => {
    const title = to.meta?.title
    document.title = title ? `${title} - Roombooking` : 'Roombooking'
})

export default router
