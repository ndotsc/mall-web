import { createWebHistory, createRouter } from 'vue-router'
import Home from '@/views/Home.vue'
import Products from '@/views/Products.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import About from '@/views/About.vue'
import Contact from '@/views/Contact.vue'
import Cart from '@/views/Cart.vue'
import Checkout from '@/views/Checkout.vue'
import OrderSuccess from '@/views/OrderSuccess.vue'
import Login from '@/views/Login.vue'
import Admin from '@/views/Admin.vue'
import { useUserStore } from '@/stores/user'
import { isLoggedIn } from '@/utils/auth'
import { me } from '@/api/auth'

async function adminGuard(to) {
  const userStore = useUserStore()
  if (!isLoggedIn()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (!userStore.user) {
    try {
      userStore.set(await me())
    } catch {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
  if (userStore.user?.role !== 2) {
    return { path: '/', replace: true }
  }
}

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
  },
  {
    name: 'products',
    path: '/products',
    component: Products,
  },
  {
    name: 'product',
    path: '/product/:id',
    component: ProductDetail,
  },
  {
    name: 'about',
    path: '/about',
    component: About,
  },
  {
    name: 'contact',
    path: '/contact',
    component: Contact,
  },
  {
    name: 'cart',
    path: '/cart',
    component: Cart,
  },
  {
    name: 'checkout',
    path: '/checkout',
    component: Checkout,
  },
  {
    name: 'orderSuccess',
    path: '/order-success/:id',
    component: OrderSuccess,
  },
  {
    name: 'login',
    path: '/login',
    component: Login,
  },
  {
    name: 'admin',
    path: '/admin',
    component: Admin,
    beforeEnter: adminGuard,
  },
  // 兼容旧链接
  { path: '/admin/products', redirect: '/admin' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
