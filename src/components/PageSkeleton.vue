<script setup>
/**
 * D26 骨架屏：加载期间先撑出与真实内容相近的占位。
 * 相比一行「加载中…」，好处是内容回来时不会整块跳一下（CLS 更小），
 * 用户也能预判接下来会出现什么形状的内容。
 *
 * type: grid（商品网格，跟 Products.vue 的 auto-fill 网格对齐）
 *       list（订单 / 地址 / 优惠券这类纵向列表）
 *       detail（左大图右信息的详情页）
 * rows: grid / list 的占位条数
 */
defineProps({
  type: { type: String, default: 'grid' },
  rows: { type: Number, default: 6 },
})
</script>

<template>
  <div class="skeleton" :class="`skeleton--${type}`" role="status" aria-busy="true" aria-label="内容加载中">
    <template v-if="type === 'detail'">
      <div class="sk-detail-image shimmer" aria-hidden="true" />
      <div class="sk-detail-side" aria-hidden="true">
        <div class="sk-line sk-line--title shimmer w-80" />
        <div class="sk-line shimmer w-40" />
        <div class="sk-line shimmer w-70" />
        <div class="sk-line shimmer w-50" />
        <div class="sk-button shimmer" />
      </div>
    </template>
    <template v-else>
      <div v-for="n in rows" :key="n" class="sk-card" aria-hidden="true">
        <div class="sk-media shimmer" />
        <div class="sk-lines">
          <div class="sk-line shimmer w-80" />
          <div class="sk-line shimmer w-50" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.skeleton {
  width: 100%;
}

/* 微光扫过效果：背景位置来回移动，比闪烁更柔和 */
.shimmer {
  background-image: linear-gradient(90deg, #eef0f3 25%, #f8f9fb 50%, #eef0f3 75%);
  background-size: 200% 100%;
  animation: sk-shimmer 1.3s ease-in-out infinite;
}
@keyframes sk-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

.sk-line {
  height: 12px;
  border-radius: 6px;
}
.w-80 { width: 80%; }
.w-70 { width: 70%; }
.w-50 { width: 50%; }
.w-40 { width: 40%; }

/* ---- 商品网格：列宽与真实 .grid 保持一致，切换时不会横向跳动 ---- */
.skeleton--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding-bottom: 40px;
}
.skeleton--grid .sk-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 14px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  overflow: hidden;
}
.skeleton--grid .sk-media {
  aspect-ratio: 1 / 1;
  width: 100%;
}
.skeleton--grid .sk-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 14px;
}

/* ---- 纵向列表 ---- */
.skeleton--list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0 40px;
}
.skeleton--list .sk-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
}
.skeleton--list .sk-media {
  width: 72px;
  height: 72px;
  flex: none;
  border-radius: 8px;
}
.skeleton--list .sk-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ---- 详情页 ---- */
.skeleton--detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 32px 0;
  align-items: start;
}
.sk-detail-image {
  aspect-ratio: 1 / 1;
  border-radius: var(--radius);
}
.sk-detail-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}
.sk-line--title { height: 28px; border-radius: 8px; }
.sk-button {
  height: 44px;
  width: 60%;
  border-radius: 10px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .skeleton--detail { grid-template-columns: 1fr; }
}

/* 尊重系统「减少动效」设置 */
@media (prefers-reduced-motion: reduce) {
  .shimmer { animation: none; }
}
</style>
