import api from './api'

const reportList = (data) => {
  if (Array.isArray(data)) return data
  for (const key of ['stockReports', 'reports', 'items', 'stocks', 'rows', 'data']) {
    if (Array.isArray(data?.[key])) return data[key]
  }
  return []
}

// Stock report API: GET /admin/stock-reports
export const getStockReports = async (params = {}) => {
  const response = await api.get('/admin/stock-reports', { params })
  return reportList(response.data?.data ?? response.data)
}
