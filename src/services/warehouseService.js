import api from './api'
const unwrap = (response) => response.data?.data ?? response.data
const toUi = (warehouse) => ({ ...warehouse, isActive: warehouse.isActive ?? true })
const toPayload = (warehouse) => ({ name: warehouse.name, code: warehouse.code, phone: warehouse.phone, address: warehouse.address, isActive: warehouse.isActive })
export async function getWarehouses(params = {}) { const response = await api.get('/admin/warehouses', { params }); const data = unwrap(response); return (Array.isArray(data) ? data : (data.warehouses ?? data.items ?? [])).map(toUi) }
export async function getWarehouse(id) { return toUi(unwrap(await api.get(`/admin/warehouses/${id}`))) }
export async function createWarehouse(data) { return toUi(unwrap(await api.post('/admin/warehouses', toPayload(data)))) }
export async function updateWarehouse(id, data) { return toUi(unwrap(await api.patch(`/admin/warehouses/${id}`, toPayload(data)))) }
export async function deleteWarehouse(id) { await api.delete(`/admin/warehouses/${id}`); return true }
