import api from './api'
const unwrap=r=>r.data?.data??r.data
export const getCustomers=async(params={})=>{const d=unwrap(await api.get('/admin/customers',{params}));return Array.isArray(d)?d:(d.customers??d.items??[])}
export const createCustomer=async(x)=>unwrap(await api.post('/admin/customers',{name:x.name,phone:x.phone,email:x.email,address:x.address,isActive:x.isActive}))
export const updateCustomer=async(id,x)=>unwrap(await api.patch(`/admin/customers/${id}`,{name:x.name,phone:x.phone,email:x.email,address:x.address,isActive:x.isActive}))
