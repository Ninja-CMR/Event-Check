import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../views/RegisterView.vue'
import ScannerView from '../views/ScannerView.vue'
import GuestListView from '../views/GuestListView.vue'

const routes = [
    {
        path: '/',
        name: 'register',
        component: RegisterView
    },
    {
        path: '/scanner',
        name: 'scanner',
        component: ScannerView
    },
    {
        path: '/guests',
        name: 'guests',
        component: GuestListView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
