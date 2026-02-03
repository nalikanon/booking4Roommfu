import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'

const routes = [
    { path: '/', component: Login },
    { path: '/select-room', component: () => import('../views/selectRoom.vue') },
    { path: '/classroom-list', component: () => import('../views/ClassroomList.vue') },
    { path: '/history', component: () => import('../views/History.vue') }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
