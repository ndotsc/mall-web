<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/api/products'
import { getCategories } from '@/api/category'
import request from '@/api/request'
import { formatPrice } from '@/utils/format'

const list = ref([])
const cats = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const formRef = ref(null)

const emptyForm = () => ({
  id: null,
  name: '',
  priceYuan: null,
  categoryId: null,
  cover: '',
  desc: '',
})

const form = ref(emptyForm())

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  priceYuan: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  cover: [{ required: true, message: '请上传封面', trigger: 'change' }],
}

function catName(id) {
  return cats.value.find((c) => c.id === id)?.name || '—'
}

async function load() {
  loading.value = true
  try {
    const res = await getProducts(1, 50)
    list.value = res.list || []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await load()
  const data = await getCategories()
  cats.value = Array.isArray(data) ? data : data?.list || []
})

function openCreate() {
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(row) {
  form.value = {
    id: row.id,
    name: row.name,
    priceYuan: Number(row.price) / 100,
    categoryId: row.categoryId,
    cover: row.cover || '',
    desc: row.desc || '',
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
      name: form.value.name.trim(),
      price: Math.round(Number(form.value.priceYuan) * 100),
      categoryId: form.value.categoryId,
      cover: form.value.cover,
      desc: (form.value.desc || '').trim(),
    }
    if (form.value.id) {
      await updateProduct(form.value.id, payload)
      ElMessage.success('已更新')
    } else {
      await createProduct(payload)
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
    await ElMessageBox.confirm(`确定删除「${row.name}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deleteProduct(row.id)
    ElMessage.success('已删除')
    await load()
  } catch (e) {
    if (!e.code) ElMessage.error(e.message || '删除失败')
  }
}
</script>

<template>
  <div class="admin-product">
    <div class="toolbar">
      <h1>商品管理</h1>
      <el-button type="primary" @click="openCreate">新增商品</el-button>
    </div>

    <el-table v-loading="loading" :data="list" stripe border empty-text="暂无商品">
      <el-table-column label="封面" width="88" align="center">
        <template #default="{ row }">
          <img v-if="row.cover" class="thumb" :src="row.cover" :alt="row.name" />
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
      <el-table-column label="价格" width="120">
        <template #default="{ row }">
          {{ formatPrice(row.price) }}
        </template>
      </el-table-column>
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          {{ catName(row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialog"
      :title="form.id ? '编辑商品' : '新增商品'"
      width="520px"
      destroy-on-close
      @closed="form = emptyForm()"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="88px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="商品名称" maxlength="64" />
        </el-form-item>
        <el-form-item label="价格" prop="priceYuan">
          <el-input-number
            v-model="form.priceYuan"
            :min="0"
            :precision="2"
            :step="1"
            controls-position="right"
          />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="c in cats"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
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
        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
            type="textarea"
            :rows="3"
            placeholder="商品描述"
            maxlength="500"
            show-word-limit
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

.unit {
  margin-left: 8px;
  color: var(--c-text-weak);
  font-size: 13px;
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
