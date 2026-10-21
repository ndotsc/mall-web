<script setup>
import SiteFooter from './components/SiteFooter.vue';
import SiteHeader from './components/SiteHeader.vue';
</script>

<template>
  <SiteHeader />
  <main class="site-main">
    <router-view />
  </main>
  <SiteFooter />
</template>
