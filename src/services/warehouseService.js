import api from './api'
const unwrap = (response) => response.data?.data ?? response.data
const toUi = (warehouse) => ({
  ...warehouse,
  // The API has returned both `id` and `warehouseId` in different modules.
  // Keep one predictable ID for every select control in the admin app.
  id: warehouse.id ?? warehouse.warehouseId ?? warehouse.warehouse_id ?? '',
  name: warehouse.name ?? warehouse.warehouseName ?? '',
  code: warehouse.code ?? warehouse.warehouseCode ?? '',
  phone: warehouse.phone ?? '',
  address: warehouse.address ?? '',
  isActive: Boolean(warehouse.isActive ?? warehouse.is_active ?? true),
})
const toPayload = (warehouse) => ({
  name: String(warehouse.name ?? '').trim(),
  code: String(warehouse.code ?? '').trim(),
  phone: String(warehouse.phone ?? '').trim(),
  address: String(warehouse.address ?? '').trim(),
  isActive: Boolean(warehouse.isActive),
})
export async function getWarehouses(params = {}) { const response = await api.get('/admin/warehouses', { params }); const data = unwrap(response); return (Array.isArray(data) ? data : (data.warehouses ?? data.items ?? [])).map(toUi) }
export async function getWarehouse(id) { return toUi(unwrap(await api.get(`/admin/warehouses/${id}`))) }
export async function createWarehouse(data) { return toUi(unwrap(await api.post('/admin/warehouses', toPayload(data)))) }
export async function updateWarehouse(id, data) { return toUi(unwrap(await api.patch(`/admin/warehouses/${id}`, toPayload(data)))) }
export async function deleteWarehouse(id) { await api.delete(`/admin/warehouses/${id}`); return true }
