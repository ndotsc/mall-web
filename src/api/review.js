import request from './request'

// 商品评价列表（公开）：{ productId, page?, pageSize? }
// 返回 { list, total, page, pageSize, stats: { total, averageRating } }
export const getReviews = (params) => request.get('/reviews', { params })

// 提交评价（需登录）：{ productId, rating, content? }
export const createReview = (data) => request.post('/reviews', data)
