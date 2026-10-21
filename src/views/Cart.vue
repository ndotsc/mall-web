<script setup>
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import { formatPrice } from '@/utils/format'
import router from '../router'

const cart = useCartStore()
const { count, totalPrice } = storeToRefs(cart)

// 输入框失焦 / 回车：把值交给 store 纠正，组件自己不改数据
function handleBlur(id, value, el) {
    cart.update(id, value)
    el?.blur()   // 回车时顺手让输入框失焦，否则焦点还留着
}
</script>

<template>
    <div class="container">
        <h1 class="page-title">购物车</h1>

        <!-- 空状态：购物车为空时不能是一片空白 -->
        <div v-if="cart.items.length === 0" class="card empty">
            <div class="empty-icon">🛒</div>
            <h2>购物车还是空的</h2>
            <p class="muted">去挑几件喜欢的商品吧</p>
            <RouterLink to="/products" class="btn btn-ghost">去逛逛</RouterLink>
        </div>

        <template v-else>
            <div class="list-head">
                <span>共 {{ count }} 件商品</span>
                <button class="link-btn" @click="cart.clear()">清空购物车</button>
            </div>

            <!-- 表头：窄屏隐藏，因为手机版是卡片式布局，对不上列 -->
            <div class="row-head">
                <span>商品</span>
                <span></span>
                <span class="col-price">单价</span>
                <span class="col-stepper">数量</span>
                <span class="col-subtotal">小计</span>
                <span></span>
            </div>

            <div class="card item" v-for="item in cart.items" :key="item.id">
                <!-- 缩略图 -->
                <RouterLink
                    :to="{ name: 'product', params: { id: item.id } }"
                    class="thumb"
                >
                    <img :src="item.cover" :alt="item.name" />
                </RouterLink>

                <!-- 名称 -->
                <RouterLink
                    :to="{ name: 'product', params: { id: item.id } }"
                    class="info"
                >
                    <div class="name clamp-2">{{ item.name }}</div>
                    <div class="desc muted clamp-2">{{ item.desc }}</div>
                </RouterLink>

                <!-- 单价 -->
                <div class="price-cell muted">{{ formatPrice(item.price) }}</div>

                <!-- 数量步进器 -->
                <div class="stepper">
                    <button
                        class="minus"
                        :disabled="item.number <= 1"
                        @click="cart.decrease(item.id)"
                    >&minus;</button>
                    <input
                        class="num"
                        type="text"
                        inputmode="numeric"
                        autocomplete="off"
                        :value="item.number"
                        @blur="handleBlur(item.id, $event.target.value)"
                        @keydown.enter="handleBlur(item.id, $event.target.value, $event.target)"
                    />
                    <button class="plus" @click="cart.increase(item.id)">+</button>
                </div>

                <!-- 小计 -->
                <div class="subtotal">{{ formatPrice(item.price * item.number) }}</div>

                <!-- 删除 -->
                <button class="del" @click="cart.remove(item.id)">删除</button>
            </div>

            <!-- 占位：避免固定结算栏遮住最后一条 -->
            <div class="bar-space"></div>
        </template>

        <!-- 底部结算栏：固定在视口底部，不随页面滚动 -->
        <div v-if="cart.items.length > 0" class="checkout-bar">
            <div class="container bar-inner">
                <div class="sum">
                    <span class="muted">共 {{ count }} 件 · </span>
                    <span class="muted">合计</span>
                    <span class="total">{{ formatPrice(totalPrice) }}</span>
                </div>
                <div class="bar-actions">
                    <RouterLink to="/products" class="btn btn-ghost">继续购物</RouterLink>
                    <button class="btn" @click="router.push('/checkout')">去结算</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-title {
    margin: 32px 0 20px;
}

/* ---------- 列表头 ---------- */
.list-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--c-text-weak);
}
.link-btn {
    padding: 0;
    font-size: 14px;
    color: var(--c-text-weak);
    transition: color .18s;
}
.link-btn:hover { color: var(--c-danger); }

/* 表头：和下面每行的列宽必须一致，否则对不齐 */
.row-head {
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr) 110px 118px 110px 44px;
    gap: 16px;
    padding: 0 16px 10px;
    font-size: 13px;
    color: var(--c-text-weak);
}
.col-price, .col-subtotal { text-align: center; }
.col-stepper { text-align: center; }

