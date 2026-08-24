import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const asBoolean = (value, fallback = true) => value === undefined || value === null ? fallback : value === true || value === 'true' || value === 1 || value === '1'
const toUi = (brand) => ({ ...brand, logoUrl: brand.image ?? brand.logoUrl ?? brand.logo ?? '', status: (brand.isActive ?? brand.is_active ?? brand.status === 'active') ? 'active' : 'inactive', isActive: Boolean(brand.isActive ?? brand.is_active ?? brand.status === 'active') })
const toPayload = (brand) => { const payload = new FormData(); payload.append('name', String(brand.name ?? '').trim()); payload.append('slug', String(brand.slug ?? '').trim()); payload.append('isActive', asBoolean(brand.isActive, brand.status === 'active') ? 'true' : 'false'); if (brand.image instanceof File) payload.append('image', brand.image); return payload }

// Live Brand API: GET/POST /admin/brands, GET/PATCH/DELETE /admin/brands/:id
export async function getBrands(params = {}) { const data = unwrap(await api.get('/admin/brands', { params })); return (Array.isArray(data) ? data : (data.brands ?? data.items ?? [])).map(toUi) }
export async function getBrand(id) { return toUi(unwrap(await api.get(`/admin/brands/${id}`))) }
export async function createBrand(brand) { return toUi(unwrap(await api.post('/admin/brands', toPayload(brand)))) }
export async function updateBrand(id, brand) { return toUi(unwrap(await api.patch(`/admin/brands/${id}`, toPayload(brand)))) }
export async function deleteBrand(id) { await api.delete(`/admin/brands/${id}`); return true }
