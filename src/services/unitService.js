import api from './api'

// Live Unit API: GET/POST /admin/units and PATCH /admin/units/:id.
const unwrap = (response) => response.data?.data ?? response.data
const asBoolean = (value, fallback = true) => value === undefined || value === null ? fallback : value === true || value === 'true' || value === 1 || value === '1'
const toUi = (unit) => ({ ...unit, isActive: unit.isActive ?? true })
export async function getUnits(params = {}) { const response = await api.get('/admin/units', { params }); const data = unwrap(response); return (Array.isArray(data) ? data : (data.units ?? data.items ?? [])).map(toUi) }
const toPayload = (unit) => ({ name: String(unit.name ?? '').trim(), isActive: asBoolean(unit.isActive) })
export async function createUnit(unit) { return toUi(unwrap(await api.post('/admin/units', toPayload(unit), { headers: { 'Content-Type': 'application/json' } }))) }
export async function updateUnit(id, unit) { return toUi(unwrap(await api.patch(`/admin/units/${id}`, toPayload(unit), { headers: { 'Content-Type': 'application/json' } }))) }
