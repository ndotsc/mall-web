<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'
import { isLoggedIn } from '@/utils/auth'
import { ElMessage } from 'element-plus'
import { getProduct } from '@/api/products'
import { getReviews, createReview } from '@/api/review'
import { checkFavorite, addFavorite, removeFavorite } from '@/api/favorite'

const route = useRoute()
const router = useRouter()
const store = useCartStore()

const product = ref(null)
const loading = ref(true)

// ---- 收藏状态 ----
const favorited = ref(false)
const favLoading = ref(false)

async function loadFav() {
  if (!isLoggedIn() || !product.value) {
    favorited.value = false
    return
  }
  try {
    const data = await checkFavorite(product.value.id)
    favorited.value = !!data.favorited
  } catch {
    favorited.value = false
  }
}

async function toggleFav() {
  // 未登录先去登录，回来继续看这个商品
  if (!isLoggedIn()) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (favLoading.value) return
  favLoading.value = true
  try {
    if (favorited.value) {
      await removeFavorite(product.value.id)
      favorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite(product.value.id)
      favorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    favLoading.value = false
  }
}

// ---- 评价 ----
const reviews = ref([])
const reviewStats = ref({ total: 0, averageRating: 0 })
const ratingInput = ref(5)
const contentInput = ref('')
const submittingReview = ref(false)

async function loadReviews() {
  if (!product.value) return
  try {
    const data = await getReviews({ productId: product.value.id, page: 1, pageSize: 20 })
    reviews.value = data.list || []
    reviewStats.value = data.stats || { total: 0, averageRating: 0 }
  } catch {
    reviews.value = []
  }
}

async function submitReview() {
  if (submittingReview.value) return
  submittingReview.value = true
  try {
    await createReview({
      productId: product.value.id,
      rating: ratingInput.value,
      content: contentInput.value.trim(),
    })
    contentInput.value = ''
    ratingInput.value = 5
    ElMessage.success('评价成功')
    await loadReviews()
  } catch (e) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    submittingReview.value = false
  }
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ---- 加载主流程 ----
async function load() {
  loading.value = true
  try {
    product.value = await getProduct(route.params.id)
    if (product.value) {
      await Promise.all([loadFav(), loadReviews()])
    }
  } catch (e) {
    product.value = null
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => route.params.id, load)
</script>

<template>
  <!-- 找不到商品时的兜底，必须有 -->
  <div v-if="!product && !loading" class="container empty">
    <h2>商品不存在</h2>
    <p class="muted">你访问的商品可能已下架，或链接有误。</p>
    <RouterLink to="/products" class="btn btn-ghost">返回商品列表</RouterLink>
  </div>

  <div v-else-if="product" class="container">
    <div class="detail">
      <!-- 左：图 -->
      <div class="card gallery">
        <img :src="product.cover" :alt="product.name" />
      </div>

      <!-- 右：信息 -->
      <div class="info">
        <h1>{{ product.name }}</h1>

        <div class="price-row">
          <span class="price">{{ formatPrice(product.price) }}</span>
          <span class="tag">包邮</span>
        </div>

        <div class="actions">
          <button class="btn" @click="store.add(product)">加入购物车</button>
          <button class="btn btn-fav" :class="{ active: favorited }" :disabled="favLoading" @click="toggleFav">
            {{ favorited ? '♥ 已收藏' : '♡ 收藏' }}
          </button>
          <RouterLink to="/products" class="btn btn-ghost">继续逛逛</RouterLink>
        </div>

        <ul class="meta muted">
          <li>· 7 天无理由退换</li>
          <li>· 48 小时内发货</li>
          <li>· 全国联保</li>
        </ul>
      </div>
    </div>

    <!-- 商品详情（富文本） -->
    <section class="block card rich-block">
      <h2 class="block-title">商品详情</h2>
      <div class="rich" v-html="product.desc || '暂无详情'"></div>
    </section>

    <!-- 商品评价 -->
    <section class="block card review-block">
      <h2 class="block-title">
        商品评价
        <span v-if="reviewStats.total" class="score">
          {{ reviewStats.averageRating }} 分 · {{ reviewStats.total }} 条
        </span>
      </h2>

      <div v-if="reviews.length" class="review-list">
        <div v-for="r in reviews" :key="r.id" class="review">
          <div class="review-head">
            <span class="reviewer">{{ r.reviewerName }}</span>
            <span class="stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
          </div>
          <p class="review-content">{{ r.content || '此用户没有填写评价内容' }}</p>
          <p class="review-time muted">{{ formatTime(r.createdAt) }}</p>
        </div>
      </div>
      <p v-else class="muted">还没有评价，快来抢沙发~</p>

      <!-- 写评价（登录后可见） -->
      <div v-if="isLoggedIn()" class="review-form">
        <h3 class="form-title">写评价</h3>
        <div class="stars-input">
          <span
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ active: n <= ratingInput }"
            @click="ratingInput = n"
          >★</span>
        </div>
        <textarea
          v-model="contentInput"
          class="input"
          placeholder="说说你的使用感受（选填）"
        ></textarea>
        <button class="btn" :disabled="submittingReview" @click="submitReview">
          {{ submittingReview ? '提交中…' : '提交评价' }}
        </button>
      </div>
      <p v-else class="muted">
        请先 <RouterLink to="/login" class="link">登录</RouterLink> 后评价
      </p>
    </section>
  </div>

  <div v-else class="container empty">
    <p class="muted">加载中…</p>
  </div>
</template>

<style scoped>
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

/* 收藏按钮：激活态变红 */
.btn-fav.active {
  background: #e5484d;
  border-color: #e5484d;
  color: #fff;
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

/* ---------- 区块通用 ---------- */
.block {
  padding: 20px;
  margin: 16px 0;
}
.block-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.score {
  font-size: 13px;
  font-weight: 400;
  color: var(--c-danger);
}

/* 富文本详情 */
.rich {
  font-size: 15px;
  line-height: 1.8;
  color: var(--c-text);
  word-break: break-word;
}
.rich :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}
.rich :deep(p) {
  margin: 0 0 12px;
}

/* 评价列表 */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.review {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--c-border);
}
.review:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.reviewer {
  font-size: 14px;
  font-weight: 500;
}
.stars {
  color: #f5a623;
  letter-spacing: 2px;
}
.review-content {
  font-size: 14px;
  line-height: 1.7;
  margin: 0 0 4px;
}
.review-time {
  font-size: 12px;
}

/* 写评价 */
.review-form {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px dashed var(--c-border);
}
.form-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 10px;
}
.stars-input {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}
.star {
  font-size: 26px;
  color: #d0d5dd;
  cursor: pointer;
  transition: color .15s ease;
  user-select: none;
}
.star.active {
  color: #f5a623;
}
.review-form .input {
  width: 100%;
  min-height: 84px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  padding: 10px 12px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  background: #fff;
  color: var(--c-text);
}
.review-form .btn {
  margin-top: 10px;
}
.link {
  color: var(--c-brand);
  font-weight: 500;
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
