import request from './request'

export function getArticles(page = 1, pageSize = 50) {
  return request.get('/articles', { params: { page, pageSize } })
}

export function getArticle(id) {
  return request.get(`/articles/${id}`)
}

export function createArticle(article) {
  return request.post('/articles', article)
}

export function updateArticle(id, article) {
  return request.put(`/articles/${id}`, article)
}

export function deleteArticle(id) {
  return request.delete(`/articles/${id}`)
}
