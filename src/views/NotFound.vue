<template>
  <!-- D26：history 路由模式下未匹配的 URL 之前只会渲染一个空白 router-view -->
  <div class="container not-found">
    <p class="nf-code">404</p>
    <h1>页面走丢了</h1>
    <p class="muted">你访问的地址不存在，或者内容已经被移走。</p>
    <div class="nf-actions">
      <RouterLink to="/" class="btn">回到首页</RouterLink>
      <RouterLink to="/products" class="btn btn-ghost">去逛逛商品</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  padding-top: 80px;
  padding-bottom: 100px;
  text-align: center;
}
.nf-code {
  margin: 0;
  font-size: 88px;
  font-weight: 700;
  line-height: 1;
  color: var(--c-brand-weak);
  letter-spacing: 4px;
}
.not-found h1 {
  margin-top: 12px;
}
.nf-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
</style>
