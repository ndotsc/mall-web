<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'
import { PAY_TYPES } from '@/constants'
import { createOrder } from '@/api/orders'
import { isLoggedIn } from '@/utils/auth'

const router = useRouter()
const cart = useCartStore()

// 未登录先去登录，回来继续结算
if (!isLoggedIn()) {
  router.replace({ path: '/login', query: { redirect: '/checkout' } })
}
// 购物车为空时不该停在结算页
else if (!cart.items.length) {
  router.replace('/cart')
}

// ★ 直接读 store，不拷贝。购物车是这份数据唯一的主人，
//   这里做一份副本就会出现"改了购物车、页面不跟着变"的老毛病
const items = computed(() => cart.items)
const totalCount = computed(() => cart.count)
const totalPrice = computed(() => cart.totalPrice)

const form = ref({ name: '', phone: '', address: '', remark: '' })
const payType = ref('wechat')
const errors = ref({ name: false, phone: false, address: false })

const nameInput = ref(null)
const phoneInput = ref(null)
const addressInput = ref(null)

const isOpen = ref(false)
const isShow = ref(false)
const applying = ref(false)

/* ---------- 校验 ---------- */
function checkName() {
    errors.value.name = !form.value.name.trim()
    return !errors.value.name
}

function checkPhone() {
    const ok = /^1[3-9]\d{9}$/.test(form.value.phone.trim())
    errors.value.phone = !ok
    return ok
}

function checkAddress() {
    errors.value.address = form.value.address.trim().length < 5
    return !errors.value.address
}

// 一开始修改就撤掉报错，别让红框一直挂着
function reset(field) {
    errors.value[field] = false
}

function submit() {
    // ★ 校验顺序跟页面顺序一致，出错就聚焦到那一个框
    //   （原来的写法里 submit 第一句是 `return`，下面全成了死代码，校验压根没跑）
    if (!checkName()) { nameInput.value?.focus(); return }
    if (!checkPhone()) { phoneInput.value?.focus(); return }
    if (!checkAddress()) { addressInput.value?.focus(); return }

    isOpen.value = true
}

/* ---------- 下单 ---------- */
async function apply() {
    // ★ 防重复点击：手快连点会生成两笔订单
    if (applying.value) return
    applying.value = true

    try {
        const { orderNo } = await createOrder({
            items: items.value.map(i => ({ productId: i.id, number: i.number })),
            info: {
                name: form.value.name.trim(),
                phone: form.value.phone.trim(),
                address: form.value.address.trim()
            },
            payType: payType.value,
            remark: form.value.remark.trim()
        })
    
        showToast(1500, () => {
            isOpen.value = false
            // 结算页这一刻才清空购物车：提前清空的话，
            // 这 1.5 秒里页面上的商品清单会突然变成空的
            cart.clear()
            router.replace('/order-success/' + orderNo)
        })
    } catch (e) {
        applying.value = false
        const msg = e.response?.data?.message || e.message || '下单失败'
        alert(msg)
    }
}

function showToast(duration = 2000, callback) {
    isShow.value = true
    setTimeout(() => {
        isShow.value = false
        callback?.()
    }, duration)
}
</script>

