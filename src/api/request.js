import axios from "axios";
import { getToken, clearToken } from "@/utils/auth";
import { ElMessage } from 'element-plus'
import router from "@/router";

const request = axios.create({ baseURL: '/api', timeout: 10000 })

let isUnauth = false

request.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
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
export default request