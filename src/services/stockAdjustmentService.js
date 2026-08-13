import api from './api'
export const createStockAdjustment=async data=>{const r=await api.post('/admin/stock-adjustments',data);return r.data?.data??r.data}
export const getStockAdjustments=async(params={})=>{const r=await api.get('/admin/stock-adjustments',{params});const d=r.data?.data??r.data;return Array.isArray(d)?d:(d.adjustments??d.items??[])}
