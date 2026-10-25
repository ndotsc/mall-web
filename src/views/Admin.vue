<template>
  <div class="admin-page">
    <header class="admin-bar">
      <div class="brand">MYSHOP 后台</div>
      <RouterLink to="/" class="back">← 返回商城</RouterLink>
    </header>

    <div class="admin-body">
      <el-tabs v-model="tab">
        <el-tab-pane label="商品" name="products">
          <AdminProduct />
        </el-tab-pane>
        <el-tab-pane label="文章" name="articles" lazy>
          <AdminArticle />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminProduct from '@/views/AdminProduct.vue'
import AdminArticle from '@/views/AdminArticle.vue'

const tab = ref('products')
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f0f2f5;
}

.admin-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  background: #1f2328;
  color: #fff;
}

.brand {
  font-size: 16px;
  font-weight: 700;
}

.back {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}
.back:hover {
  color: #fff;
}

.admin-body {
  max-width: 1120px;
  margin: 0 auto;
  padding: 20px 24px 40px;
  background: transparent;
}

.admin-body :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.admin-body :deep(.el-tabs__item) {
  font-size: 15px;
}
</style>
