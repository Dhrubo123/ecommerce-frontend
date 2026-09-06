import api from './api'

export const getReport = async (name, params = {}) => {
  const query = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
  const response = await api.get(`/admin/reports/${name}`, { params: query })
  if (response.data?.success === false) throw new Error(response.data.message || 'Unable to load report.')
  return response.data
}
