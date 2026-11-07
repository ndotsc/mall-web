<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getFavorites, removeFavorite } from '@/api/favorite'
import { formatPrice } from '@/utils/format'
import { isLoggedIn } from '@/utils/auth'

const router = useRouter()
const list = ref([])
const loading = ref(true)

async function load() {
  if (!isLoggedIn()) {
    router.replace({ path: '/login', query: { redirect: '/favorites' } })
    return
  }
  loading.value = true
  try {
    const data = await getFavorites({ page: 1, pageSize: 50 })
    list.value = data.list || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function goDetail(item) {
  if (!item.product) {
    ElMessage.info('商品已下架')
    return
  }
  router.push({ name: 'product', params: { id: item.productId } })
}

async function remove(item) {
  try {
    await removeFavorite(item.productId)
    list.value = list.value.filter((f) => f.id !== item.id)
    ElMessage.success('已取消收藏')
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

onMounted(load)
</script>

<template>
  <div class="container">
    <h1 class="page-title">我的收藏</h1>

    <p v-if="loading" class="muted">加载中…</p>
    <p v-else-if="!list.length" class="muted">还没有收藏任何商品，去首页逛逛吧~</p>

    <div v-else class="grid">
      <div v-for="item in list" :key="item.id" class="card">
        <div class="thumb-wrap" @click="goDetail(item)">
          <img class="thumb" :src="item.product?.cover" :alt="item.product?.name" />
          <div v-if="!item.product" class="off-mask">已下架</div>
        </div>
        <div class="info">
          <div class="name">{{ item.product?.name || '商品已下架' }}</div>
          <div class="price" v-if="item.product">{{ formatPrice(item.product.price) }}</div>
          <div class="price off" v-else>已下架</div>
        </div>
        <button class="remove" @click="remove(item)">取消收藏</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 24px;
  margin: 24px 0 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding-bottom: 24px;
}
.card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  overflow: hidden;
}
.thumb-wrap {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background: var(--c-bg);
  cursor: pointer;
}
.thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.off-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 24, 40, .5);
  color: #fff;
  font-size: 14px;
}
.info {
  padding: 10px 12px 4px;
}
.name {
  font-size: 14px;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.price {
  margin-top: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #e5484d;
}
.price.off {
  color: var(--c-text-faint);
  font-weight: 400;
}
.remove {
  width: 100%;
  padding: 8px 0;
  border: none;
  border-top: 1px solid var(--c-border);
  background: #fff;
  color: var(--c-text-weak);
  font-size: 13px;
  cursor: pointer;
  transition: color .15s ease, background .15s ease;
}
.remove:hover {
  color: var(--c-danger);
  background: var(--c-bg);
}
</style>
