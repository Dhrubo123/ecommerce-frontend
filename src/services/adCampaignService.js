import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const toUi = (campaign) => ({ ...campaign, image: campaign.image ?? campaign.imageUrl ?? '', isActive: campaign.isActive ?? true })

const toPayload = (campaign) => {
  const payload = new FormData()
  payload.append('title', campaign.title.trim())
  payload.append('isActive', String(Boolean(campaign.isActive)))
  if (campaign.image instanceof File) payload.append('image', campaign.image)
  return payload
}

// Ad Campaign API: GET/POST /admin/ad-campaigns and GET/PATCH/DELETE /admin/ad-campaigns/:id
export async function getAdCampaigns(params = {}) {
  const data = unwrap(await api.get('/admin/ad-campaigns', { params }))
  return (Array.isArray(data) ? data : (data.adCampaigns ?? data.items ?? [])).map(toUi)
}
export async function getAdCampaign(id) { return toUi(unwrap(await api.get(`/admin/ad-campaigns/${id}`))) }
export async function createAdCampaign(data) { return toUi(unwrap(await api.post('/admin/ad-campaigns', toPayload(data)))) }
export async function updateAdCampaign(id, data) { return toUi(unwrap(await api.patch(`/admin/ad-campaigns/${id}`, toPayload(data)))) }
export async function deleteAdCampaign(id) { await api.delete(`/admin/ad-campaigns/${id}`); return true }
