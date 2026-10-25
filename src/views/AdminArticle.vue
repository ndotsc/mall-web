<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '@/api/articles'
import request from '@/api/request'

const list = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const formRef = ref(null)

const emptyForm = () => ({
  id: null,
  title: '',
  cover: '',
  summary: '',
  content: '',
})

const form = ref(emptyForm())

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  cover: [{ required: true, message: '请上传封面', trigger: 'change' }],
  summary: [{ required: true, message: '请输入摘要', trigger: 'blur' }],
  content: [{ required: true, message: '请输入正文', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    const res = await getArticles(1, 50)
    list.value = res.list || []
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openCreate() {
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(row) {
  form.value = {
    id: row.id,
    title: row.title || '',
    cover: row.cover || '',
    summary: row.summary || '',
    content: row.content || '',
  }
  dialog.value = true
}

async function onUpload({ file }) {
  const fd = new FormData()
  fd.append('file', file)
  try {
    const data = await request.post('/upload', fd)
    form.value.cover = data.url
    formRef.value?.validateField('cover')
    ElMessage.success('上传成功')
  } catch (e) {
    if (!e.code) ElMessage.error(e.message || '上传失败')
  }
}

async function save() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return

  saving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      cover: form.value.cover,
      summary: form.value.summary.trim(),
      content: form.value.content.trim(),
    }
    if (form.value.id) {
      await updateArticle(form.value.id, payload)
      ElMessage.success('已更新')
    } else {
      await createArticle(payload)
      ElMessage.success('已创建')
    }
    dialog.value = false
    await load()
  } catch (e) {
    if (!e.code) ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.title}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deleteArticle(row.id)
    ElMessage.success('已删除')
    await load()
  } catch (e) {
    if (!e.code) ElMessage.error(e.message || '删除失败')
  }
}
</script>

<template>
  <div class="admin-article">
    <div class="toolbar">
      <h1>文章管理</h1>
      <el-button type="primary" @click="openCreate">新增文章</el-button>
    </div>

    <el-table v-loading="loading" :data="list" stripe border empty-text="暂无文章">
      <el-table-column label="封面" width="88" align="center">
        <template #default="{ row }">
          <img v-if="row.cover" class="thumb" :src="row.cover" :alt="row.title" />
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
      <el-table-column prop="summary" label="摘要" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialog"
      :title="form.id ? '编辑文章' : '新增文章'"
      width="640px"
      destroy-on-close
      @closed="form = emptyForm()"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="72px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="文章标题" maxlength="120" />
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <div class="cover-field">
            <el-upload
              :show-file-list="false"
              accept="image/*"
              :http-request="onUpload"
            >
              <el-button>上传图片</el-button>
            </el-upload>
            <img v-if="form.cover" class="cover-preview" :src="form.cover" alt="封面预览" />
          </div>
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="2"
            placeholder="列表展示用摘要"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="文章正文"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.toolbar h1 {
  margin: 0;
  font-size: 22px;
}

.thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  vertical-align: middle;
}

.muted {
  color: var(--c-text-faint);
}

.cover-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.cover-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--c-border);
}
</style>
