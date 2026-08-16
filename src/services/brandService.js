import api from './api'

// Live Brand API: GET/POST /brands, GET/PATCH/DELETE /brands/:id
const unwrap = (response) => response.data?.data ?? response.data
const toUi = (
    






    
) => ({ ...brand, logoUrl: brand.logoUrl ?? '', description: brand.description ?? '', status: (brand.isActive ?? (brand.status === 'active')) ? 'active' : 'inactive' })
const toPayload = (brand) => ({ name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl ?? '', description: brand.description ?? '', isActive: brand.isActive ?? brand.status === 'active' })

export async function getBrands(params = {}) { const response = await api.get('/brands', { params }); const data = unwrap(response); return (Array.isArray(data) ? data : (data.brands ?? data.items ?? [])).map(toUi) }
export async function getBrand(id) { return toUi(unwrap(await api.get(`/brands/${id}`))) }
export async function createBrand(brand) { return toUi(unwrap(await api.post('/brands', toPayload(brand)))) }
export async function updateBrand(id, brand) { return toUi(unwrap(await api.patch(`/brands/${id}`, toPayload(brand)))) }
export async function deleteBrand(id) { await api.delete(`/brands/${id}`); return true }
