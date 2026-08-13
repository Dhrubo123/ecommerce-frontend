import api from './api'

// Dashboard API: GET /admin/dashboard
// The backend may return the data directly or inside a `data` property.
export const getDashboard = async () => {
  const response = await api.get('/admin/dashboard')
  return response.data?.data ?? response.data ?? {}
}
