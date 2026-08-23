import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const list = (value) => Array.isArray(value) ? value : (value?.sections ?? value?.items ?? value?.data ?? [])

const normalise = (item) => ({
  ...item,
  sectionType: item.sectionType ?? item.type ?? 'product_grid',
  title: item.title ?? '',
  settings: item.settings ?? {},
  sortOrder: Number(item.sortOrder ?? 0),
  isActive: item.isActive ?? true,
})

// Confirmed API: GET and POST /admin/cms/pages/:pageId/sections
export async function getCmsSections(pageId) { return list(unwrap(await api.get(`/admin/cms/pages/${pageId}/sections`))).map(normalise) }
export async function createCmsSection(pageId, data) { return normalise(unwrap(await api.post(`/admin/cms/pages/${pageId}/sections`, data))) }
// Confirmed API: PATCH /admin/cms/sections/:id
export async function updateCmsSection(id, data) { return normalise(unwrap(await api.patch(`/admin/cms/sections/${id}`, data))) }
// Confirmed API: PATCH /admin/cms/pages/:pageId/sections/order
export async function reorderCmsSections(pageId, sections) { return unwrap(await api.patch(`/admin/cms/pages/${pageId}/sections/order`, { sections })) }
// Confirmed API: DELETE /admin/cms/sections/:id
export async function deleteCmsSection(id) { await api.delete(`/admin/cms/sections/${id}`); return true }
