<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import { me } from '@/api/auth'
import { isLoggedIn } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

onMounted(() => {
  // D26：只在「已登录 且 store 里还没有用户信息」时拉一次 /auth/me。
  // 未登录时调 /auth/me 必然 401（还会触发拦截器跳登录页），没必要发这个请求；
  // 已有用户信息则不必重复拉。写成正向命名变量，避免 !A || B 这种双重取反难读。
  const shouldFetchMe = isLoggedIn() && !userStore.user
  if (shouldFetchMe) {
    me()
      .then((u) => userStore.set(u))
      // 401 已由 request.js 的响应拦截器统一清 token + 跳登录页；
      // 其它失败（网络抖动、后端 500）不该把用户莫名其妙踢下线，静默忽略即可。
      .catch(() => {})
  }
})
</script>

<template>
  <SiteHeader v-if="!isAdminRoute" />
  <main class="site-main" :class="{ 'is-admin': isAdminRoute }">
    <router-view />
  </main>
  <SiteFooter v-if="!isAdminRoute" />
</template>

<style scoped>
.site-main.is-admin {
  padding: 0;
  max-width: none;
}
</style>
