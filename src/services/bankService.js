import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const asList = (data) => Array.isArray(data) ? data : (data.banks ?? data.items ?? [])
const payload = (bank) => ({ name: bank.name, accountName: bank.accountName, accountNumber: bank.accountNumber, branch: bank.branch, routingNumber: bank.routingNumber, isActive: Boolean(bank.isActive) })

// Banks API: GET/POST /admin/accounts/banks, GET/PATCH/DELETE /admin/accounts/banks/:id
export const getBanks = async (params = {}) => asList(unwrap(await api.get('/admin/accounts/banks', { params })))
export const getBank = async (id) => unwrap(await api.get(`/admin/accounts/banks/${id}`))
export const createBank = async (bank) => unwrap(await api.post('/admin/accounts/banks', payload(bank)))
export const updateBank = async (id, bank) => unwrap(await api.patch(`/admin/accounts/banks/${id}`, payload(bank)))
export const deleteBank = async (id) => { await api.delete(`/admin/accounts/banks/${id}`); return true }
