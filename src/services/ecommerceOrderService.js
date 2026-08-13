import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Ecommerce Order API: GET/POST /admin/ecommerce-orders
export const getEcommerceOrders = async (params = {}) => {
  const data = unwrap(await api.get('/admin/ecommerce-orders', { params }))
  return Array.isArray(data) ? data : (data.orders ?? data.ecommerceOrders ?? data.items ?? [])
}

export const createEcommerceOrder = async (data) => unwrap(await api.post('/admin/ecommerce-orders', data))
