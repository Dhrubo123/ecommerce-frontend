import api from './api'

// Live category API endpoints:
// GET /admin/categories | POST /admin/categories | GET /admin/categories/:id
// PATCH /admin/categories/:id | DELETE /admin/categories/:id
// The UI keeps these helpers as its single data-access boundary.

const unwrap = (response) => response.data?.data ?? response.data

// Translate the backend Category model to the UI model used by the existing screens.
const toCategoryUi = (category) => ({
  ...category,
  image: category.image ?? category.imageUrl ?? '',
  banner: category.banner ?? category.bannerUrl ?? '',
  status: (category.isActive ?? (category.status === 'active')) ? 'active' : 'inactive',
  description: category.description ?? '',
  order: category.order ?? category.sortOrder ?? 0,
  sortOrder: category.order ?? category.sortOrder ?? 0,
  productCount: category.productCount ?? 0,
  subcategoryCount: category.subcategoryCount ?? 0,
})

// Exact multipart payload accepted by the backend:
// name, slug, isActive, image, banner, order, description.
// Do not set Content-Type manually; Axios adds the multipart boundary.
const toCategoryPayload = (data) => {
  const payload = new FormData()
  payload.append('name', data.name.trim())
  payload.append('slug', data.slug.trim())
  payload.append('isActive', (data.isActive ?? data.status === 'active') ? '1' : '0')
  payload.append('order', String(Number(data.order ?? data.sortOrder ?? 0)))
  payload.append('description', data.description?.trim() ?? '')

  if (data.image instanceof File) payload.append('image', data.image)
  if (data.banner instanceof File) payload.append('banner', data.banner)

  return payload
}

export async function getCategories(params = {}) {
  const response = await api.get('/admin/categories', { params })
  const data = unwrap(response)
  // Supports either a plain array or a common paginated API response shape.
  const categories = Array.isArray(data) ? data : (data.categories ?? data.items ?? [])
  return categories.map(toCategoryUi)
}

export async function getCategory(id) {
  const response = await api.get(`/admin/categories/${id}`)
  return toCategoryUi(unwrap(response))
}

export async function createCategory(data) {
  const response = await api.post('/admin/categories', toCategoryPayload(data))
  return toCategoryUi(unwrap(response))
}

export async function updateCategory(id, data) {
  const response = await api.patch(`/admin/categories/${id}`, toCategoryPayload(data))
  return toCategoryUi(unwrap(response))
}

export async function deleteCategory(id) {
  await api.delete(`/admin/categories/${id}`)
  return true
}

// The backend currently exposes PATCH /categories/:id, so status changes use it.
export const updateCategoryStatus = (id, status) => api.patch(`/admin/categories/${id}`, { isActive: status === 'active' })

// Replace these with bulk endpoints if they are added to the backend later.
export const bulkUpdateStatus = (ids, status) => Promise.all(ids.map((id) => updateCategoryStatus(id, status)))
export const bulkDeleteCategories = (ids) => Promise.all(ids.map((id) => deleteCategory(id)))
