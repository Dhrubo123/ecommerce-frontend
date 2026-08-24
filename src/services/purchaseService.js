import api from './api'
export const createPurchase = async (data) => { const response = await api.post('/admin/purchases', data); return response.data?.data ?? response.data }
export const getPurchases = async (params = {}) => { const response = await api.get('/admin/purchases', { params }); const data = response.data?.data ?? response.data; return Array.isArray(data) ? data : (data.purchases ?? data.items ?? []) }
export const getPurchase = async (id) => { const response = await api.get(`/admin/purchases/${id}`); return response.data?.data ?? response.data }
export const updatePurchase = async (id, data) => { const response = await api.patch(`/admin/purchases/${id}`, data); return response.data?.data ?? response.data }
export const deletePurchase = async (id) => { await api.delete(`/admin/purchases/${id}`); return true }
