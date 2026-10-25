# my-site

商城前端：Vue 3 + Vite + Element Plus + Pinia + vue-router。配合后端 [mall-api](../backend/mall-api) 运行。

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

## 关键约定

- **登录态**：token 存 `localStorage`，axios 请求拦截器自动带 `Authorization: Bearer <token>`。
- **401 处理**：响应拦截器捕获 401 后清空 token 并跳 `/login`（带 `redirect` 回跳原页）。
- **路由守卫**：`/admin` 路由需 `role === 2`（管理员），普通用户或无登录会被踢回首页 / 登录页。
- **后台页**：用后端 seed 的 `admin / admin123` 登录后访问 `/admin`，可管理商品与文章（含图片上传）。
- **金额**：展示用「元」，提交 / 存储用「分」，与后端保持一致。
