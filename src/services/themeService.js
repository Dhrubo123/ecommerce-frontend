import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

const asList = (value) => Array.isArray(value) ? value : (value?.themes ?? value?.items ?? value?.data ?? [])

export const normaliseTheme = (theme) => ({
  ...theme,
  thumbnail: theme.thumbnail ?? theme.previewImage ?? '',
  isActive: Boolean(theme.isActive),
  settings: theme.settings ?? {},
})

// Theme API: GET/POST /admin/themes and GET/PATCH/DELETE /admin/themes/:id
export async function getThemes() {
  return asList(unwrap(await api.get('/admin/themes'))).map(normaliseTheme)
}

export async function getTheme(id) {
  return normaliseTheme(unwrap(await api.get(`/admin/themes/${id}`)))
}

export async function createTheme(data) {
  return normaliseTheme(unwrap(await api.post('/admin/themes', data)))
}

export async function updateTheme(id, data) {
  return normaliseTheme(unwrap(await api.patch(`/admin/themes/${id}`, data)))
}

// Backend activation API: GET /admin/themes/:id/activate
export async function activateTheme(id) {
  return normaliseTheme(unwrap(await api.get(`/admin/themes/${id}/activate`)))
}

export async function deleteTheme(id) {
  await api.delete(`/admin/themes/${id}`)
  return true
}
