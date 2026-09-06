import api from './api'

export const getReport = async (name, params = {}) => {
  const query = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
  // `/admin/reports/stock` crashes when date filters are supplied. The
  // inventory endpoint supports the same stock filters and date range safely.
  const response = await api.get(name === 'stock' ? '/admin/stock-reports' : `/admin/reports/${name}`, { params: query })
  if (response.data?.success === false) throw new Error(response.data.message || 'Unable to load report.')
  return response.data
}
