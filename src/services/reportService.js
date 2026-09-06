import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

export const getReport = async (name, params = {}) => {
  const query = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
  return unwrap(await api.get(`/admin/reports/${name}`, { params: query }))
}
