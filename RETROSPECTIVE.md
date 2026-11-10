# 4 周冲刺复盘与下一步路线

> 关联总览：[PORTFOLIO.md](./PORTFOLIO.md)。  
> 状态：复盘成文，下一步路线**只规划不实现**；当前项目未部署、未付费、未 push D27 文档。

## 1. 四周实际完成了什么

### 第 1 周：Vue 3 网站打底

- 用 Vite 搭起 `mall-web`，落地 Vue Router、Pinia、Element Plus、主题变量与路径别名。
- 完成首页、商品列表、商品详情、关于我们、联系我们等前台页面，以及后台登录、文章 / 商品 CRUD、图片上传。
- 补齐路由守卫、404、动态 title / description / OG / canonical，静态 `robots.txt` / `sitemap.xml`。
- 从本地 JSON 假数据切到真实后端接口，Axios 统一封装 `{ code, message, data }`、401 清理登录态与回跳。

### 第 2 周：Node 后端与前后端打通

- `mall-api` 用 Express 5 + Prisma 6 + MySQL 8 落地用户、商品、分类、文章、购物车、地址、订单、收藏、评价、优惠券等模型与接口。
- 统一响应信封、zod 校验、helmet / CORS 白名单、全局限流、请求体与上传限制、JWT 双令牌刷新、注销黑名单、审计日志、软删除、OpenAPI `/api/docs`。
- 金额一律用整数「分」存储，订单价格以后端库内价重算，创建订单走事务扣库存 / 清购物车 / 写订单项。
- 解决本机 `prisma migrate dev` 卡死后，改用 raw SQL + `migrate resolve --applied` 的安全流程。

### 第 3 周：uni-app 多端商城

- `mall-app` 一套 Vue3 代码编译到 H5、微信小程序与 Android App 方向。
- 完成首页、分类筛选、商品列表 / 详情、购物车、地址、确认订单、订单列表 / 详情、登录、我的、收藏、领券中心、我的券。
- `uni.request` 封装保留 401 refresh 轮换；购物车 / 地址 / 订单三个 store 接真后端，移除本地持久化。
- 修复 H5 构建把 `onShow` 从 `vue` 误导入的问题，改为从 `@dcloudio/uni-app` 导入。
- 公众号 H5 一键登录、小程序 `wx.login` / openid 登录入口已预留并接入。

### 第 4 周：三套后端、部署文档化与体验优化

- 用 **Go + Gin + sqlx** 与 **PHP 8.3 + Laravel 11 + Query Builder** 各复刻一套接口，46 条路由与 Node 版对齐，JWT 密钥、bcrypt、时间基准、优惠券算法、金额单位等逐项兼容。
- Go 版本机 `go run .` 直跑；PHP 版按要求只用 Docker Compose，宿主机不装 PHP。
- 处理 Composer 2.9+ `policy.advisories.block` 拦截 Laravel 11 / php-jwt 6.x 的问题，以及 `Api::toStoragePath()` 用 `#` 作 PCRE 分隔符导致 JSON POST 全量 500 的问题。
- 三套后端统一图片 URL 契约：库内 `/uploads/xxx`，接口返回完整 URL，写接口入口还原相对路径；共用 `backend/uploads/`；`PUBLIC_ORIGIN` 优先。
- 给 Node / Go / PHP 的 URL 归一化各补一处短路，避免每个请求 / 响应都做无意义深拷贝、JSON 反序列化或 PCRE 匹配。
- D24 / D25 付费部署按用户要求跳过，全部步骤（含付费项）集中写进 `DEPLOY.md` / `deploy.md`。
- D26 完成图片压缩 / 懒加载、骨架屏、公开 GET 缓存 + in-flight Promise 去重、错误兜底、H5 SEO 与 meta、vendor chunk、H5 hash 路由保持、收藏页下拉刷新配置补齐。

## 2. 哪些计划没有按原表执行，为什么

学习计划 D24 / D25 原本要求「后端上线、H5 静态托管、小程序提交审核」。实际执行改为：**只文档化、不购买、不部署**。

依据 `mall-api/DEPLOY.md`：

- §6 开头明确「免费的步骤现在就做 / 就文档化；所有付费项一律跳过、仅在此文档登记」。
- §7 付费项表共 12 行：10 项 ⏸ 跳过，2 项 ✅（SSL 免费方案已文档化、短信验证码无需）。
- §8「上线总验收清单」保持未勾选状态；最后一条是「付费项办妥后域名备案 / 小程序认证 / iOS 上架等按 §7 补做」。

因此 `PORTFOLIO.md` 的部署地址表全部写「待填（当前未部署）」，不把 GitHub 代码仓库链接冒充线上地址，不编造演示 URL。截图改为本机启动 dev server 后抓取真实页面，而不是伪造线上截图。

## 3. 已知边界与技术债

