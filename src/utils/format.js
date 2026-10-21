/**
 * 价格格式化：把「分」转成带 ¥ 的字符串
 * 89900 -> "¥899.00"
 *
 * 为什么单独抽一个文件：列表页和详情页都要用，
 * 抽出来后只需要改一处（和 products.js 是一个道理）
 */
export function formatPrice(cents) {
    if (cents == null) return '--'
    return '¥' + (Number(cents) / 100).toFixed(2)
}
