<template>
  <div class="login-page">
    <div class="login-card">
      <div class="mode-tabs">
        <button
          type="button"
          :class="{ active: mode === 'login' }"
          @click="switchMode('login')"
        >
          登录
        </button>
        <button
          type="button"
          :class="{ active: mode === 'register' }"
          @click="switchMode('register')"
        >
          注册
        </button>
      </div>

      <h1>{{ mode === 'login' ? '欢迎回来' : '创建账号' }}</h1>
      <p class="sub">
        {{ mode === 'login' ? '登录后继续购物' : '注册后即可下单' }}
      </p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item
          v-if="mode === 'register'"
          label="昵称"
          prop="nickname"
        >
          <el-input
            v-model="form.nickname"
            placeholder="展示用昵称"
            autocomplete="nickname"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </el-form-item>

        <el-button
          type="primary"
          class="submit-btn"
          :loading="loading"
          native-type="submit"
        >
          {{ mode === 'login' ? '登录' : '注册并登录' }}
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const mode = ref('login') // 'login' | 'register'
const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  username: '',
  password: '',
  nickname: '',
})

const rules = computed(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 32, message: '用户名 3–32 个字符', trigger: 'blur' },
  ],
  nickname: [
    {
      required: mode.value === 'register',
      message: '请输入昵称',
      trigger: 'blur',
    },
    { max: 32, message: '昵称最多 32 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 64, message: '密码至少 6 位', trigger: 'blur' },
  ],
}))

function switchMode(next) {
  mode.value = next
  formRef.value?.clearValidate()
}

function redirectAfterAuth() {
  const redirect = route.query.redirect
  const target =
    typeof redirect === 'string' && redirect.startsWith('/')
      ? redirect
      : '/'
  router.replace(target)
}

async function onSubmit() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return

  loading.value = true
  try {
    if (mode.value === 'login') {
      await userStore.login(form.username, form.password)
      ElMessage.success('登录成功')
    } else {
      await userStore.register(form.username, form.password, form.nickname)
      ElMessage.success('注册成功')
    }
    redirectAfterAuth()
  } catch (e) {
    // HTTP / 网络错误已由 request 拦截器提示，这里只补业务错误
    if (!e.code) ElMessage.error(e.message || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  padding: 48px 16px 64px;
  min-height: calc(100vh - 160px);
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, #dbeafe 0%, transparent 55%),
    var(--c-bg);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 28px 28px 32px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.mode-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  padding: 4px;
  background: var(--c-bg);
  border-radius: var(--radius-pill);
}

.mode-tabs button {
  flex: 1;
  padding: 8px 0;
  border-radius: var(--radius-pill);
  font-size: 14px;
  color: var(--c-text-weak);
  transition: background 0.18s, color 0.18s;
}

.mode-tabs button.active {
  background: var(--c-surface);
  color: var(--c-brand);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.login-card h1 {
  font-size: 22px;
  margin-bottom: 4px;
}

.sub {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--c-text-weak);
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
