<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice } from '@/utils/format'
import { getOrderList } from '@/api/orders'
import { isLoggedIn } from '@/utils/auth'

const router = useRouter()
const orders = ref([])
const loading = ref(true)

const STATUS = { 1: '待发货', 2: '已发货', 3: '已完成' }

async function load() {
  if (!isLoggedIn()) {
    router.replace({ path: '/login', query: { redirect: '/my-orders' } })
    return
  }
  loading.value = true
  try {
    const data = await getOrderList()
    orders.value = data.list || []
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

function fmtTime(t) {
  if (!t) return ''
  const d = new Date(t)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(load)
</script>

<template>
  <div class="container">
    <h1 class="page-title">我的订单</h1>

    <p v-if="loading" class="muted">加载中…</p>
    <p v-else-if="!orders.length" class="muted">还没有订单，去逛逛吧~</p>

    <div v-else class="order-list">
      <div v-for="o in orders" :key="o.id" class="order-card">
        <div class="order-head">
          <span class="no">订单号：{{ o.orderNo }}</span>
          <span class="status" :class="'s' + o.status">{{ STATUS[o.status] || '未知' }}</span>
        </div>

        <div class="items">
          <div v-for="it in o.items" :key="it.id" class="item">
            <img class="thumb" :src="it.cover" :alt="it.name" />
            <div class="item-info">
              <div class="name">{{ it.name }}</div>
              <div class="muted">{{ formatPrice(it.price) }} × {{ it.number }}</div>
            </div>
          </div>
        </div>

        <div class="order-foot">
          <span class="time muted">{{ fmtTime(o.createdAt) }}</span>
          <span class="amount">
            <span v-if="o.discountAmount" class="discount">已优惠 {{ formatPrice(o.discountAmount) }}</span>
            <span class="total">实付 {{ formatPrice(o.totalAmount) }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 24px;
  margin: 24px 0 16px;
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}
.order-card {
  border: 1px solid var(--c-border);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--c-bg);
  border-bottom: 1px solid var(--c-border);
}
.no {
  font-size: 13px;
  color: var(--c-text-weak);
}
.status {
  font-size: 13px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
}
.status.s1 { color: #d97706; background: #fef3c7; }
.status.s2 { color: #2563eb; background: #dbeafe; }
.status.s3 { color: #16a34a; background: #dcfce7; }

.items {
  padding: 8px 16px;
}
.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.thumb {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--c-bg);
}
.item-info {
  font-size: 14px;
}
.order-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--c-border);
}
.amount {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.discount {
  font-size: 13px;
  color: #e5484d;
}
.total {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-danger);
}
</style>
