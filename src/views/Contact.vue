<template>
  <div class="container">
    <h1 class="page-title">联系我们</h1>
    <div class="card content">
      <div class="row">
        <span class="label">邮箱</span>
        <span>hello@myshop.demo</span>
      </div>
      <div class="row">
        <span class="label">电话</span>
        <span>400-000-0000</span>
      </div>
      <div class="row">
        <span class="label">地址</span>
        <span>示例市示例区示例路 1 号</span>
      </div>
      <p class="muted tip">以上信息均为示例数据，可自行替换。</p>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 32px 0 20px;
}
.content {
  max-width: 720px;
  padding: 24px 32px;
  margin-bottom: 40px;
}
/* 左标签右内容的两栏行 */
.row {
  display: flex;
  gap: 20px;
  padding: 14px 0;
  border-bottom: 1px solid var(--c-border);
}
.row:last-of-type {
  border-bottom: none;
}
.label {
  width: 60px;
  flex-shrink: 0;      /* 不允许被压缩，保证对齐 */
  color: var(--c-text-weak);
}
.tip {
  margin-top: 16px;
}
</style>
