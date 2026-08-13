import api from './api'
export const createPurchaseReturn = async (data) => { const response = await api.post('/admin/purchase-returns', data); return response.data?.data ?? response.data }
