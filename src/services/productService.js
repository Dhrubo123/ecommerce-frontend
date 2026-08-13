import api from './api'

// Live Product API: GET/POST /admin/products, GET/PATCH/DELETE /admin/products/:id.
const unwrap = (response) => response.data?.data ?? response.data
const toUi = (product) => ({ ...product, image: product.thumbnailImages?.[0] ?? product.thumbnailImage ?? product.image ?? '', category: product.category?.name ?? product.categoryName ?? '', shop: product.shop?.name ?? product.shopName ?? '', brand: product.brand?.name ?? product.brandName ?? '', salePrice: product.sellingPrice ?? product.salePrice ?? 0, price: product.sellingPrice ?? product.price ?? 0, stock: product.stockQuantity ?? product.stock ?? 0, status: (product.isActive ?? true) ? 'active' : 'inactive', approval: product.approvalStatus ?? 'approved', description: product.description ?? '', variants: product.variants ?? [] })
const append = (form, key, value) => { if (value !== undefined && value !== null && value !== '') form.append(key, value) }
const idsFrom = (values = []) => values.map((value) => Number(value?.id ?? value)).filter(Number.isFinite)
const toFormData = (product) => { const form = new FormData(); ['name','slug','shortDescription','description','categoryId','brandId','unitId','sku','weightKg','buyingPrice','sellingPrice','discountType','discount','stockQuantity','metaTitle','metaDescription','metaKeywords'].forEach((key) => append(form, key, product[key])); append(form, 'subcategoryIds', JSON.stringify(idsFrom(product.subcategoryIds))); append(form, 'colorIds', JSON.stringify(idsFrom(product.colorIds))); append(form, 'sizes', JSON.stringify(idsFrom(product.sizes))); form.append('isActive', String(product.isActive ?? product.status === 'active')); Array.from(product.thumbnailImages ?? []).filter((file) => file instanceof File).forEach((file) => form.append('thumbnailImages', file)); Array.from(product.additionalImages ?? []).filter((file) => file instanceof File).forEach((file) => form.append('additionalImages', file)); return form }
export async function getProducts(params = {}) { const response = await api.get('/admin/products', { params }); const data = unwrap(response); return (Array.isArray(data) ? data : (data.products ?? data.items ?? [])).map(toUi) }
export async function getProduct(id) { return toUi(unwrap(await api.get(`/admin/products/${id}`))) }
export async function createProduct(product) { return toUi(unwrap(await api.post('/admin/products', toFormData(product)))) }
export async function updateProduct(id, product) { return toUi(unwrap(await api.patch(`/admin/products/${id}`, toFormData(product)))) }
export async function deleteProduct(id) { await api.delete(`/admin/products/${id}`); return true }
export const updateProductStatus = (id, status) => api.patch(`/admin/products/${id}`, { isActive: status === 'active' })
export const bulkUpdateProductStatus = (ids, status) => Promise.all(ids.map((id) => updateProductStatus(id, status)))
export const bulkDeleteProducts = (ids) => Promise.all(ids.map((id) => deleteProduct(id)))
