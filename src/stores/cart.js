import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
    state: () => ({
        // items 里存的是「购物车条目」，不是原始商品
        // 每条形如：{ id, name, price, cover, desc, number }
        items: []
    }),
    getters: {
        count: (state) => state.items.reduce((total, item) => total + item.number, 0),
        // 注意要乘 number，否则买 3 件只算 1 件的钱
        totalPrice: (state) => state.items.reduce((total, item) => total + item.price * item.number, 0)
    },
    actions: {
        add(product) {
            // 用 id 查找，不要用 name（重名会串）
            const line = this.items.find(item => item.id === product.id)
            if (line) {
                line.number++
            } else {
                // {...product} 是浅拷贝：复制一份商品信息，再加数量
                // 这样不会污染 mock/products.js 里的原始数据
                this.items.push({ ...product, number: 1 })
            }
        },
        remove(id) {
            this.items = this.items.filter(item => item.id !== id)
        },
        clear() {
            this.items = []
        },
        increase(id) {
            const line = this.items.find(item => item.id === id)
            if (line) {
                line.number++
            }
        },
        decrease(id) {
            const line = this.items.find(item => item.id === id)
            if (line && line.number > 1) {
                line.number--
            }
        },
        // 输入框失焦时同步数量：非法值回落到 1，越界值夹到 [1, 99]
        update(id, num) {
            const line = this.items.find(item => item.id === id)
            if (!line) return          // 条目可能已被删除，必须先判空再改
            const val = parseInt(num, 10)
            line.number = isNaN(val) ? 1 : Math.min(99, Math.max(1, val))
        }
    },
})
