<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { isLoggedIn } from '@/utils/auth'

const router = useRouter()
const userStore = useUserStore()
const displayName = computed(() => userStore.displayName || '游客')

const entries = [
  { to: '/favorites', label: '我的收藏', icon: '♥' },
  { to: '/my-coupons', label: '我的优惠券', icon: '🎟' },
  { to: '/my-orders', label: '我的订单', icon: '📦' },
  { to: '/address', label: '收货地址', icon: '📍' },
  { to: '/coupons', label: '领券中心', icon: '🎁' },
]

onMounted(() => {
  if (!isLoggedIn()) {
    router.replace({ path: '/login', query: { redirect: '/profile' } })
  }
})

function logout() {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="container">
    <div class="profile-card">
      <div class="avatar">{{ displayName.charAt(0) }}</div>
      <div class="uname">{{ displayName }}</div>
      <button class="logout" @click="logout">退出登录</button>
    </div>

    <div class="grid">
      <RouterLink v-for="e in entries" :key="e.to" :to="e.to" class="entry">
        <span class="entry-icon">{{ e.icon }}</span>
        <span class="entry-label">{{ e.label }}</span>
        <span class="entry-arrow">›</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding-top: 24px;
  padding-bottom: 24px;
}
.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 14px;
  margin-bottom: 16px;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--c-brand);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.uname {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
}
.logout {
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--c-border);
  background: #fff;
  color: var(--c-text-weak);
  font-size: 14px;
  cursor: pointer;
  transition: color .15s ease, border-color .15s ease;
}
.logout:hover {
  color: var(--c-danger);
  border-color: var(--c-danger);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  text-decoration: none;
  color: var(--c-text);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.entry:hover {
  border-color: var(--c-brand);
  box-shadow: 0 6px 20px rgba(37, 99, 235, .12);
}
.entry-icon {
  font-size: 22px;
}
.entry-label {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
}
.entry-arrow {
  color: var(--c-text-faint);
  font-size: 20px;
}
</style>
