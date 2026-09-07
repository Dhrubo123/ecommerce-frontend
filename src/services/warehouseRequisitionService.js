import api from './api'
export const createWarehouseRequisition=async data=>{const r=await api.post('/admin/warehouse-requisitions',data);return r.data?.data??r.data}
export const getWarehouseRequisitions=async(params={})=>{const r=await api.get('/admin/warehouse-requisitions',{params});const d=r.data?.data??r.data;return Array.isArray(d)?d:(d.requisitions??d.items??[])}
export const getWarehouseRequisition=async id=>{const r=await api.get(`/admin/warehouse-requisitions/${id}`);const d=r.data?.data??r.data;return d.requisition??d}
export const updateWarehouseRequisition=async(id,data)=>{const r=await api.patch(`/admin/warehouse-requisitions/${id}`,data);return r.data?.data??r.data}
export const approveWarehouseRequisition=async id=>{const r=await api.patch(`/admin/warehouse-requisitions/${id}/approve`);return r.data?.data??r.data}
export const deleteWarehouseRequisition=async id=>{await api.delete(`/admin/warehouse-requisitions/${id}`);return true}
