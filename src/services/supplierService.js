import api from './api'
const unwrap = (response) => response.data?.data ?? response.data
const toUi = (supplier) => ({ ...supplier, isActive: supplier.isActive ?? true })
const toPayload = (supplier) => ({ name: supplier.name, contactPerson: supplier.contactPerson, phone: supplier.phone, email: supplier.email, address: supplier.address, isActive: supplier.isActive })
export async function getSuppliers(params = {}) { const response = await api.get('/admin/suppliers', { params }); const data = unwrap(response); return (Array.isArray(data) ? data : (data.suppliers ?? data.items ?? [])).map(toUi) }
export async function getSupplier(id) { return toUi(unwrap(await api.get(`/admin/suppliers/${id}`))) }
export async function createSupplier(data) { return toUi(unwrap(await api.post('/admin/suppliers', toPayload(data)))) }
export async function updateSupplier(id, data) { return toUi(unwrap(await api.patch(`/admin/suppliers/${id}`, toPayload(data)))) }
export async function deleteSupplier(id) { await api.delete(`/admin/suppliers/${id}`); return true }
