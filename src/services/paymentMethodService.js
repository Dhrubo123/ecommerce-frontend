import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

export const getPaymentMethods = async () => {
  const data = unwrap(await api.get('/admin/accounts/payment-methods'))
  return Array.isArray(data) ? data : (data.paymentMethods ?? data.items ?? [])
}
