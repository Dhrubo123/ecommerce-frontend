import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const asList = (value) => Array.isArray(value) ? value : (value?.pages ?? value?.items ?? value?.data ?? [])

const normalisePage = (page) => ({
  ...page,
  title: page.title ?? page.name ?? '',
  slug: page.slug ?? '',
  content: page.content ?? page.description ?? '',
  seoTitle: page.seoTitle ?? '',
  seoDescription: page.seoDescription ?? '',
  isActive: page.isActive ?? page.status === 'active' ?? true,
})

// CMS Page API: GET/POST /admin/cms/pages, GET/PATCH/DELETE /admin/cms/pages/:id
export async function getCmsPages(params = {}) {
  return asList(unwrap(await api.get('/admin/cms/pages', { params }))).map(normalisePage)
}

export async function getCmsPage(id) {
  return normalisePage(unwrap(await api.get(`/admin/cms/pages/${id}`)))
}

export async function createCmsPage(data) {
  return normalisePage(unwrap(await api.post('/admin/cms/pages', data)))
}

export async function updateCmsPage(id, data) {
  return normalisePage(unwrap(await api.patch(`/admin/cms/pages/${id}`, data)))
}

export async function deleteCmsPage(id) {
  await api.delete(`/admin/cms/pages/${id}`)
  return true
}
