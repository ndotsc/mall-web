import request from "./request";
export function getProducts(page = 1, pageSize = 50) {
    return request.get('/products', { params: { page, pageSize } })
}

export function getProduct(id) {
    return request.get(`/products/${id}`)
}