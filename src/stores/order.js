import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
    state: () => ({
        // 每条形如：
        // { orderNo, items: [...快照], info: {name, phone, address},
        //   payType, remark, total, status, createdAt }
        orders: []
    }),
    getters: {
        // ★ orders[-1] 是 undefined！JS 没有"倒数第一个"这种写法
        last: (state) => state.orders[state.orders.length - 1],

        // 按订单号查。成功页刷新后订单就没了（数据在内存里），所以要能优雅兜底
        getByNo: (state) => (no) => state.orders.find(o => o.orderNo === no)
    },
    actions: {
        create({ items, info, payType, remark, total }) {
            const orderNo = 'NO' + Date.now()
            this.orders.push({
                orderNo,
                // ★ 快照必须在这里复制：购物车随后会被 clear()，
                //   如果存的是引用，订单里的商品会跟着一起消失
                items: items.map(item => ({ ...item })),
                info: { ...info },
                payType,
                remark,
                total,
                status: '待发货',
                createdAt: Date.now()
            })
            return orderNo
        }
    },
})
