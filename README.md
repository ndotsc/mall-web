# mall-web

![CI](https://github.com/ndotsc/mall-web/actions/workflows/ci.yml/badge.svg)

商城前端：Vue 3 + Vite + Element Plus + Pinia + vue-router。配合后端 [mall-api](https://github.com/ndotsc/mall-api) 运行。

## 环境要求

- Node 20+，pnpm 12
- 后端 mall-api 已启动（默认 `http://localhost:3000`）

## 安装与运行

```bash
pnpm install     # 安装依赖
pnpm dev         # vite 开发服务器，默认 http://localhost:5173
pnpm build       # 产出 dist/（生产构建）
pnpm preview     # 本地预览构建产物
```

## 跨域代理

`vite.config.js` 已配置开发代理，前端直接请求 `/api/xxx` 即可，由 Vite 转发到后端：

```js
'/api'     → http://localhost:3000
'/uploads' → http://localhost:3000
```

生产部署时由 Nginx / 网关做同样的转发，前端代码无需改。

> **图片例外**：接口现在返回的是**完整 URL**（如 `http://localhost:3002/uploads/xxx.png`），
> `<img :src>` 会直接请求后端域名，跨域部署（前端 `www.example.com`、后端 `api.example.com`）
> 也不依赖 `/uploads` 代理。上面这条 `/uploads` 只作为「库里残留相对路径」的兜底。
> 后端用 `PUBLIC_ORIGIN` 指定图片对外域名；生产建议指向 CDN，且前后端都用 https
> （前端 https + 后端 http 会被浏览器按混合内容拦掉）。详见 `backend/README.md`。

## 关键约定

- **登录态**：token 存 `localStorage`，axios 请求拦截器自动带 `Authorization: Bearer <token>`。
- **401 处理**：响应拦截器捕获 401 后清空 token 并跳 `/login`（带 `redirect` 回跳原页）。
- **路由守卫**：`/admin` 路由需 `role === 2`（管理员），普通用户或无登录会被踢回首页 / 登录页。
- **后台页**：用后端 seed 的 `admin / admin123` 登录后访问 `/admin`，可管理商品与文章（含图片上传）。
- **金额**：展示用「元」，提交 / 存储用「分」，与后端保持一致。

## D26 体验优化

对应学习计划第 4 周 D26「图片压缩/懒加载、骨架屏、接口缓存、错误兜底、H5 的 SEO 与 meta」，全部零新增依赖。

| 项 | 实现位置 | 做法 |
| --- | --- | --- |
| 图片懒加载 / 失败兜底 | `src/directives/image.js` 的 `v-img`，全站 13 处 `<img>` | 用指令而不是包一层组件，避免破坏 `.thumb img` 这类后代选择器和 `height:100%`。默认 `loading="lazy"` + `decoding="async"`；详情主图用 `v-img.eager` 标 `fetchpriority=high`（LCP）；失败换成内联 SVG 占位图 |
| 图片 URL 统一出口 | `src/utils/image.js` 的 `imageUrl()` | 后端现在返回完整 URL，函数原样透传；将来接 CDN / OSS 只改这一处，全站 `v-img` 图片自动带尺寸 / 格式参数（接 CDN 时记得让加工参数幂等） |
| 上传前压缩 | `src/utils/image.js` 的 `compressImage()`，接在 `AdminProduct.vue` / `AdminArticle.vue` 的上传里 | canvas 等比缩到 1600px + JPEG 重编码，压不动或反而变大就回退原文件；后端 2MB 限制不变 |
| 骨架屏 | `src/components/PageSkeleton.vue` | `grid` / `list` / `detail` 三种形状，替换了商品列表、详情、订单、收藏、领券中心、我的券、地址页的「加载中…」；尊重 `prefers-reduced-motion` |
| 接口缓存 | `src/api/request.js` | 只缓存 `/categories`、`/products`、`/products/:id`、`/articles` 这类公开 GET，TTL 60s；同 key 并发请求复用一个 Promise；**登录态一律不缓存**、任何写操作发出时清空缓存。单次跳过 `request.get(url, { cache: false })`，手动清空 `clearApiCache()` |
| 错误兜底 | `src/main.js`、`src/components/ErrorState.vue`、`src/views/NotFound.vue` | 全局 `errorHandler` / `router.onError` / `unhandledrejection` / 资源加载失败监听；列表与详情页区分「请求失败」和「真的没数据」并给重试按钮；history 模式补了 404 页 |
| SEO / meta | `index.html`、`src/utils/seo.js`、`src/router/index.js`、`public/robots.txt`、`public/sitemap.xml` | 静态 title / description / OG / canonical + 路由级动态 title（详情页用商品名覆盖）；登录、后台、个人中心等私有页 `noindex`；`vite.config.js` 把 Vue 与 Element Plus 拆成可长期缓存的 vendor chunk |

**两个待办（属于进阶路线，不在 D26 范围内）**：

1. `index.html` / `robots.txt` / `sitemap.xml` 里的 `https://example.com` 是占位，部署拿到真实域名后替换（D27 补部署地址时一起做）；动态商品详情页 `/product/:id` 需要构建期预渲染才能进 sitemap。
2. 本站是纯 SPA，爬虫只能看到静态 meta 和空的 `#app`，真正的 SEO 需要 Nuxt 3 / SSR。服务端图片重编码（sharp / GD）与 `Cache-Control` / ETag 属于进阶路线的 CDN 与 Redis 章节，三套后端目前都还没做。
