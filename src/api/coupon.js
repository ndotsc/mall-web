import request from './request'

// 领券中心（需登录）：返回 { list }，每项含 label / remaining(-1=不限量) / claimed
export const getCoupons = () => request.get('/coupons')

// 领取优惠券（幂等）：参数 id 为券模板 id
export const claimCoupon = (id) =>
  request.post('/coupons/' + id + '/claim')

// 我的优惠券（需登录）：status = unused | used | expired | all
export const getMyCoupons = (params) =>
  request.get('/coupons/mine', { params })
