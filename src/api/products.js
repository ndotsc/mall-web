import request from "./request";
// keyword 为空时不传该参数，后端就不做名称过滤
// categoryId / minPrice / maxPrice / sort 与小程序端一致（金额单位：分；sort 默认 created_desc）
export function getProducts(page = 1, pageSize = 50, keyword = "", extra = {}) {
    const params = { page, pageSize };
    if (keyword) params.keyword = keyword;
    if (extra.categoryId !== "" && extra.categoryId != null) params.categoryId = extra.categoryId;
    // 价格区间：前端输入「元」，转「分」后传（空串/非法不传）
    const minCents = yuanToCents(extra.minPrice);
    const maxCents = yuanToCents(extra.maxPrice);
    if (minCents != null) params.minPrice = minCents;
    if (maxCents != null) params.maxPrice = maxCents;
    if (extra.sort && extra.sort !== "created_desc") params.sort = extra.sort;
    return request.get("/products", { params });
}

function yuanToCents(val) {
    if (val === "" || val == null) return null;
    const n = Number(val);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.round(n * 100);
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