/**
 * D26 SEO：SPA 没有 SSR，但至少让每个路由都有正确的 title / description / OG / canonical。
 * 纯 DOM 操作，零依赖（不用 unhead，是为了少一个概念、方便看懂原理）。
 * 注意：爬虫不执行 JS，这些动态修改主要服务于「用户分享链接 / 浏览器标签 / 内页体验」；
 * 想让爬虫看到正文，得进阶到 Nuxt 3 / 预渲染。
 */

const SITE_NAME = 'Mall 商城'
const DEFAULT_DESCRIPTION =
  '用 Vue 3 + Vite + Node 从零搭建的全栈商城：商品浏览、搜索筛选、购物车、下单、收藏与优惠券。'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// 去掉 query 与 hash，避免把 ?keyword=xxx 这种筛选参数当成独立页面
function currentUrl() {
  return window.location.origin + window.location.pathname
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * router.afterEach 里调用；也可在详情页数据回来后单独调一次，用商品名覆盖标题。
 * @param {{title?: string, description?: string, image?: string, noindex?: boolean}} options
 */
export function setSeo({ title = '', description = '', image = '', noindex = false } = {}) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - Vue3 全栈商城实战`
  const desc = description || DEFAULT_DESCRIPTION
  const url = currentUrl()

  document.title = fullTitle
  setMeta('name', 'description', desc)
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  setMeta('property', 'og:type', 'website')
  setMeta('property', 'og:site_name', SITE_NAME)
  setMeta('property', 'og:title', fullTitle)
  setMeta('property', 'og:description', desc)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:image', image || `${window.location.origin}/favicon.svg`)
  setMeta('name', 'twitter:card', 'summary')
  setCanonical(url)
}
