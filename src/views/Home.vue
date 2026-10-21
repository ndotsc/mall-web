<script setup>
import { products } from '@/mock/products'
import { formatPrice } from '@/utils/format'
// 推荐位：只取前 3 件（slice 不会改动原数组）
const featured = products.slice(0, 1)
</script>

<template>
  <!-- Hero 首屏：一整块带底色的区域，是首页的门面 -->
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-text">
        <h1>用 Vue3 搭一个<br />属于你自己的商城</h1>
        <p class="muted">
          从组件化到路由，从状态管理到多端发布，一步一步把想法做出来。
        </p>
        <RouterLink to="/products" class="btn">立即逛逛</RouterLink>
      </div>
    </div>
  </section>

  <div class="container">
    <h2 class="section-title">热门推荐</h2>
    <div class="grid">
      <RouterLink
        v-for="p in featured"
        :key="p.id"
        :to="{ name: 'product', params: { id: p.id } }"
        class="card product-card"
      >
        <div class="thumb"><img :src="p.cover" :alt="p.name" /></div>
        <div class="info">
          <h3 class="name">{{ p.name }}</h3>
          <div class="price price-sm">{{ formatPrice(p.price) }}</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
/* 渐变背景 + 居中，是最省事的首屏做法 */
.hero {
  background: linear-gradient(135deg, #eef4ff 0%, #f6f7f9 60%);
  border-bottom: 1px solid var(--c-border);
}
.hero-inner {
  padding: 72px 20px;
}
.hero-text h1 {
  font-size: 40px;
  margin-bottom: 16px;
}
.hero-text p {
  max-width: 460px;
  margin-bottom: 24px;
  font-size: 17px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding-bottom: 40px;
}

.product-card {
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
.thumb {
  aspect-ratio: 1 / 1;
  background: var(--c-bg);
  overflow: hidden;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  padding: 14px;
}
.name {
  margin: 0 0 6px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .hero-inner { padding: 48px 20px; }
  .hero-text h1 { font-size: 28px; }
}
</style>
