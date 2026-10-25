import request from "./request";
export function getProducts(page = 1, pageSize = 50) {
    return request.get('/products', { params: { page, pageSize } })
}

export function getProduct(id) {
    return request.get(`/products/${id}`)
}

export function createProduct(product) {
    return request.post('/products', product)
}

export function updateProduct(id, product) {
    return request.put(`/products/${id}`, product)
}

export function deleteProduct(id) {
    return request.delete(`/products/${id}`)
}