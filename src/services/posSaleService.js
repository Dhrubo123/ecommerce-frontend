import api from './api'
export const createPosSale=async data=>{const r=await api.post('/admin/pos-sales',data);return r.data?.data??r.data}
export const getPosSales=async(params={})=>{const r=await api.get('/admin/pos-sales',{params});const d=r.data?.data??r.data;return Array.isArray(d)?d:(d.sales??d.items??[])}
export const getPosDrafts=async()=>{const r=await api.get('/admin/pos-sales/drafts');const d=r.data?.data??r.data;return Array.isArray(d)?d:(d.drafts??d.items??[])}
export const getPosDraft=async id=>{const r=await api.get(`/admin/pos-sales/drafts/${id}`);return r.data?.data??r.data}
export const createPosDraft=async data=>{const r=await api.post('/admin/pos-sales/drafts',data);return r.data?.data??r.data}
export const updatePosDraft=async(id,data)=>{const r=await api.patch(`/admin/pos-sales/drafts/${id}`,data);return r.data?.data??r.data}
export const deletePosDraft=async id=>{await api.delete(`/admin/pos-sales/drafts/${id}`);return true}
