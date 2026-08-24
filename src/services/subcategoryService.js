import api from './api'

// Live subcategory API endpoints:
// GET /admin/subcategories | POST /admin/subcategories | GET /admin/subcategories/:id
// PATCH /admin/subcategories/:id | DELETE /admin/subcategories/:id

const unwrap = (response) => response.data?.data ?? response.data

const toSubcategoryUi = (subcategory) => ({
  ...subcategory,
  image: subcategory.image ?? '',
  status: (subcategory.isActive ?? (subcategory.status === 'active')) ? 'active' : 'inactive',
  categoryId: subcategory.categoryId ?? subcategory.categoryIds?.[0] ?? subcategory.category?.id ?? subcategory.categories?.[0]?.id ?? '',
  categoryIds: subcategory.categoryIds ?? (subcategory.categoryId ? [subcategory.categoryId] : []),
  categoryName: subcategory.categoryName ?? subcategory.category?.name ?? subcategory.categories?.[0]?.name ?? '',
  description: subcategory.description ?? '',
  sortOrder: subcategory.sortOrder ?? 0,
  productCount: subcategory.productCount ?? 0,
})

// Exact multipart payload accepted by the backend:
// categoryIds, name, slug, image, description, isActive.
const toSubcategoryPayload = (data) => {
  const payload = new FormData()
  const categoryIds = data.categoryIds?.length
    ? data.categoryIds.map(Number)
    : [Number(data.categoryId)]

  payload.append('categoryIds', JSON.stringify(categoryIds))
  payload.append('name', data.name.trim())
  payload.append('slug', data.slug.trim())
  payload.append('description', data.description?.trim() ?? '')
  // The API receives multipart fields as text and expects "true" or "false".
  const isActive = data.isActive ?? data.status === 'active'
  payload.append('isActive', isActive ? 'true' : 'false')
  if (data.image instanceof File) payload.append('image', data.image)

  return payload
}

export async function getSubcategories(params = {}) {
  const response = await api.get('/admin/subcategories', { params })
  const data = unwrap(response)
  const subcategories = Array.isArray(data) ? data : (data.subcategories ?? data.items ?? [])
  return subcategories.map(toSubcategoryUi)
}

export async function getSubcategory(id) {
  const response = await api.get(`/admin/subcategories/${id}`)
  return toSubcategoryUi(unwrap(response))
}

export async function createSubcategory(data) {
  const response = await api.post('/admin/subcategories', toSubcategoryPayload(data))
  return toSubcategoryUi(unwrap(response))
}

export async function updateSubcategory(id, data) {
  const response = await api.patch(`/admin/subcategories/${id}`, toSubcategoryPayload(data))
  return toSubcategoryUi(unwrap(response))
}

export async function deleteSubcategory(id) {
  await api.delete(`/admin/subcategories/${id}`)
  return true
}

export const updateSubcategoryStatus = (id, status) => api.patch(`/admin/subcategories/${id}`, { isActive: status === 'active' })
export const bulkUpdateStatus = (ids, status) => Promise.all(ids.map((id) => updateSubcategoryStatus(id, status)))
export const bulkDeleteSubcategories = (ids) => Promise.all(ids.map((id) => deleteSubcategory(id)))
