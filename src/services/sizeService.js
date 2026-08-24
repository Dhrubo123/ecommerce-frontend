import api from './api'

// Live Size API: GET/POST /admin/sizes and PATCH /admin/sizes/:id (add DELETE when available).
const unwrap = (response) => response.data?.data ?? response.data
const asBoolean = (value, fallback = true) => value === undefined || value === null ? fallback : value === true || value === 'true' || value === 1 || value === '1'
const toUi = (size) => ({ ...size, isActive: size.isActive ?? true })
export async function getSizes(params = {}) { const response = await api.get('/admin/sizes', { params }); const data = unwrap(response); return (Array.isArray(data) ? data : (data.sizes ?? data.items ?? [])).map(toUi) }
export async function createSize(size) { return toUi(unwrap(await api.post('/admin/sizes', { name: size.name, isActive: asBoolean(size.isActive) }))) }
export async function updateSize(id, size) { return toUi(unwrap(await api.patch(`/admin/sizes/${id}`, { name: size.name, isActive: asBoolean(size.isActive) }))) }
