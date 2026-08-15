import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const toUi = (customer) => ({
  ...customer,
  firstName: customer.firstName ?? customer.name?.split(' ')[0] ?? '',
  lastName: customer.lastName ?? customer.name?.split(' ').slice(1).join(' ') ?? '',
  dateOfBirth: customer.dateOfBirth?.slice?.(0, 10) ?? customer.dateOfBirth ?? '',
  image: customer.image ?? customer.imageUrl ?? '',
  isActive: customer.isActive ?? true,
})

const toPayload = (customer) => {
  const payload = new FormData()
  payload.append('firstName', customer.firstName.trim())
  payload.append('lastName', customer.lastName.trim())
  payload.append('phone', customer.phone.trim())
  payload.append('email', customer.email.trim())
  payload.append('gender', customer.gender)
  payload.append('dateOfBirth', customer.dateOfBirth)
  payload.append('isActive', String(Boolean(customer.isActive)))
  if (customer.password) payload.append('password', customer.password)
  if (customer.image instanceof File) payload.append('image', customer.image)
  return payload
}

// Customer API: GET/POST /admin/customers and GET/PATCH/DELETE /admin/customers/:id
export async function getCustomers(params = {}) {
  const response = await api.get('/admin/customers', { params })
  const data = unwrap(response)
  return (Array.isArray(data) ? data : (data.customers ?? data.items ?? [])).map(toUi)
}
export async function getCustomer(id) { return toUi(unwrap(await api.get(`/admin/customers/${id}`))) }
export async function createCustomer(data) { return toUi(unwrap(await api.post('/admin/customers', toPayload(data)))) }
export async function updateCustomer(id, data) { return toUi(unwrap(await api.patch(`/admin/customers/${id}`, toPayload(data)))) }
export async function deleteCustomer(id) { await api.delete(`/admin/customers/${id}`); return true }
