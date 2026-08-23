import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const asList = (value) => Array.isArray(value) ? value : (value?.menus ?? value?.items ?? value?.data ?? [])
const normalise = (item) => ({ ...item, label: item.label ?? item.name ?? '', url: item.url ?? '', location: item.location ?? 'header', pageId: item.pageId ?? null, parentId: item.parentId ?? null, sortOrder: Number(item.sortOrder ?? 0), openInNewTab: Boolean(item.openInNewTab), isActive: item.isActive ?? true })

// CMS menu API: GET/POST /admin/cms/menus, GET/PATCH/DELETE /admin/cms/menus/:id
export const getCmsMenus = async (params = {}) => asList(unwrap(await api.get('/admin/cms/menus', { params }))).map(normalise)
export const getCmsMenu = async (id) => normalise(unwrap(await api.get(`/admin/cms/menus/${id}`)))
export const createCmsMenu = async (data) => normalise(unwrap(await api.post('/admin/cms/menus', data)))
export const updateCmsMenu = async (id, data) => normalise(unwrap(await api.patch(`/admin/cms/menus/${id}`, data)))
export const deleteCmsMenu = async (id) => { await api.delete(`/admin/cms/menus/${id}`); return true }
