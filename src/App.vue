<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import { me } from '@/api/auth'
import { isLoggedIn, clearToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

onMounted(() => {
  if (isLoggedIn()) {
    me()
      .then((u) => userStore.set(u))
      .catch(clearToken)
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
