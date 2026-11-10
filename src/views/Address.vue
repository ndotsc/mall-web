<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address'
import { isLoggedIn } from '@/utils/auth'
import PageSkeleton from '@/components/PageSkeleton.vue'

const router = useRouter()
const list = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)
const form = ref({ name: '', phone: '', detail: '', isDefault: false })

onMounted(load)

async function load() {
  if (!isLoggedIn()) {
    router.replace({ path: '/login', query: { redirect: '/address' } })
    return
  }
  loading.value = true
  try {
    list.value = await getAddresses()
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', phone: '', detail: '', isDefault: false }
  dialogVisible.value = true
}

function openEdit(a) {
  editingId.value = a.id
  form.value = { name: a.name, phone: a.phone, detail: a.detail, isDefault: !!a.isDefault }
  dialogVisible.value = true
}

function validate() {
  if (!form.value.name.trim()) return '请填写收货人'
  if (!/^1[3-9]\d{9}$/.test(form.value.phone.trim())) return '请填写正确的 11 位手机号'
  if (form.value.detail.trim().length < 5) return '详细地址至少 5 个字'
  return ''
}

async function save() {
  const err = validate()
  if (err) { ElMessage.warning(err); return }
  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      detail: form.value.detail.trim(),
      isDefault: form.value.isDefault,
    }
    if (editingId.value) await updateAddress(editingId.value, payload)
    else await addAddress(payload)
    ElMessage.success('已保存')
    dialogVisible.value = false
    await load()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function setDefault(a) {
  try {
    await setDefaultAddress(a.id)
    ElMessage.success('已设为默认')
    await load()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || e.message || '操作失败')
  }
}

async function remove(a) {
  try {
    await ElMessageBox.confirm(`确定删除「${a.name}」这个地址？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return // 用户取消
  }
  try {
    await deleteAddress(a.id)
    ElMessage.success('已删除')
    await load()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || e.message || '删除失败')
  }
}
</script>

<template>
  <div class="container address-page">
    <div class="page-head">
      <h1>收货地址</h1>
      <el-button type="primary" @click="openAdd">＋ 新增地址</el-button>
    </div>

    <PageSkeleton v-if="loading" type="list" :rows="3" />

    <div v-else-if="!list.length" class="empty">
      <p>还没有收货地址</p>
      <el-button type="primary" @click="openAdd">去添加第一个</el-button>
    </div>

    <div v-else class="addr-list">
      <div v-for="a in list" :key="a.id" class="addr-card">
        <div class="addr-top">
          <span class="name">{{ a.name }}</span>
          <span class="phone">{{ a.phone }}</span>
          <span v-if="a.isDefault" class="tag">默认</span>
        </div>
        <p class="detail">{{ a.detail }}</p>
        <div class="ops">
          <el-button v-if="!a.isDefault" link type="primary" @click="setDefault(a)">设为默认</el-button>
          <el-button link @click="openEdit(a)">编辑</el-button>
          <el-button link type="danger" @click="remove(a)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑地址' : '新增地址'" width="460px">
      <el-form label-width="72px" label-position="right">
        <el-form-item label="收货人">
          <el-input v-model="form.name" placeholder="收货人姓名" maxlength="20" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="11 位手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="form.detail" type="textarea" :rows="3"
            placeholder="省 / 市 / 区 / 街道门牌，例如：浙江省杭州市西湖区文三路 100 号" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.address-page {
  padding-top: 24px;
  padding-bottom: 40px;
}
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-head h1 {
  font-size: 24px;
  margin: 0;
}
.empty {
  text-align: center;
  color: var(--c-text-faint);
  padding: 80px 0;
}
.empty p {
  margin-bottom: 16px;
}
.addr-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.addr-card {
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}
.addr-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.addr-top .name {
  font-size: 16px;
  font-weight: 600;
}
.addr-top .phone {
  font-size: 14px;
  color: var(--c-text-weak);
}
.tag {
  font-size: 12px;
  color: var(--c-brand);
  background: var(--c-brand-weak);
  padding: 1px 10px;
  border-radius: 999px;
}
.detail {
  margin: 10px 0 12px;
  font-size: 14px;
  color: var(--c-text-weak);
  line-height: 1.6;
  word-break: break-all;
}
.ops {
  display: flex;
  gap: 8px;
}
</style>
