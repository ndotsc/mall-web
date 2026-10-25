<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatPrice } from '@/utils/format'
import { payLabel } from '@/constants'
import { getOrder } from '@/api/orders'

const route = useRoute()
const loading = ref(true)
const orderInfo = ref(null)

onMounted(async () => {
    try {
        const d = await getOrder(route.params.id)
        orderInfo.value = {
            orderNo: d.orderNo,
            total: d.totalAmount,
            status: d.status === 1 ? '待发货' : d.status === 2 ? '已发货' : '已完成',
            payType: d.payType,
            info: {
                name: d.receiverName,
                phone: d.receiverPhone,
                address: d.address,
            },
            remark: d.remark,
            count: d.items.reduce((t, i) => t + i.number, 0),
            items: d.items.map(i => ({
                id: i.productId,
                name: i.name,
                price: i.price,
                number: i.number,
                cover: i.cover,
            }))
        }
    } catch (e) {
        orderInfo.value = null
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <!-- 兜底：地址栏直接输一个不存在的订单号 -->
    <div v-if="!orderInfo" class="container empty">
        <div class="empty-icon">?</div>
        <h2>订单不存在</h2>
        <p class="muted">这笔订单可能已超时，或数据只存在内存中、刷新后已清空。</p>
        <RouterLink to="/products" class="btn btn-ghost">去逛逛</RouterLink>
    </div>

    <div v-else class="container success">
        <div class="card panel">
            <div class="ok-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            </div>
            <h1>下单成功</h1>
            <p class="muted sub">我们会尽快为你发货</p>

            <div class="rows">
                <div class="row"><span class="muted">订单号</span><span class="mono">{{ orderInfo.orderNo }}</span></div>
                <div class="row"><span class="muted">订单金额</span>
                    <span class="amount">{{ formatPrice(orderInfo.total) }}</span>
                </div>
                <div class="row"><span class="muted">商品件数</span><span>共 {{ orderInfo.count }} 件</span></div>
                <div class="row"><span class="muted">支付方式</span><span>{{ payLabel(orderInfo.payType) }}</span></div>
                <div class="row"><span class="muted">订单状态</span><span
                        class="status">{{ orderInfo.status }}</span></div>
                <div class="row"><span class="muted">收货人</span><span>{{ orderInfo.info.name }} {{
                    orderInfo.info.phone }}</span></div>
                <div class="row"><span class="muted">收货地址</span><span class="addr">{{ orderInfo.info.address
                        }}</span></div>
                <div v-if="orderInfo.remark" class="row"><span class="muted">备注</span><span class="addr">{{
                    orderInfo.remark }}</span></div>
            </div>

            <div class="goods">
                <div v-for="item in orderInfo.items" :key="item.id" class="g-line">
                    <img class="g-thumb" :src="item.cover" :alt="item.name" />
                    <div class="g-info">
                        <div class="clamp-2">{{ item.name }}</div>
                        <div class="muted">× {{ item.number }}</div>
                    </div>
                    <div class="g-price">{{ formatPrice(item.price * item.number) }}</div>
                </div>
            </div>

            <div class="actions">
                <RouterLink to="/" class="btn btn-ghost">返回首页</RouterLink>
                <RouterLink to="/products" class="btn">继续逛逛</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    padding-top: 32px;
    padding-bottom: 32px;
}

/* ---------- 空状态 ---------- */
.empty {
    text-align: center;
    padding: 72px 20px;
}

.empty-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 12px;
    border-radius: 50%;
    background: var(--c-bg);
    color: var(--c-text-faint);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.empty .btn {
    margin-top: 16px;
}

/* ---------- 成功页 ---------- */
.panel {
    max-width: 480px;
    margin: 0 auto;
    padding: 32px 24px;
    text-align: center;
}

.ok-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 14px;
    border-radius: 50%;
    background: #e8f5ea;
    color: #1a7f37;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ok-icon svg {
    width: 26px;
    height: 26px;
}

.panel h1 {
    font-size: 22px;
    margin: 0;
}

.sub {
    margin: 6px 0 20px;
    font-size: 14px;
}

.rows {
    text-align: left;
    border-top: 1px solid var(--c-border);
    padding-top: 14px;
}

.row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 5px 0;
    font-size: 14px;
}

.row .muted {
    flex-shrink: 0;
}

.row .addr {
    text-align: right;
    word-break: break-all;
}

.mono {
    font-variant-numeric: tabular-nums;
}

.amount {
    font-weight: 600;
    color: var(--c-danger);
    font-variant-numeric: tabular-nums;
}

.status {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 12px;
    background: #fff4e0;
    color: #a35b00;
}

/* ---------- 商品清单 ---------- */
.goods {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--c-border);
    text-align: left;
}

.g-line {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
}

.g-thumb {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
}

.g-info {
    flex: 1;
    min-width: 0;
    font-size: 14px;
}

.g-price {
    font-variant-numeric: tabular-nums;
    font-size: 14px;
}

.actions {
    display: flex;
    gap: 10px;
    margin-top: 22px;
}

.actions .btn {
    flex: 1;
}
</style>
