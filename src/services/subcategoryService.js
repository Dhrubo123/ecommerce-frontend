import api from './api'

// Live subcategory API endpoints:
// GET /admin/subcategories | POST /admin/subcategories | GET /admin/subcategories/:id
// PATCH /admin/subcategories/:id | DELETE /admin/subcategories/:id

const unwrap = (response) => response.data?.data ?? response.data

const toSubcategoryUi = (subcategory) => ({
  ...subcategory,
  image: subcategory.image ?? '',
  status: (subcategory.isActive ?? (subcategory.status === 'active')) ? 'active' : 'inactive',
  categoryName: subcategory.categoryName ?? subcategory.category?.name ?? '',
  description: subcategory.description ?? '',
  sortOrder: subcategory.sortOrder ?? 0,
  productCount: subcategory.productCount ?? 0,
})

// Exact payload accepted by the current backend.
const toSubcategoryPayload = (data) => ({
  categoryId: Number(data.categoryId),
  name: data.name,
  slug: data.slug,
  image: data.image ?? '',
  isActive: data.isActive ?? data.status === 'active',
})

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
