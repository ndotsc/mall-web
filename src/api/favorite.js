import request from './request'

// 收藏/心愿单
export const getFavorites = (params) => request.get('/favorites', { params })
export const checkFavorite = (productId) =>
  request.get('/favorites/check', { params: { productId } })
export const addFavorite = (productId) =>
  request.post('/favorites', { productId })
export const removeFavorite = (productId) =>
  request.delete('/favorites/' + productId)
