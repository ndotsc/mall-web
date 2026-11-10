<script setup>
// import { products } from '@/mock/products'
import { formatPrice } from '@/utils/format'
import { ref, computed, onMounted } from 'vue'
import { getProducts } from '@/api/products'
import { getCategories } from '@/api/category'
import PageSkeleton from '@/components/PageSkeleton.vue'
import ErrorState from '@/components/ErrorState.vue'

// 每页 8 件：桌面端 4 列 × 2 行正好铺满，不留半行；
// 当前库里 10 件商品，能正好演示出 2 页（想改 12 改这一个数即可）
const PAGE_SIZE = 8

const products = ref([])
const loading = ref(true)
// D26：请求失败 ≠ 没有搜索结果，分开渲染才能给用户一个「重试」入口
const loadError = ref(false)
const keyword = ref('')
const total = ref(0)
const page = ref(1)

// ---- 筛选 / 排序（小程序端已有，web 端补齐）----
const categories = ref([])
const categoryId = ref('')      // '' = 全部
const minPrice = ref('')        // 元（原始输入）
const maxPrice = ref('')
const sort = ref('created_desc') // 综合（默认）/ 价格升 / 价格降 / 最新

// 总页数由后端 total 算；total=0 时也至少 1 页，避免显示「第 1 / 0 页」
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

async function fetchProducts() {
  loading.value = true
  try {
    // 三个基础参数 + 筛选/排序参数（extra 里空值会被 api 层忽略）
    const res = await getProducts(page.value, PAGE_SIZE, keyword.value.trim(), {
      categoryId: categoryId.value,
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
      sort: sort.value,
    })
    products.value = res.list
    total.value = res.total
    loadError.value = false
  } catch (e) {
    console.error(e)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 拉分类用于筛选宫格；失败不影响列表
  getCategories()
    .then((res) => { categories.value = res || [] })
    .catch(() => { categories.value = [] })
  fetchProducts()
})

// 任何筛选/搜索变更都回到第 1 页，避免停留在旧页拿到空列表
function resetAndFetch() {
  page.value = 1
  fetchProducts()
}

function onSearch() {
  resetAndFetch()
}

function onCategory(id) {
  if (categoryId.value === id) return
  categoryId.value = id
  resetAndFetch()
}

function onPriceConfirm() {
  resetAndFetch()
}

function onSortChange() {
  resetAndFetch()
}

function goPage(target) {
  if (target < 1 || target > pageCount.value || target === page.value) return
  page.value = target
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })   // 翻页后回到顶部，不然停在新页面底部
}
</script>

