import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Chart of Accounts API: GET /admin/accounts/coa
export const getChartOfAccounts = async () => unwrap(await api.get('/admin/accounts/coa'))

// Create account head API: POST /admin/accounts/coa
export const createAccountHead = async ({ parentId, headName, isActive }) => unwrap(await api.post('/admin/accounts/coa', { parentId: Number(parentId), headName, isActive: Boolean(isActive) }))
