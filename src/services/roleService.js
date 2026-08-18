import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const asList = (data) => Array.isArray(data) ? data : (data.roles ?? data.items ?? [])

// Roles API: GET/POST /admin/roles, GET/PATCH/DELETE /admin/roles/:id.
// Create payload: { name, slug, description }
export const getRoles = async (params = {}) => asList(unwrap(await api.get('/admin/roles', { params })))
export const getRole = async (id) => unwrap(await api.get(`/admin/roles/${id}`))
export const createRole = async (role) => unwrap(await api.post('/admin/roles', { name: role.name, slug: role.slug, description: role.description }))
export const updateRole = async (id, role) => unwrap(await api.patch(`/admin/roles/${id}`, { name: role.name, slug: role.slug, description: role.description }))
export const deleteRole = async (id) => { await api.delete(`/admin/roles/${id}`); return true }
export const getPermissions = async () => asList(unwrap(await api.get('/admin/roles/permissions')))
// Module assignment API: GET /admin/roles/modules, POST /admin/roles/:id/modules
export const getRoleModules = async () => asList(unwrap(await api.get('/admin/roles/modules')))
export const assignRoleModules = async (roleId, moduleIds) => unwrap(await api.post(`/admin/roles/${roleId}/modules`, { moduleIds }))
// User role assignment API: PUT /admin/roles/users/:userId
export const assignUserRoles = async (userId, roleIds) => unwrap(await api.put(`/admin/roles/users/${userId}`, { roleIds }))
// User access review API: GET /admin/roles/users/:userId/permissions
export const getUserPermissions = async (userId) => asList(unwrap(await api.get(`/admin/roles/users/${userId}/permissions`)))