/* ---------- 购物车条目 ---------- */
.item {
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr) 110px 118px 110px 44px;
    gap: 16px;
    align-items: center;
    padding: 16px;
    margin-bottom: 12px;
    transition: box-shadow .2s, border-color .2s;
}
.item:hover {
    box-shadow: var(--shadow-md);
    border-color: #d6dae0;
}

.thumb {
    aspect-ratio: 1 / 1;
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--c-bg);
}
.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info { min-width: 0; }   /* 没有这行，长商品名会把网格撑破 */
.name {
    font-size: 15px;
    font-weight: 500;
    color: var(--c-text);
    transition: color .18s;
}
.info:hover .name { color: var(--c-brand); }
.desc { margin-top: 4px; font-size: 13px; }

.price-cell { text-align: center; font-size: 14px; }

.subtotal {
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--c-danger);
}

.del {
    font-size: 13px;
    color: var(--c-text-faint);
    transition: color .18s;
}
.del:hover { color: var(--c-danger); }

/* ---------- 步进器 ---------- */
.stepper {
    justify-self: center;
    display: inline-flex;
    align-items: stretch;     /* 三段等高，撑满外壳 */
    height: 34px;
    background: #fff;
    border: 1px solid var(--c-border);
    border-radius: 8px;
    overflow: hidden;         /* 切掉内部方角 */
}
.stepper button {
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--c-text);
    background: #fff;
    transition: background .18s, color .18s;
}
.stepper button:hover:not(:disabled) {
    background: var(--c-brand-weak);
    color: var(--c-brand);
}
/* 禁用态全交给 CSS，JS 只设置 disabled 属性 */
.stepper button:disabled {
    color: var(--c-text-faint);
    background: #fff;
    cursor: not-allowed;
}
.stepper .num {
    width: 44px;
    border: none;
    border-left: 1px solid var(--c-border);
    border-right: 1px solid var(--c-border);
    text-align: center;
    font-family: inherit;
    font-size: 14px;
    color: var(--c-text);
    background: #fff;
    outline: none;
    transition: background .18s;
}
.stepper .num:focus { background: var(--c-brand-weak); }

/* ---------- 底部结算栏 ---------- */
.checkout-bar {
    position: fixed;      /* 固定在视口，不随页面滚动 */
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 90;
    background: var(--c-surface);
    border-top: 1px solid var(--c-border);
    box-shadow: 0 -2px 12px rgba(16, 24, 40, .06);
    padding: 14px 0;
}
.bar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}
.sum { font-size: 14px; }
.total {
    margin-left: 6px;
    font-size: 22px;
    font-weight: 600;
    color: var(--c-danger);
}
.bar-actions { display: flex; gap: 10px; }

/* 给固定栏留出空间，否则最后一条会被挡住 */
.bar-space { height: 88px; }

/* ---------- 空状态 ---------- */
.empty {
    padding: 72px 20px;
    text-align: center;
}
.empty-icon {
    font-size: 44px;
    opacity: .5;
    margin-bottom: 8px;
}
.empty h2 { margin-bottom: 6px; }
.empty .btn { margin-top: 16px; }

/* ---------- 窄屏：表头隐藏，卡片式重排 ---------- */
@media (max-width: 768px) {
    .row-head { display: none; }

    .item {
        grid-template-columns: 72px minmax(0, 1fr) auto;
        grid-template-areas:
            "thumb info    del"
            "thumb price   price"
            "thumb stepper subtotal";
        gap: 8px 12px;
        align-items: center;
    }
    .thumb   { grid-area: thumb; }
    .info    { grid-area: info; }
    .price-cell { grid-area: price; text-align: left; }
    .stepper { grid-area: stepper; justify-self: start; }
    .subtotal { grid-area: subtotal; text-align: right; }
    .del     { grid-area: del; justify-self: end; }

    .desc { display: none; }   /* 手机上省空间，只留商品名 */

    .bar-space { height: 128px; }
    .bar-inner { justify-content: center; }
    .sum { width: 100%; text-align: center; }
    .bar-actions { width: 100%; }
    .bar-actions .btn { flex: 1; }
}
</style>