<template>
  <div class="container">
    <h1 class="page-title">全部商品</h1>
    <p class="muted page-sub">共 {{ total }} 件</p>

    <!-- 搜索栏：后端 /products 的 keyword 参数是现成的，这里补上前端接线 -->
    <form class="search-bar" @submit.prevent="onSearch">
      <input
        v-model="keyword"
        class="search-input"
        type="search"
        placeholder="搜索商品名称..."
        @search="onSearch"
      />
      <button class="search-btn" type="submit">搜索</button>
    </form>

    <!-- 筛选 / 排序工具条（小程序端已有，web 端补齐）：分类 + 价格区间 + 排序 -->
    <div class="filters">
      <div class="cat-pills">
        <button class="pill" :class="{ active: categoryId === '' }" @click="onCategory('')">全部</button>
        <button
          v-for="c in categories"
          :key="c.id"
          class="pill"
          :class="{ active: categoryId === c.id }"
          @click="onCategory(c.id)"
        >{{ c.name }}</button>
      </div>

      <div class="price-filter">
        <input v-model="minPrice" class="price-input" type="number" min="0" placeholder="最低价" @change="onPriceConfirm" />
        <span class="price-sep">—</span>
        <input v-model="maxPrice" class="price-input" type="number" min="0" placeholder="最高价" @change="onPriceConfirm" />
      </div>

      <select v-model="sort" class="sort-select" @change="onSortChange">
        <option value="created_desc">综合</option>
        <option value="price_asc">价格从低到高</option>
        <option value="price_desc">价格从高到低</option>
        <option value="created_asc">最新上架</option>
      </select>
    </div>

    <!-- D26：加载中 / 加载失败 / 真的搜不到，三种状态分开，失败时给重试入口 -->
    <PageSkeleton v-if="loading" type="grid" :rows="PAGE_SIZE" />
    <ErrorState
      v-else-if="loadError"
      title="商品加载失败"
      description="没能从服务器取到商品列表，检查一下网络再试一次。"
      @retry="fetchProducts"
    />
    <!-- 空状态：搜不到时给明确反馈，而不是一片空白 -->
    <p v-else-if="!products.length" class="muted empty">
      没有找到{{ keyword ? `与「${keyword}」相关的` : '' }}商品
    </p>

    <!-- 响应式网格：一行最多放多少列，由浏览器自己算，不用写媒体查询 -->
    <div v-else class="grid">
      <RouterLink
        v-for="product in products"
        :key="product.id"
        :to="{ name: 'product', params: { id: product.id } }"
        class="card product-card"
      >
        <!-- aspect-ratio: 保证所有图片占位一致，不会因加载快慢抖动 -->
        <div class="thumb">
          <img v-img :src="product.cover" :alt="product.name" />
        </div>
        <div class="info">
          <h3 class="name">{{ product.name }}</h3>
          <p class="desc muted">{{ product.desc }}</p>
          <div class="price price-sm">{{ formatPrice(product.price) }}</div>
        </div>
      </RouterLink>
    </div>

    <!-- 翻页：只在超过一页且状态正常时出现，边界页禁用对应按钮 -->
    <nav v-if="!loading && !loadError && pageCount > 1" class="pager">
      <button class="page-btn" :disabled="page === 1" @click="goPage(page - 1)">上一页</button>
      <span class="page-info">第 {{ page }} / {{ pageCount }} 页</span>
      <button class="page-btn" :disabled="page === pageCount" @click="goPage(page + 1)">下一页</button>
    </nav>
  </div>
</template>

<style scoped>
.page-title {
  margin: 32px 0 4px;
}
.page-sub {
  margin-bottom: 24px;
}

/* 搜索栏：输入框 + 按钮，配色取自全局设计令牌 */
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.search-input {
  flex: 1;
  max-width: 360px;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
.search-btn {
  padding: 10px 22px;
  font-size: 14px;
  border: none;
  border-radius: 10px;
  background: var(--c-brand);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s;
}
.search-btn:hover {
  opacity: 0.9;
}

/* ---------- 筛选 / 排序工具条 ---------- */
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.cat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pill {
  padding: 7px 16px;
  font-size: 13px;
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: #fff;
  color: var(--c-text-weak);
  cursor: pointer;
  transition: all 0.2s;
}
.pill:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.pill.active {
  background: var(--c-brand);
  border-color: var(--c-brand);
  color: #fff;
}
.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.price-input {
  width: 92px;
  padding: 8px 10px;
  font-size: 13px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  outline: none;
  background: #fff;
}
.price-input:focus {
  border-color: var(--c-brand);
}
.price-sep {
  color: var(--c-text-faint);
}
.sort-select {
  margin-left: auto;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: #fff;
  color: var(--c-text);
  cursor: pointer;
  outline: none;
}
.sort-select:focus {
  border-color: var(--c-brand);
}

.empty {
  padding: 40px 0;
}

/* ---------- 翻页 ---------- */
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 0 48px;
}
.page-btn {
  padding: 9px 20px;
  font-size: 14px;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  background: #fff;
  color: var(--c-text);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.page-btn:disabled {
  color: var(--c-text-faint);
  cursor: not-allowed;
  background: var(--c-bg);
}
.page-info {
  font-size: 14px;
  color: var(--c-text-weak);
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