<template>
    <div class="container checkout">
        <h1>确认订单</h1>

        <!-- 1. 收货信息 -->
        <section class="block card">
            <h2 class="block-title">收货信息</h2>

            <div class="field">
                <label class="label" for="name">收货人</label>
                <input ref="nameInput" id="name" class="input" :class="{ 'is-error': errors.name }" v-model="form.name"
                    placeholder="请输入收货人姓名" autocomplete="name" @blur="checkName" @input="reset('name')" />
                <p class="msg" :class="{ 'is-error': errors.name }">请输入收货人姓名</p>
            </div>

            <div class="field">
                <label class="label" for="phone">手机号</label>
                <input ref="phoneInput" id="phone" class="input" :class="{ 'is-error': errors.phone }"
                    v-model="form.phone" placeholder="11 位手机号" inputmode="numeric" autocomplete="tel"
                    @blur="checkPhone" @input="reset('phone')" />
                <p class="msg" :class="{ 'is-error': errors.phone }">请输入正确的 11 位手机号</p>
            </div>

            <div class="field">
                <label class="label" for="address">详细地址</label>
                <input ref="addressInput" id="address" class="input" :class="{ 'is-error': errors.address }"
                    v-model="form.address" placeholder="省 / 市 / 区 / 街道门牌" autocomplete="street-address"
                    @blur="checkAddress" @input="reset('address')" />
                <p class="msg" :class="{ 'is-error': errors.address }">地址至少 5 个字</p>
            </div>
        </section>

        <!-- 2. 支付方式 -->
        <section class="block card">
            <h2 class="block-title">支付方式</h2>
            <div class="pay-list">
                <label v-for="t in PAY_TYPES" :key="t.value" class="pay">
                    <input type="radio" name="paytype" :value="t.value" v-model="payType" />
                    <span class="pay-box">{{ t.label }}</span>
                </label>
            </div>
        </section>

        <!-- 3. 商品清单 -->
        <section class="block card">
            <h2 class="block-title">商品清单</h2>

            <div v-for="item in items" :key="item.id" class="line">
                <RouterLink :to="{ name: 'product', params: { id: item.id } }" class="thumb">
                    <img :src="item.cover" :alt="item.name" />
                </RouterLink>

                <div class="info">
                    <RouterLink :to="{ name: 'product', params: { id: item.id } }" class="name clamp-2">
                        {{ item.name }}
                    </RouterLink>
                    <div class="muted desc clamp-2">{{ item.desc }}</div>
                </div>

                <div class="price-cell muted">{{ formatPrice(item.price) }}</div>
                <div class="subtotal">
                    <div class="sub-price">{{ formatPrice(item.price * item.number) }}</div>
                    <div class="muted">共 {{ item.number }} 件</div>
                </div>
            </div>

            <div class="field" style="margin-top:16px">
                <label class="label" for="remark">订单备注</label>
                <textarea id="remark" class="input" v-model="form.remark"
                    placeholder="有什么想跟商家说的？（选填）"></textarea>
            </div>
        </section>

        <!-- 4. 合计 + 提交 -->
        <div class="bar card">
            <div class="sum">
                <span class="muted">共 {{ totalCount }} 件 · 合计</span>
                <span class="total">{{ formatPrice(totalPrice) }}</span>
            </div>
            <button class="btn submit-btn" @click="submit">提交订单</button>
        </div>
    </div>

    <!-- 确认弹窗 -->
    <div class="mask" :class="{ 'is-open': isOpen }" @click.self="isOpen = false">
        <div class="dialog">
            <h3 class="dialog-title">确认提交订单？</h3>
            <p class="dialog-body">
                收货人：{{ form.name }} · {{ form.phone }}<br />
                地址：{{ form.address }}
            </p>
            <div class="sum dialog-sum">
                <span class="muted">共 {{ totalCount }} 件 · 合计</span>
                <span class="total">{{ formatPrice(totalPrice) }}</span>
            </div>
            <div class="dialog-actions">
                <button class="btn btn-ghost" :disabled="applying" @click="isOpen = false">再看看</button>
                <button class="btn submit-btn" :disabled="applying" @click="apply">
                    {{ applying ? '提交中…' : '确认提交' }}
                </button>
            </div>
        </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ 'is-show': isShow }">
        <span class="toast-dot"></span>
        <span>下单成功</span>
    </div>
</template>

<style scoped>
.checkout {
    padding-top: 24px;
    padding-bottom: 24px;
}

.checkout h1 {
    font-size: 24px;
}

.block {
    padding: 20px;
    margin-bottom: 16px;
}

.block-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 16px;
}

/* ---------- 表单 ---------- */
.field+.field {
    margin-top: 14px;
}

.label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
}

.input {
    width: 100%;
    font-family: inherit;
    font-size: 15px;
    line-height: 1.5;
    padding: 10px 12px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    background: #fff;
    color: var(--c-text);
    transition: border-color .15s ease, box-shadow .15s ease;
}

.input::placeholder {
    color: var(--c-text-faint);
}

/* 聚焦用 box-shadow 画光圈，不加粗 border（一抖就露馅） */
.input:focus {
    outline: none;
    border-color: var(--c-brand);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, .15);
}

.input.is-error {
    border-color: var(--c-danger);
}

.input.is-error:focus {
    box-shadow: 0 0 0 3px rgba(229, 72, 77, .15);
}

