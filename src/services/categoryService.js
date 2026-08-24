import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const asBoolean = (value, fallback = true) => value === undefined || value === null ? fallback : value === true || value === 'true' || value === 1 || value === '1'
const toUi = (category) => ({
  ...category,
  image: category.image ?? category.imageUrl ?? '',
  status: (category.isActive ?? category.is_active ?? category.status === 'active') ? 'active' : 'inactive',
  isActive: Boolean(category.isActive ?? category.is_active ?? category.status === 'active'),
  description: category.description ?? '',
  sortOrder: category.sortOrder ?? category.order ?? 0,
  productCount: category.productCount ?? 0,
})
const asList = (data) => (Array.isArray(data) ? data : (data.categories ?? data.items ?? [])).map(toUi)
const toPayload = (category) => {
  const payload = new FormData()
  payload.append('name', String(category.name ?? '').trim())
  payload.append('slug', String(category.slug ?? '').trim())
  payload.append('isActive', asBoolean(category.isActive, category.status === 'active') ? 'true' : 'false')
  payload.append('order', String(Number(category.order ?? category.sortOrder ?? 0)))
  payload.append('description', String(category.description ?? '').trim())
  if (category.image instanceof File) payload.append('image', category.image)
  if (category.banner instanceof File) payload.append('banner', category.banner)
  return payload
}

// Live admin category API. This is also the source of truth for parent-category IDs.
export const getCategories = async (params = {}) => asList(unwrap(await api.get('/admin/categories', { params })))
export const getCategory = async (id) => toUi(unwrap(await api.get(`/admin/categories/${id}`)))
export const createCategory = async (data) => toUi(unwrap(await api.post('/admin/categories', toPayload(data))))
export const updateCategory = async (id, data) => toUi(unwrap(await api.patch(`/admin/categories/${id}`, toPayload(data))))
export const deleteCategory = async (id) => { await api.delete(`/admin/categories/${id}`); return true }
export const updateCategoryStatus = (id, status) => api.patch(`/admin/categories/${id}`, { isActive: status === 'active' })
export const bulkUpdateStatus = (ids, status) => Promise.all(ids.map((id) => updateCategoryStatus(id, status)))
export const bulkDeleteCategories = (ids) => Promise.all(ids.map((id) => deleteCategory(id)))
