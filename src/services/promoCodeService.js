import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

const toUi = (code) => ({
  ...code,
  discountType: code.discountType ?? 'percent',
  discount: code.discount ?? 0,
  minimumOrderAmount: code.minimumOrderAmount ?? 0,
  singleUserLimit: code.singleUserLimit ?? 1,
  maximumDiscountAmount: code.maximumDiscountAmount ?? 0,
  startDate: code.startDate?.slice?.(0, 10) ?? code.startDate ?? '',
  endDate: code.endDate?.slice?.(0, 10) ?? code.endDate ?? '',
  startTime: code.startTime ?? '',
  endTime: code.endTime ?? '',
  isActive: code.isActive ?? true,
})

const toPayload = (code) => {
  const payload = new FormData()
  payload.append('code', code.code.trim().toUpperCase())
  payload.append('discountType', code.discountType)
  payload.append('discount', String(Number(code.discount)))
  payload.append('minimumOrderAmount', String(Number(code.minimumOrderAmount)))
  payload.append('singleUserLimit', String(Number(code.singleUserLimit)))
  payload.append('maximumDiscountAmount', String(Number(code.maximumDiscountAmount)))
  payload.append('startDate', code.startDate)
  payload.append('startTime', code.startTime)
  payload.append('endDate', code.endDate)
  payload.append('endTime', code.endTime)
  payload.append('isActive', String(Boolean(code.isActive)))
  return payload
}

// Promo Code API: GET/POST /admin/promo-codes and GET/PATCH/DELETE /admin/promo-codes/:id
export async function getPromoCodes(params = {}) {
  const response = await api.get('/admin/promo-codes', { params })
  const data = unwrap(response)
  const codes = Array.isArray(data) ? data : (data.promoCodes ?? data.items ?? [])
  return codes.map(toUi)
}

export async function getPromoCode(id) { return toUi(unwrap(await api.get(`/admin/promo-codes/${id}`))) }
export async function createPromoCode(data) { return toUi(unwrap(await api.post('/admin/promo-codes', toPayload(data)))) }
export async function updatePromoCode(id, data) { return toUi(unwrap(await api.patch(`/admin/promo-codes/${id}`, toPayload(data)))) }
export async function deletePromoCode(id) { await api.delete(`/admin/promo-codes/${id}`); return true }
