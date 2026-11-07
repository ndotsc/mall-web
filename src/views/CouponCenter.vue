<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCoupons, claimCoupon } from '@/api/coupon'
import { isLoggedIn } from '@/utils/auth'

const router = useRouter()
const coupons = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const data = await getCoupons()
    coupons.value = data.list || []
  } catch {
    coupons.value = []
  } finally {
    loading.value = false
  }
}

async function claim(c) {
  if (!isLoggedIn()) {
    router.push({ path: '/login', query: { redirect: '/coupons' } })
    return
  }
  try {
    await claimCoupon(c.id)
    c.claimed = true
    if (c.remaining > 0) c.remaining -= 1
    ElMessage.success('领取成功')
  } catch (e) {
    ElMessage.error(e.message || '领取失败')
  }
}

function fmtDate(t) {
  if (!t) return ''
  return new Date(t).toLocaleDateString('zh-CN')
}

onMounted(load)
</script>

<template>
  <div class="container">
    <h1 class="page-title">领券中心</h1>

    <p v-if="loading" class="muted">加载中…</p>
    <p v-else-if="!coupons.length" class="muted">暂无可领取的优惠券</p>

    <div v-else class="coupon-grid">
      <div v-for="c in coupons" :key="c.id" class="coupon-card" :class="{ claimed: c.claimed }">
        <div class="coupon-left">
          <div class="label">{{ c.label }}</div>
          <div class="name">{{ c.name }}</div>
        </div>
        <div class="coupon-right">
          <button
            class="claim-btn"
            :disabled="c.claimed"
            @click="claim(c)"
          >
            {{ c.claimed ? '已领取' : '立即领取' }}
          </button>
          <div class="valid">
            {{ fmtDate(c.validFrom) }} ~ {{ fmtDate(c.validTo) }}
          </div>
          <div class="remain">
            {{ c.remaining === -1 ? '不限量' : '剩余 ' + c.remaining + ' 张' }}
          </div>
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
.coupon-card.claimed {
  opacity: 0.65;
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
.claim-btn {
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  background: var(--c-brand);
  color: #fff;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: opacity .15s ease;
}
.claim-btn:disabled {
  background: var(--c-text-faint);
  cursor: default;
}
.valid {
  font-size: 12px;
  color: var(--c-text-weak);
}
.remain {
  font-size: 12px;
  color: var(--c-text-weak);
}
</style>
