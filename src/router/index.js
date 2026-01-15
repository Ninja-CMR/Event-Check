import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../views/RegisterView.vue'
import ScannerView from '../views/ScannerView.vue'

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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
