// 支付方式：结算页要渲染选项，成功页要显示选中的名字 —— 两处用，抽出来
export const PAY_TYPES = [
    { value: 'wechat', label: '微信支付' },
    { value: 'alipay', label: '支付宝' },
    { value: 'cod', label: '货到付款' }
]

export function payLabel(value) {
    return PAY_TYPES.find(t => t.value === value)?.label ?? '未选择'
}
