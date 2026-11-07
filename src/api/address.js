import request from './request'

// 收货地址接口（对应后端 src/routes/address.js，全部需要 Authorization）
// 后端地址模型字段：{ id, name, phone, detail, isDefault }
// 注意：后端用单个 detail 存完整地址文本，订单 info.address 也收单个字符串，
//       因此前端不需要把省/市/区拆开，detail 直接存「省市区+详细地址」整段即可。
export const getAddresses = () => request.get('/addresses')
export const addAddress = (data) => request.post('/addresses', data)
export const updateAddress = (id, data) => request.put(`/addresses/${id}`, data)
export const deleteAddress = (id) => request.delete(`/addresses/${id}`)
// 设为默认：复用更新接口，只传 isDefault=true（后端事务保证唯一默认）
export const setDefaultAddress = (id) => request.put(`/addresses/${id}`, { isDefault: true })
