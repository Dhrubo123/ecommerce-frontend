import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const asList = (data) => Array.isArray(data) ? data : (data.banks ?? data.items ?? [])
const payload = (bank) => ({ name: bank.name, accountName: bank.accountName, accountNumber: bank.accountNumber, branch: bank.branch, routingNumber: bank.routingNumber, isActive: Boolean(bank.isActive) })

// The deployed API exposes the plural list route, but not GET /banks/:id.
export const getBanks = async (params = {}) => asList(unwrap(await api.get('/admin/accounts/banks', { params })))
// The deployed accounts API exposes the bank list but not GET /banks/:id.
// Resolve the editable record from the supported list endpoint.
export const getBank = async (id) => {
  const bank = (await getBanks()).find((item) => String(item.id ?? item.bankId) === String(id))
  if (!bank) throw new Error('Bank record was not found.')
  return bank
}
export const createBank = async (bank) => unwrap(await api.post('/admin/accounts/banks', payload(bank)))
export const updateBank = async (id, bank) => unwrap(await api.patch(`/admin/accounts/banks/${id}`, payload(bank)))
export const deleteBank = async (id) => { await api.delete(`/admin/accounts/banks/${id}`); return true }
