import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

const employeePayload = (employee, includePassword = true) => {
  const payload = {
    firstName: employee.firstName?.trim(),
    lastName: employee.lastName?.trim(),
    phone: employee.phone?.trim(),
    gender: employee.gender,
    email: employee.email?.trim(),
    role: employee.role?.trim(),
    isActive: Boolean(employee.isActive),
  }

  if (includePassword && employee.password) payload.password = employee.password
  return payload
}

// Employee API: GET/POST/PATCH/DELETE /admin/employees
export const getEmployees = async (params = {}) => {
  const data = unwrap(await api.get('/admin/employees', { params }))
  return Array.isArray(data) ? data : (data.employees ?? data.items ?? [])
}

export const getEmployee = async (id) => unwrap(await api.get(`/admin/employees/${id}`))

export const createEmployee = async (employee) => unwrap(await api.post('/admin/employees', employeePayload(employee)))

export const updateEmployee = async (id, employee) => unwrap(await api.patch(`/admin/employees/${id}`, employeePayload(employee, Boolean(employee.password))))

export const deleteEmployee = async (id) => unwrap(await api.delete(`/admin/employees/${id}`))
