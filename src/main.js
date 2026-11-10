import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { imageDirective } from '@/directives/image'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// D26 图片：全站 <img> 统一由 v-img 指令补懒加载与失败兜底
app.directive('img', imageDirective)

// ---------------- D26 错误兜底 ----------------
// 之前组件里抛异常只会白屏 + 控制台报错，用户完全不知道发生了什么。
// 这里做三层：Vue 组件异常 / 路由懒加载失败 / 未被 catch 的 Promise 与资源加载失败。
let lastErrorToast = 0
function notifyError() {
    const now = Date.now()
    if (now - lastErrorToast < 1500) return   // 同一次故障可能连带抛好几个错，别弹一串
    lastErrorToast = now
    ElMessage.error('页面出了点问题，刷新后重试')
}

app.config.errorHandler = (err, _instance, info) => {
    console.error('[vue error]', info, err)
    notifyError()
}

router.onError((err) => {
    console.error('[router error]', err)
    ElMessage.error('页面加载失败，请检查网络后重试')
})

window.addEventListener('unhandledrejection', (e) => {
    console.error('[unhandled rejection]', e.reason)
})

// 资源（img / script / link）加载失败不会冒泡到 Vue 的 errorHandler，
// 必须在捕获阶段监听；这里只记日志，图片的可视兜底由 v-img 指令负责。
window.addEventListener('error', (e) => {
    const el = e.target
    if (el && el.tagName && el !== window) {
        console.warn('[resource error]', el.tagName, el.src || el.href || '')
    }
}, true)

app.mount('#app')
