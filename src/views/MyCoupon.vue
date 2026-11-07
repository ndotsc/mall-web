<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getMyCoupons } from '@/api/coupon'
import { isLoggedIn } from '@/utils/auth'

const router = useRouter()
const tabs = [
  { key: 'unused', label: '未使用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' },
  { key: 'all', label: '全部' },
]
const active = ref('unused')
const list = ref([])
const loading = ref(false)

async function load() {
  if (!isLoggedIn()) {
    router.replace({ path: '/login', query: { redirect: '/my-coupons' } })
    return
  }
  loading.value = true
  try {
    const data = await getMyCoupons({ status: active.value })
    list.value = data.list || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function fmtDate(t) {
  if (!t) return ''
  return new Date(t).toLocaleDateString('zh-CN')
}

onMounted(load)
watch(active, load)
</script>

<template>
  <div class="container">
    <h1 class="page-title">我的优惠券</h1>

    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ active: active === t.key }"
        @click="active = t.key"
      >{{ t.label }}</button>
    </div>

    <p v-if="loading" class="muted">加载中…</p>
    <p v-else-if="!list.length" class="muted">这里还没有优惠券</p>

    <div v-else class="coupon-grid">
      <div v-for="uc in list" :key="uc.id" class="coupon-card" :class="uc.status">
        <div class="coupon-left">
          <div class="label">{{ uc.coupon.label }}</div>
          <div class="name">{{ uc.coupon.name }}</div>
        </div>
        <div class="coupon-right">
          <div class="status-tag">
            {{ uc.status === 'used' ? '已使用' : uc.status === 'expired' ? '已过期' : '未使用' }}
          </div>
          <div class="valid">{{ fmtDate(uc.coupon.validFrom) }} ~ {{ fmtDate(uc.coupon.validTo) }}</div>
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
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.tab {
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--c-border);
  background: #fff;
  color: var(--c-text-weak);
  font-size: 14px;
  cursor: pointer;
  transition: all .15s ease;
}
.tab.active {
  border-color: var(--c-brand);
  background: var(--c-brand-weak);
  color: var(--c-brand);
  font-weight: 500;
}
.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding-bottom: 24px;
}
.coupon-card {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
.coupon-card.used,
.coupon-card.expired {
  opacity: 0.6;
}
.coupon-left {
  flex: 1;
  padding: 18px 20px;
  background: var(--c-brand-weak);
  color: var(--c-brand);
}
.coupon-left .label {
  font-size: 22px;
  font-weight: 700;
}
.coupon-left .name {
  font-size: 13px;
  margin-top: 6px;
  opacity: 0.85;
}
.coupon-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
}
.status-tag {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text);
}
.valid {
  font-size: 12px;
  color: var(--c-text-weak);
}
</style>
