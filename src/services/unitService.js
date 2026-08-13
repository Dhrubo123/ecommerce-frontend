import api from './api'

// Live Unit API: GET/POST /admin/units and PATCH /admin/units/:id.
const unwrap = (response) => response.data?.data ?? response.data
const toUi = (unit) => ({ ...unit, isActive: unit.isActive ?? true })
export async function getUnits(params = {}) { const response = await api.get('/admin/units', { params }); const data = unwrap(response); return (Array.isArray(data) ? data : (data.units ?? data.items ?? [])).map(toUi) }
export async function createUnit(unit) { return toUi(unwrap(await api.post('/admin/units', { name: unit.name, isActive: unit.isActive }))) }
export async function updateUnit(id, unit) { return toUi(unwrap(await api.patch(`/admin/units/${id}`, { name: unit.name, isActive: unit.isActive }))) }
