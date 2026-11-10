import axios from "axios";
import { getToken, clearToken } from "@/utils/auth";
import { ElMessage } from 'element-plus'
import router from "@/router";

// 接口基址：
// - 本地开发 / 同域部署（Nginx 反代 /api）→ 留空，用相对路径 '/api'
// - 前后端异域部署（如 Vercel 前端 + Railway 后端）→ 配 VITE_API_BASE=https://api.你的域名.com
const API_BASE = import.meta.env.VITE_API_BASE || ''
const request = axios.create({ baseURL: API_BASE + '/api', timeout: 10000 })

// ---------------- D26 接口缓存 ----------------
// 只缓存「公开的、变化不频繁」的 GET 字典 / 列表，TTL 60 秒。
// 三条边界很重要：
//   1) 登录态下一律不缓存 —— 避免 A 用户的数据被 B 用户读到
//   2) 缓存 key 必须包含 query —— 别把第 1 页和第 2 页、不同筛选条件混在一起
//   3) 任何写操作发出时清空缓存 —— 后台改完商品，列表不能还是旧数据
const CACHE_TTL = 60 * 1000
const CACHEABLE_GET = [
    /^\/categories$/,
    /^\/products$/,
    /^\/products\/\d+$/,
    /^\/articles$/,
]
const responseCache = new Map()
const inflight = new Map()

/** 手动清空缓存（后台保存成功后也可以主动调，prefix 可只清某类接口） */
export function clearApiCache(prefix = '') {
    for (const key of responseCache.keys()) {
        if (!prefix || key.startsWith(prefix)) responseCache.delete(key)
    }
}

function stableParams(params) {
    if (!params) return ''
    return Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k] == null ? '' : params[k]}`)
        .join('&')
}

function isCacheable(url, config) {
    if (config?.cache === false) return false   // 单次跳过：request.get('/x', { cache: false })
    if (getToken()) return false                // 登录态不缓存
    return CACHEABLE_GET.some((re) => re.test(url || ''))
}

let isUnauth = false

request.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        // 写操作让读缓存立刻失效（不等响应，宁可多拉一次也不留脏数据）
        if (config.method && config.method.toLowerCase() !== 'get') clearApiCache()
        return config
    },
    (err) => Promise.reject(err)
)
request.interceptors.response.use(
    (res) => {
        const body = res.data
        if (body.code === 0) return body.data
        return Promise.reject(new Error(body.message || '请求失败'))
    },
    (err) => {
        let message = ''
        let code
        if (!err.response) {
            message = '网络连接失败'
            ElMessage.error(message)
            code = 'NETWORK_ERROR'
        } else {
            const { status } = err.response
            switch (status) {
                case 401:
                    if (isUnauth) return Promise.reject(err)
                    isUnauth = true
                    message = '登录过期，请重新登录'
                    code = 401
                    clearToken()
                    // 动态导入避免 request ↔ user store 循环依赖
                    import('@/stores/user').then(({ useUserStore }) => {
                        useUserStore().user = null
                    })
                    ElMessage.error(message)
                    router.push({
                        path: '/login',
                        query: {
                            redirect: router.currentRoute.value.fullPath
                        }
                    })
                    setTimeout(() => {
                        isUnauth = false
                    }, 1000)
                    break
                case 403:
                    message = '无权限访问'
                    ElMessage.error(message)
                    code = 403
                    break
                case 404:
                    message = '资源不存在'
                    ElMessage.error(message)
                    code = 404
                    break
                case 500:
                    message = '服务器错误'
                    ElMessage.error(message)
                    code = 500
                    break
                default:
                    message = err.response.data?.message || '请求失败'
                    ElMessage.error(message)
                    code = status
            }
        }
        const bizError = new Error(message)
        bizError.code = code
        bizError.raw = err
        return Promise.reject(bizError)
    }
)

// 重写实例上的 get，对 10 个业务 api 模块零侵入：
//   - 命中未过期缓存 → 直接 resolve 业务数据（形状与响应拦截器输出一致）
//   - 同一 key 已有在途请求 → 复用同一个 Promise，避免重复发请求
//   - 首次请求成功后写入缓存，失败不写
const originalGet = request.get.bind(request)
request.get = (url, config = {}) => {
    if (!isCacheable(url, config)) return originalGet(url, config)

    const key = `${url}?${stableParams(config.params)}`
    const hit = responseCache.get(key)
    if (hit && Date.now() - hit.at < CACHE_TTL) return Promise.resolve(hit.data)

    const pending = inflight.get(key)
    if (pending) return pending

    const p = originalGet(url, config)
        .then((data) => {
            responseCache.set(key, { at: Date.now(), data })
            return data
        })
        .finally(() => inflight.delete(key))
    inflight.set(key, p)
    return p
}

export default request
