import request from "./request";
// keyword 为空时不传该参数，后端就不做名称过滤
export function getProducts(page = 1, pageSize = 50, keyword = "") {
    const params = { page, pageSize };
    if (keyword) params.keyword = keyword;
    return request.get('/products', { params })
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