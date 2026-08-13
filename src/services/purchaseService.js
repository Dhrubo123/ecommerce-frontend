import api from './api'
export const createPurchase = async (data) => { const response = await api.post('/admin/purchases', data); return response.data?.data ?? response.data }
export const getPurchases = async (params = {}) => { const response = await api.get('/admin/purchases', { params }); const data = response.data?.data ?? response.data; return Array.isArray(data) ? data : (data.purchases ?? data.items ?? []) }
