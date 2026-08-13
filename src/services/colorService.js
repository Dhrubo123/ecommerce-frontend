import api from './api'

// Live Color API: GET/POST /admin/colors, GET/PATCH/DELETE /admin/colors/:id
const unwrap = (response) => response.data?.data ?? response.data
const toUi = (color) => ({ ...color, hex: color.code ?? color.hex ?? color.value ?? '#2563eb', isActive: color.isActive ?? true })
const toPayload = (color) => Object.fromEntries(Object.entries({ name: color.name, code: color.hex ?? color.code, isActive: color.isActive }).filter(([, value]) => value !== undefined))

export async function getColors(params = {}) {
  const response = await api.get('/admin/colors', { params })
  const data = unwrap(response)
  return (Array.isArray(data) ? data : (data.colors ?? data.items ?? [])).map(toUi)
}

export async function createColor(color) {
  return toUi(unwrap(await api.post('/admin/colors', toPayload(color))))
}

export async function updateColor(id, color) {
  return toUi(unwrap(await api.patch(`/admin/colors/${id}`, toPayload(color))))
}

export async function deleteColor(id) {
  await api.delete(`/admin/colors/${id}`)
  return true
}
