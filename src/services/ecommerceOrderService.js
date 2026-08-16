import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Order API: GET/POST /admin/orders
// POST payload matches the backend contract exactly:
// { warehouseId, customer: { name, phone, email, address }, paymentMethod,
//   shippingCost, discount, note, items: [{ productId, quantity }] }
export const getEcommerceOrders = async (params = {}) => {
  const data = unwrap(await api.get('/admin/orders', { params }))
  return Array.isArray(data) ? data : (data.orders ?? data.items ?? [])
}

export const createEcommerceOrder = async (data) => unwrap(await api.post('/admin/orders', data))

export const getEcommerceOrder = async (id) => unwrap(await api.get(`/admin/orders/${id}`))
export const updateOrderStatus = async (id, status) => unwrap(await api.patch(`/admin/orders/${id}/status`, { status }))
export const updateOrderPaymentStatus = async (id, paymentStatus) => unwrap(await api.patch(`/admin/orders/${id}/payment-status`, { paymentStatus }))
// Confirm an order by allocating its items to warehouses.
export const confirmOrder = async (id, allocations) => unwrap(await api.patch(`/admin/orders/${id}/confirm`, { allocations }))
