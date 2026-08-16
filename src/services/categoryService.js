import mockCategories from '../data/mockCategories'

// TODO backend endpoints: GET /categories?page=1&search=&status= | POST /categories | GET /categories/:id
// TODO: PATCH /categories/:id | DELETE /categories/:id | PATCH /categories/:id/status
// TODO: POST /categories/bulk-status | POST /categories/bulk-delete | POST /categories/:id/image
let categories = [...mockCategories]
const result = (value) => new Promise((resolve) => window.setTimeout(() => resolve(value), 350))
export const getCategories = (params = {}) => result(categories.filter((item) => (!params.search || `${item.name} ${item.slug}`.toLowerCase().includes(params.search.toLowerCase())) && (!params.status || params.status === 'all' || item.status === params.status)))
export const getCategory = (id) => result(categories.find((item) => item.id === Number(id)))
export const createCa tegory = (data) => { const item = { ...data, id: Date.now(), productCount: 0, createdAt: '2026-08-10', updatedAt: '2026-08-10' }; categories = [item, ...categories]; return result(item) }
export const updateCategory = (id, data) => { categories = categories.map((item) => item.id === Number(id) ? { ...item, ...data, updatedAt: '2026-08-10' } : item); return result(categories.find((item) => item.id === Number(id))) }
export const deleteCategory = (id) => { categories = categories.filter((item) => item.id !== Number(id)); return result(true) }
export const updateCategoryStatus = (id, status) => updateCategory(id, { status })
export const bulkUpdateStatus = (ids, status) => { categories = categories.map((item) => ids.includes(item.id) ? { ...item, status } : item); return result(true) }
export const bulkDeleteCategories = (ids) => { categories = categories.filter((item) => !ids.includes(item.id)); return result(true) }
