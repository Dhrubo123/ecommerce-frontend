import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Warehouse Transfer API: GET/POST /admin/warehouse-transfers
export const getWarehouseTransfers = async (params = {}) => {
  const data = unwrap(await api.get('/admin/warehouse-transfers', { params }))
  return Array.isArray(data) ? data : (data.transfers ?? data.items ?? [])
}

export const createWarehouseTransfer = async (data) => unwrap(await api.post('/admin/warehouse-transfers', data))
