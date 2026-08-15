import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

const toUi = (banner) => ({
  ...banner,
  image: banner.image ?? banner.imageUrl ?? '',
  isOwnShop: Boolean(banner.isOwnShop),
  isActive: banner.isActive ?? true,
})

const toPayload = (banner) => {
  const payload = new FormData()
  payload.append('title', banner.title.trim())
  payload.append('isOwnShop', String(Boolean(banner.isOwnShop)))
  payload.append('isActive', String(Boolean(banner.isActive)))
  if (banner.image instanceof File) payload.append('image', banner.image)
  return payload
}

// Banner API: GET/POST /admin/banners and GET/PATCH/DELETE /admin/banners/:id
export async function getBanners(params = {}) {
  const response = await api.get('/admin/banners', { params })
  const data = unwrap(response)
  const banners = Array.isArray(data) ? data : (data.banners ?? data.items ?? [])
  return banners.map(toUi)
}

export async function getBanner(id) {
  return toUi(unwrap(await api.get(`/admin/banners/${id}`)))
}

export async function createBanner(data) {
  return toUi(unwrap(await api.post('/admin/banners', toPayload(data))) )
}

export async function updateBanner(id, data) {
  return toUi(unwrap(await api.patch(`/admin/banners/${id}`, toPayload(data))) )
}

export async function deleteBanner(id) {
  await api.delete(`/admin/banners/${id}`)
  return true
}