| 项 | 现状 | 影响 / 后续 |
|---|---|---|
| SPA SEO | `mall-web` 是 history 模式 SPA，`mall-app` H5 是 hash 模式 SPA | 爬虫只能看到静态 meta 与空容器；商品详情进 sitemap 需要预渲染或 Nuxt 3 SSR |
| H5 路由 | uni-app H5 必须保持 hash | 公众号回调里拼了 `#/pages/login/login`，改 history 会断 |
| 小程序主包 | 约 412K，未做 `subPackages` 分包；真机调试仍依赖「不校验合法域名」 | 上线前需要 CDN 图片域名、合法域名配置与分包 |
| 图片存储 | 三后端共用 `backend/uploads/`，单机目录，不在 Git 内 | 多实例 / 容器编排需要对象存储或共享卷 |
| 缓存 | 前端内存 TTL 缓存；写操作只清已完成缓存，不取消在途 GET | 极端时序下旧 GET 可能回填旧数据；进阶可加 `cacheEpoch` 或 `AbortController` |
| 缓存共享 | Node 限流 / 黑名单可选 Redis，Go / PHP 默认进程内或 file | 多实例部署需要统一 Redis |
| SSR | 未做 | 真 SEO、首屏内容、动态 sitemap 都依赖 SSR / 预渲染 |
| 文档链接 | `backend/README.md` 不在任何 Git 仓库内；Go / PHP 文档有 11 处 `../README.md` 回链指向它 | GitHub 页面上这些相对链接会失效，已登记为技术债，本轮不擅自批量改 |
| 仓库地址 | 现有文档只记录 `ndotsc/mall-web`、`ndotsc/mall-app`、`ndotsc/mall-api` | Go / PHP 仓库地址在总览中标「待补」，不按组织名推测 |
| 部署文档命名 | Node 是 `DEPLOY.md` / `DEPLOY-CN.md`，Go / PHP 是 `deploy.md`，两前端暂无 | 用户约定小写 `deploy.md`；本轮不改名，只在总览索引表标注 |
| 行尾 | `mall-app` 部分文件仍混用 CRLF，D26 提交里 `index.vue` 做过 CRLF→LF | `git diff --check` 的 trailing whitespace 告警来自 `\r`，非内容缺陷；后续统一行尾 |

## 4. 收获

- **契约先行**真的省事：先钉死 `API.md` / OpenAPI 与响应信封，Go、PHP 重写时前端一行没改。
- **金额用分、价格以后端为准、下单走事务**这三条规定避免了后续跨语言复刻时最容易出现的一致性 bug。
- **错误要分层看**：业务 401、Laravel warning 被提升成 `ErrorException`、Composer 安全公告拦截，表现都可能是「接口 500」，但根因完全不同。
- **前端优化不是堆库**：D26 零新增依赖，也能完成懒加载、骨架屏、缓存去重、错误态与 SEO 基本盘。
- **性能浪费要找短路**：递归深拷贝、每请求 JSON 反序列化、每个字符串跑 PCRE，都可以通过「先判断有没有 `/uploads`」直接跳过。
- **文档也是交付物**：部署地址、截图、复盘、路线图不写清楚，代码跑通也不等于作品集完成。

## 5. 下一步路线（学习计划 §10，只规划不实现）

| # | 方向 | 为什么做 | 前置 | 预计投入 |
|---|---|---|---|---|
| 1 | TypeScript 系统化 | 现在项目以 JS 为主，接口类型、组件 props、store 状态靠约定；类型能减少跨端 / 跨后端改契约时的低级错误 | 熟悉现有 `API.md` / OpenAPI；先给 api 层与 store 加 `.d.ts` 或逐步改 `.ts` | 3–5 天 |
| 2 | Nuxt 3 / SSR | 解决 SPA 爬虫只看到空 `#app`、商品详情无法进 sitemap、首屏依赖 JS 执行的问题 | 先把 `mall-web` 路由与数据请求层梳理成可服务端调用的模块；需要 Node 部署环境 | 1–2 周 |
| 3 | Vite / Monorepo / CI/CD / Vitest | 五个独立仓库现在靠人工同步；monorepo + 流水线能统一 lint / test / build，避免「改一处忘改关联文件」 | 先补最小 Vitest 用例与 CI；再评估 pnpm workspace / Turborepo | 1 周 |
| 4 | Redis / 消息队列 / 分布式锁 / Docker Compose | 当前限流、注销黑名单、优惠券与库存并发都偏单机；多实例会不一致，秒杀场景会超卖 | 已有可插拔 `kvStore` 与订单事务；先引入 Redis，再把限流 / 黑名单切过去 | 2–3 周 |
| 5 | 首屏加载 / 虚拟列表 / CDN / 埋点监控 | D26 解决了基础体验，但商品量大后列表滚动、图片体积、异常定位仍靠人工 | 已有 `imageUrl()` CDN 扩展点、`PageSkeleton`、全局 errorHandler；可先接一个轻量埋点与性能面板 | 1–2 周 |

顺序建议：**1 → 3 → 2 → 4 → 5**。先把类型和工程化补上，再做 SSR 与后端深化；监控与 CDN 放在有多实例 / 真实流量之后更划算。

> 以上仅为学习路线，本次 D27 没有实现其中任何一项。
