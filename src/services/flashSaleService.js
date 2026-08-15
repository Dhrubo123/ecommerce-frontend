import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

const toUi = (sale) => ({
  ...sale,
  image: sale.image ?? sale.imageUrl ?? '',
  minimumDiscount: sale.minimumDiscount ?? 0,
  startDate: sale.startDate?.slice?.(0, 10) ?? sale.startDate ?? '',
  endDate: sale.endDate?.slice?.(0, 10) ?? sale.endDate ?? '',
  startTime: sale.startTime ?? '',
  endTime: sale.endTime ?? '',
  description: sale.description ?? '',
  isActive: sale.isActive ?? true,
})

const toPayload = (sale) => {
  const payload = new FormData()
  payload.append('name', sale.name.trim())
  payload.append('minimumDiscount', String(Number(sale.minimumDiscount)))
  payload.append('startDate', sale.startDate)
  payload.append('startTime', sale.startTime)
  payload.append('endDate', sale.endDate)
  payload.append('endTime', sale.endTime)
  payload.append('description', sale.description.trim())
  payload.append('isActive', String(Boolean(sale.isActive)))
  if (sale.image instanceof File) payload.append('image', sale.image)
  return payload
}

// Flash Sale API: GET/POST /admin/flash-sales and GET/PATCH/DELETE /admin/flash-sales/:id
export async function getFlashSales(params = {}) {
  const response = await api.get('/admin/flash-sales', { params })
  const data = unwrap(response)
  const sales = Array.isArray(data) ? data : (data.flashSales ?? data.items ?? [])
  return sales.map(toUi)
}

export async function getFlashSale(id) { return toUi(unwrap(await api.get(`/admin/flash-sales/${id}`))) }
export async function createFlashSale(data) { return toUi(unwrap(await api.post('/admin/flash-sales', toPayload(data)))) }
export async function updateFlashSale(id, data) { return toUi(unwrap(await api.patch(`/admin/flash-sales/${id}`, toPayload(data)))) }
export async function deleteFlashSale(id) { await api.delete(`/admin/flash-sales/${id}`); return true }
