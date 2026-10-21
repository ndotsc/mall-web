<script setup>
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'

const cart = useCartStore()
// ⚠️ 重点：想「解构」store 里的值，必须用 storeToRefs 包一层。
// 直接写 const { count } = cart 会拿到一个死数字，加购后页面不会变。
const { count } = storeToRefs(cart)
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <!-- 左侧：Logo -->
      <RouterLink to="/" class="logo">
        MY<span>SHOP</span>
      </RouterLink>

      <!-- 中间：导航。Vue Router 会自动给当前页面的链接加上 router-link-active 类 -->
      <nav class="nav">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/products">商品</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
        <RouterLink to="/contact">联系</RouterLink>
      </nav>

      <!-- 右侧：购物车角标 -->
      <RouterLink to="/cart" class="cart">
        <span class="cart-icon">🛒</span>
        <span class="cart-text">购物车</span>
        <span v-if="count > 0" class="badge">{{ count }}</span>
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  /* sticky：滚动时吸顶。top:0 + z-index 是它的固定搭档 */
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);   /* 毛玻璃效果 */
  border-bottom: 1px solid var(--c-border);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 64px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--c-text);
}
.logo span {
  color: var(--c-brand);
}

.nav {
  display: flex;
  gap: 4px;
}
.nav a {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-size: 15px;
  color: var(--c-text-weak);
  transition: background 0.18s, color 0.18s;
}
.nav a:hover {
  background: var(--c-bg);
  color: var(--c-text);
}
/* Vue Router 自动加的类名，不用自己写 JS 判断 */
.nav a.router-link-active {
  background: var(--c-brand-weak);
  color: var(--c-brand);
  font-weight: 500;
}

.cart {
  position: relative;   /* 给角标的 absolute 定位做参照 */
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-pill);
  font-size: 15px;
  color: var(--c-text-weak);
  white-space: nowrap;
}

/* 角标：absolute 相对于 .cart 定位到右上角 */
.badge {
  position: absolute;
  top: -6px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  background: var(--c-danger);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
}

/* 窄屏：隐藏「购物车」三个字，只留图标，省空间 */
@media (max-width: 560px) {
  .cart-text { display: none; }
  .nav a { padding: 6px 10px; }
}
</style>
