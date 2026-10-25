<script setup>
import { onMounted } from 'vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import { me } from '@/api/auth'
import { isLoggedIn, clearToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  if (isLoggedIn()) {
    me()
      .then((u) => userStore.set(u))
      .catch(clearToken)
  }
})
</script>

<template>
  <SiteHeader />
  <main class="site-main">
    <router-view />
  </main>
  <SiteFooter />
</template>
