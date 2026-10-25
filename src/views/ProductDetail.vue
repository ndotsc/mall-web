<script setup>
// import { products } from '@/mock/products'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'
import { ref, onMounted, watch } from 'vue'
import { getProduct } from '@/api/products'

const route = useRoute()
const store = useCartStore()
const product = ref(null)
const loading = ref(true)
async function load() {
  loading.value = true
  try {
    product.value = await getProduct(route.params.id)
  } catch (e) {
    product.value = null
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => route.params.id, load)

// 用 computed 包一层：切换 /product/1 -> /product/2 时组件被复用，
// 只有 computed 会重新计算（普通变量不会，会显示上一个商品）
// const product = computed(() =>
//   products.find(item => item.id === Number(route.params.id))
// )
</script>

<template>
  <!-- 找不到商品时的兜底，必须有 -->
  <div v-if="!product" class="container empty">
    <h2>商品不存在</h2>
    <p class="muted">你访问的商品可能已下架，或链接有误。</p>
    <RouterLink to="/products" class="btn btn-ghost">返回商品列表</RouterLink>
  </div>

  <div v-else class="container">
    <div class="detail">
      <!-- 左：图 -->
      <div class="card gallery">
        <img :src="product.cover" :alt="product.name" />
      </div>

      <!-- 右：信息 -->
      <div class="info">
        <h1>{{ product.name }}</h1>
        <p class="muted">{{ product.desc }}</p>

        <div class="price-row">
          <span class="price">{{ formatPrice(product.price) }}</span>
          <span class="tag">包邮</span>
        </div>

        <div class="actions">
          <button class="btn" @click="store.add(product)">加入购物车</button>
          <RouterLink to="/products" class="btn btn-ghost">继续逛逛</RouterLink>
        </div>

        <ul class="meta muted">
          <li>· 7 天无理由退换</li>
          <li>· 48 小时内发货</li>
          <li>· 全国联保</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 两栏布局：宽屏左右分栏，窄屏自动堆叠成一列 */
.detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 32px 0;
  align-items: start;   /* 不要把左图拉高和右边一样长 */
}

.gallery {
  overflow: hidden;
  padding: 16px;
}
.gallery img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: var(--radius);
}

.info h1 {
  font-size: 28px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  padding: 16px 20px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
}
.price {
  font-size: 28px;
}

.tag {
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background: var(--c-brand-weak);
  color: var(--c-brand);
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.meta {
  list-style: none;
  margin: 0;
  padding: 16px 0 0;
  border-top: 1px dashed var(--c-border);
}
.meta li {
  margin-bottom: 6px;
}

.empty {
  padding: 80px 0;
  text-align: center;
}
.empty .btn {
  margin-top: 16px;
}

/* 窄屏单列 */
@media (max-width: 768px) {
  .detail {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .info h1 {
    font-size: 22px;
  }
}
</style>
