<template>
  <div class="container">
    <h1 class="page-title">关于我们</h1>
    <div class="card content">
      <h2>我们做什么</h2>
      <p>
        这是一个用于学习 Vue3 全栈开发的示例项目，包含商品展示、路由跳转、
        购物车状态管理等完整流程。
      </p>
      <h2>技术栈</h2>
      <ul>
        <li>Vue 3 + Vite</li>
        <li>Vue Router</li>
        <li>Pinia</li>
        <li>后续：Node + Express + Prisma</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 32px 0 20px;
}
/* 限制正文宽度，阅读体验更好（一行太长眼睛累） */
.content {
  max-width: 720px;
  padding: 32px;
  margin-bottom: 40px;
}
.content h2 {
  margin-top: 24px;
}
.content ul {
  padding-left: 20px;
  color: var(--c-text-weak);
}
.content li {
  margin-bottom: 6px;
}
</style>
