import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Sales Return API: GET/POST /admin/sales-returns
export const getSalesReturns = async (params = {}) => {
  const data = unwrap(await api.get('/admin/sales-returns', { params }))
  return Array.isArray(data) ? data : (data.salesReturns ?? data.returns ?? data.items ?? [])
}

export const createSalesReturn = async (data) => unwrap(await api.post('/admin/sales-returns', data))
