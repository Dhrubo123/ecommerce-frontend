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
