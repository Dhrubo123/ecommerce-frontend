import api from './api'

// Stock report API: GET /admin/stock-reports
export const getStockReports = async (params = {}) => {
  const response = await api.get('/admin/stock-reports', { params })
  const data = response.data?.data ?? response.data
  return Array.isArray(data) ? data : (data.stockReports ?? data.reports ?? data.items ?? [])
}
