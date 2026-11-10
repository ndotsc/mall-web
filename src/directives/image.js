import { imageUrl, PLACEHOLDER } from '@/utils/image'

/**
 * v-img —— 给 <img> 补懒加载 + 加载失败兜底。
 *
 * 为什么用「指令」而不是包一层 <SmartImage> 组件？
 * 现有页面的 CSS 大量依赖 `.thumb img`、`.gallery img` 这类后代选择器，
 * 以及 `class="thumb"` 直接作用在 img 上；包一层父节点会改变盒模型、
 * 让 `height:100%` 失效，等于要重排十几个页面的样式。
 * 指令不改变 DOM 结构，只在 mounted 时补属性 / 事件，零布局风险。
 *
 * 用法：
 *   <img v-img ... />        首屏之外的图：loading="lazy" + decoding="async"
 *   <img v-img.eager ... />  首屏主图（LCP）：立即加载 + fetchpriority=high
 */
function markFailed(el) {
  if (el.dataset.imgFailed === '1') return
  el.dataset.imgFailed = '1'
  el.src = PLACEHOLDER
  el.classList.add('img-fallback')
}

/**
 * 所有 v-img 图片的 URL 都过一遍 imageUrl()，这就是「统一出口」：
 * 现在后端返回完整 URL，函数原样透传；将来接 CDN / OSS，只改 utils/image.js 一处，
 * 全站图片自动带上尺寸与格式参数，十几个页面一行都不用动。
 * （接 CDN 时记得让 imageUrl 幂等：已带加工参数的 URL 不再追加。）
 */
function applySrc(el) {
  const raw = el.getAttribute('src') || ''
  const next = imageUrl(raw)
  if (next && raw !== next) el.setAttribute('src', next)
}

export const imageDirective = {
  mounted(el, binding) {
    if (el.tagName !== 'IMG') return
    applySrc(el)
    if (binding.modifiers.eager) {
      el.setAttribute('loading', 'eager')
      el.setAttribute('fetchpriority', 'high')
    } else {
      el.setAttribute('loading', 'lazy')
    }
    el.setAttribute('decoding', 'async')

    el.__imgErrorHandler = () => markFailed(el)
    el.addEventListener('error', el.__imgErrorHandler)
    // 图片可能在指令挂载前就已经失败（例如缓存过的 404）
    if (el.complete && el.naturalWidth === 0) markFailed(el)
  },
  updated(el) {
    applySrc(el)
    // :src 变了（详情页切商品）时清掉失败标记，让新图有机会重新加载
    if (el.dataset.imgFailed === '1' && el.src !== PLACEHOLDER) {
      delete el.dataset.imgFailed
      el.classList.remove('img-fallback')
    }
  },
  unmounted(el) {
    if (el.__imgErrorHandler) el.removeEventListener('error', el.__imgErrorHandler)
  },
}
