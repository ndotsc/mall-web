<script setup>
/**
 * D26 错误兜底：把「接口失败」和「真的没有数据」区分开。
 * 之前列表页 catch 里把数组置空，失败会被渲染成「暂无商品」，
 * 用户完全不知道该刷新还是该换关键词；这里给明确的失败态 + 重试入口。
 */
defineProps({
  title: { type: String, default: '加载失败' },
  description: { type: String, default: '网络好像开小差了，稍后再试一次吧。' },
  retryText: { type: String, default: '重新加载' },
  showRetry: { type: Boolean, default: true },
})
defineEmits(['retry'])
</script>

<template>
  <div class="error-state" role="alert">
    <div class="err-icon" aria-hidden="true">!</div>
    <h3 class="err-title">{{ title }}</h3>
    <p class="muted err-desc">{{ description }}</p>
    <button v-if="showRetry" class="btn" type="button" @click="$emit('retry')">
      {{ retryText }}
    </button>
    <!-- 额外操作（例如「返回商品列表」）由调用方通过 slot 传进来 -->
    <slot />
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 20px;
  margin: 16px 0 40px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
}
.err-icon {
  width: 48px;
  height: 48px;
  line-height: 48px;
  margin-bottom: 16px;
  border-radius: 50%;
  background: #fdecec;
  color: var(--c-danger);
  font-size: 26px;
  font-weight: 700;
}
.err-title {
  margin: 0 0 6px;
  font-size: 18px;
}
.err-desc {
  margin: 0 0 20px;
  font-size: 14px;
}
.error-state :slotted(.btn) {
  margin: 4px 8px 0;
}
</style>
