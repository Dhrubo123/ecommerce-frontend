import api from './api'
const unwrap = (response) => response.data?.data ?? response.data
const toUi = (supplier) => ({ ...supplier, isActive: supplier.isActive ?? true })
const toPayload = (supplier) => {
  const payload = new FormData()
  payload.append('name', supplier.name.trim())
  payload.append('phone', supplier.phone.trim())
  payload.append('email', supplier.email.trim())
  payload.append('address', supplier.address.trim())
  payload.append('isActive', String(Boolean(supplier.isActive)))
  if (supplier.image instanceof File) payload.append('image', supplier.image)
  return payload
}
export async function getSuppliers(params = {}) { const response = await api.get('/admin/suppliers', { params }); const data = unwrap(response); return (Array.isArray(data) ? data : (data.suppliers ?? data.items ?? [])).map(toUi) }
export async function getSupplier(id) { return toUi(unwrap(await api.get(`/admin/suppliers/${id}`))) }
export async function createSupplier(data) { return toUi(unwrap(await api.post('/admin/suppliers', toPayload(data)))) }
export async function updateSupplier(id, data) { return toUi(unwrap(await api.patch(`/admin/suppliers/${id}`, toPayload(data)))) }
export async function deleteSupplier(id) { await api.delete(`/admin/suppliers/${id}`); return true }
