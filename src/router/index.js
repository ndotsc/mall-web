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
import CouponCenter from '@/views/CouponCenter.vue'
import MyCoupon from '@/views/MyCoupon.vue'
import Profile from '@/views/Profile.vue'
import MyFavorites from '@/views/MyFavorites.vue'
import MyOrders from '@/views/MyOrders.vue'
import Address from '@/views/Address.vue'
import NotFound from '@/views/NotFound.vue'
import { useUserStore } from '@/stores/user'
import { isLoggedIn } from '@/utils/auth'
import { me } from '@/api/auth'
import { setSeo } from '@/utils/seo'

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
  { name: 'home', path: '/', component: Home },
  { name: 'products', path: '/products', component: Products },
  { name: 'product', path: '/product/:id', component: ProductDetail },
  { name: 'about', path: '/about', component: About },
  { name: 'contact', path: '/contact', component: Contact },
  { name: 'cart', path: '/cart', component: Cart },
  { name: 'checkout', path: '/checkout', component: Checkout },
  { name: 'orderSuccess', path: '/order-success/:id', component: OrderSuccess },
  { name: 'login', path: '/login', component: Login },
  { name: 'coupons', path: '/coupons', component: CouponCenter },
  { name: 'myCoupons', path: '/my-coupons', component: MyCoupon },
  { name: 'favorites', path: '/favorites', component: MyFavorites },
  { name: 'myOrders', path: '/my-orders', component: MyOrders },
  { name: 'profile', path: '/profile', component: Profile },
  { name: 'address', path: '/address', component: Address },
  { name: 'admin', path: '/admin', component: Admin, beforeEnter: adminGuard },
  // 兼容旧链接
  { path: '/admin/products', redirect: '/admin' },
  // D26：history 模式下未匹配的 URL 之前是空白 router-view，现在有正经 404 页
  { name: 'notFound', path: '/:pathMatch(.*)*', component: NotFound },
]

// D26 SEO：把每个路由的 title / description / 是否允许索引集中在这里声明，
// 而不是散落在 17 个路由对象里，改文案时一眼能看全。
// 登录、管理、个人中心这类私有页统一 noindex，别让搜索引擎收一堆空壳页。
const SEO_META = {
  home: { title: '', description: 'Vue 3 + Vite + Node 全栈商城实战：浏览、搜索、加购、下单、收藏与优惠券。' },
  products: { title: '全部商品', description: '按分类、价格区间与上架时间筛选商城商品，支持关键词搜索与排序。' },
  product: { title: '商品详情', description: '查看商品图文详情、价格、用户评价并加入购物车。' },
  about: { title: '关于我们' },
  contact: { title: '联系我们' },
  coupons: { title: '领券中心', description: '领取满减、折扣与立减优惠券，下单时自动抵扣。' },
  cart: { title: '购物车', noindex: true },
  checkout: { title: '确认订单', noindex: true },
  orderSuccess: { title: '下单成功', noindex: true },
  login: { title: '登录', noindex: true },
  myCoupons: { title: '我的优惠券', noindex: true },
  favorites: { title: '我的收藏', noindex: true },
  myOrders: { title: '我的订单', noindex: true },
  profile: { title: '个人中心', noindex: true },
  address: { title: '收货地址', noindex: true },
  admin: { title: '后台管理', noindex: true },
  notFound: { title: '页面不存在', noindex: true },
}
for (const route of routes) {
  route.meta = { ...(route.meta || {}), ...(SEO_META[route.name] || {}) }
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 路由切换后回到顶部：SPA 不会像传统页面那样自动重置滚动位置
  scrollBehavior: () => ({ top: 0 }),
})

// 每次导航结束后同步 title / description / OG / canonical。
// 商品详情页会在数据回来后再调一次 setSeo，用商品名覆盖通用标题。
router.afterEach((to) => setSeo(to.meta || {}))

export default router
