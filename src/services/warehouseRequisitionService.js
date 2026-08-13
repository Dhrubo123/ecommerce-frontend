import api from './api'
export const createWarehouseRequisition=async data=>{const r=await api.post('/admin/warehouse-requisitions',data);return r.data?.data??r.data}
export const getWarehouseRequisitions=async(params={})=>{const r=await api.get('/admin/warehouse-requisitions',{params});const d=r.data?.data??r.data;return Array.isArray(d)?d:(d.requisitions??d.items??[])}
