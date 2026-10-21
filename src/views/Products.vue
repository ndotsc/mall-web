<script setup>
import { products } from '@/mock/products'
import { formatPrice } from '@/utils/format'
</script>

<template>
  <div class="container">
    <h1 class="page-title">全部商品</h1>
    <p class="muted page-sub">共 {{ products.length }} 件</p>

    <!-- 响应式网格：一行最多放多少列，由浏览器自己算，不用写媒体查询 -->
    <div class="grid">
      <RouterLink
        v-for="product in products"
        :key="product.id"
        :to="{ name: 'product', params: { id: product.id } }"
        class="card product-card"
      >
        <!-- aspect-ratio: 保证所有图片占位一致，不会因加载快慢抖动 -->
        <div class="thumb">
          <img :src="product.cover" :alt="product.name" />
        </div>
        <div class="info">
          <h3 class="name">{{ product.name }}</h3>
          <p class="desc muted">{{ product.desc }}</p>
          <div class="price price-sm">{{ formatPrice(product.price) }}</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 32px 0 4px;
}
.page-sub {
  margin-bottom: 24px;
}

/* 核心：auto-fill + minmax 实现自适应列数
   - 屏幕宽 → 放 4 列；屏幕窄 → 自动变 2 列、1 列
   - 比手写 @media 省事得多 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding-bottom: 40px;
}

.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;          /* 让图片圆角不溢出卡片 */
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: #d6dae0;
}

.thumb {
  aspect-ratio: 1 / 1;       /* 正方形图片区 */
  background: var(--c-bg);
  overflow: hidden;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;         /* 裁切填满，不变形 */
  transition: transform 0.3s;
}
.product-card:hover .thumb img {
  transform: scale(1.05);    /* 悬浮时图片轻微放大 */
}

.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
}

/* 商品名最多两行，超出显示省略号 —— 防止标题长短不一撑乱布局 */
.name {
  margin: 0;
  font-size: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc {
  margin: 0;
  flex: 1;                   /* 把价格顶到底部，保证所有卡片价格对齐 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
