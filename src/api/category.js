import request from './request.js'

export const getCategories = () => request.get('/categories')
