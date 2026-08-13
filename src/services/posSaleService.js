import api from './api'
export const createPosSale=async data=>{const r=await api.post('/admin/pos-sales',data);return r.data?.data??r.data}
export const getPosSales=async(params={})=>{const r=await api.get('/admin/pos-sales',{params});const d=r.data?.data??r.data;return Array.isArray(d)?d:(d.sales??d.items??[])}
