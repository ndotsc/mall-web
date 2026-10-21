import { createWebHistory, createRouter } from 'vue-router'
import Home from '@/views/Home.vue'
import Products from '@/views/Products.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import About from '@/views/About.vue'
import Contact from '@/views/Contact.vue'
import Cart from '@/views/Cart.vue'
import Checkout from '@/views/Checkout.vue'
import OrderSuccess from '@/views/OrderSuccess.vue'

const routes = [
    {
        name: 'home',
        path: '/',
        component: Home
    },
    {
        name: 'products',
        path: '/products',
        component: Products
    },
    {
        name: 'product',
        path: '/product/:id',
        component: ProductDetail
    },
    {
        name: 'about',
        path: '/about',
        component: About
    },
    {
        name: 'contact',
        path: '/contact',
        component: Contact
    },
    {
        name: 'cart',
        path: '/cart',
        component: Cart
    },
    {
        name: 'checkout',
        path: '/checkout',
        component: Checkout
    },
    {
        name: 'orderSuccess',
        path: '/order-success/:id',
        component: OrderSuccess
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router