textarea.input {
    resize: vertical;
    min-height: 84px;
}

/* 预留一行高度：报错文案出现时不把下方内容顶下去 */
.msg {
    min-height: 18px;
    font-size: 12px;
    line-height: 18px;
    margin: 6px 0 0;
    color: var(--c-text-faint);
    opacity: 0;
    transition: opacity .15s ease;
}

.msg.is-error {
    color: var(--c-danger);
    opacity: 1;
}

/* ---------- 支付方式 ---------- */
.pay-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.pay input {
    position: absolute;
    opacity: 0;
    /* 藏起来但仍然可聚焦、可被 label 点中 */
}

.pay-box {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border: 1px solid var(--c-border);
    border-radius: var(--radius-pill);
    font-size: 14px;
    cursor: pointer;
    transition: border-color .15s, background .15s, color .15s;
}

.pay-box:hover {
    border-color: #b6bcc6;
}

.pay input:checked+.pay-box {
    border-color: var(--c-brand);
    background: var(--c-brand-weak);
    color: var(--c-brand);
}

/* 藏起来的 radio 也要保留键盘焦点提示（无障碍必做） */
.pay input:focus-visible+.pay-box {
    box-shadow: 0 0 0 3px rgba(37, 99, 235, .3);
}

/* ---------- 商品行 ---------- */
.line {
    display: grid;
    grid-template-columns: 72px 1fr 90px 96px;
    gap: 14px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--c-border);
}

.line:last-of-type {
    border-bottom: none;
}

.thumb {
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    overflow: hidden;
    background: var(--c-bg);
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info {
    min-width: 0;
    /* grid 子项防撑破 */
}

.name {
    font-size: 15px;
}

.desc {
    font-size: 13px;
    margin-top: 2px;
}

.price-cell,
.subtotal {
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.sub-price {
    font-weight: 500;
}

/* ---------- 底部合计 ---------- */
.bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    flex-wrap: wrap;
}

.sum {
    font-variant-numeric: tabular-nums;
}

.total {
    font-size: 22px;
    font-weight: 600;
    color: var(--c-danger);
    margin-left: 6px;
}

.submit-btn {
    padding: 12px 28px;
}

/* ---------- 确认弹窗 ---------- */
.mask {
    position: fixed;
    inset: 0;
    background: rgba(16, 24, 40, .45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 100;
    opacity: 0;
    visibility: hidden;
    transition: opacity .2s ease, visibility .2s ease;
}

.mask.is-open {
    opacity: 1;
    visibility: visible;
}

.dialog {
    width: 360px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    background: #fff;
    border-radius: 14px;
    padding: 24px;
    box-shadow: 0 12px 40px rgba(16, 24, 40, .18);
    /* 阴影大而柔，弹窗才像浮在最上层 */
    transform: translateY(8px) scale(.98);
    transition: transform .2s ease;
}

.mask.is-open .dialog {
    transform: none;
}

.dialog-title {
    font-size: 17px;
    font-weight: 600;
    margin: 0 0 8px;
}

.dialog-body {
    font-size: 14px;
    color: var(--c-text-weak);
    margin: 0 0 16px;
    line-height: 1.7;
}

.dialog-sum {
    padding: 12px 0 16px;
    border-top: 1px solid var(--c-border);
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

/* ---------- Toast ---------- */
.toast {
    position: fixed;
    left: 50%;
    bottom: 40px;
    z-index: 200;
    background: rgba(16, 24, 40, .88);
    color: #fff;
    font-size: 14px;
    padding: 10px 18px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: calc(100vw - 48px);
    pointer-events: none;
    opacity: 0;
    /* ★ 两个 transform 都要写，只写 translateY 会把 translateX 覆盖掉 */
    transform: translateX(-50%) translateY(8px);
    transition: opacity .2s ease, transform .2s ease;
}

.toast.is-show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

.toast-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4ade80;
}

/* ---------- 窄屏 ---------- */
@media (max-width: 560px) {
    .line {
        grid-template-columns: 64px 1fr 84px;
    }

    .price-cell {
        display: none;
    }

    .bar {
        flex-direction: column;
        align-items: stretch;
    }

    .submit-btn {
        width: 100%;
    }
}
</style>
