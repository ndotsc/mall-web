import request from './request'

export const getOrder = (orderNo) => request.get(`/orders/${orderNo}`)
export const getOrderList = (params) => request.get('/orders', { params })
export const createOrder = (payload) => request.post('/orders', payload)