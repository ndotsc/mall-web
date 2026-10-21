<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-col">
        <div class="logo">MY<span>SHOP</span></div>
        <p class="muted">一个用来练手的 Vue3 商城 Demo</p>
      </div>
      <div class="footer-col">
        <h4>关于</h4>
        <a href="#">公司介绍</a>
        <a href="#">加入我们</a>
        <a href="#">联系方式</a>
      </div>
      <div class="footer-col">
        <h4>帮助</h4>
        <a href="#">配送说明</a>
        <a href="#">退换政策</a>
        <a href="#">常见问题</a>
      </div>
    </div>
    <div class="container copyright muted">
      © 2026 MY SHOP · 本项目仅用于学习
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 64px;
  padding: 40px 0 24px;
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
}

/* 三列自适应：空间够就平分，不够自动换行成一列 */
.footer-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: space-between;
}

.footer-col {
  min-width: 160px;
}
.footer-col h4 {
  margin: 0 0 12px;
  font-size: 15px;
}
/* 链接竖排 */
.footer-col a {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--c-text-weak);
  transition: color 0.18s;
}
.footer-col a:hover {
  color: var(--c-brand);
}

.logo {
  font-size: 18px;
  font-weight: 700;
}
.logo span {
  color: var(--c-brand);
}

.copyright {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--c-border);
  text-align: center;
}
</style>
