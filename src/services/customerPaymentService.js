import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Customer payments API: POST /admin/accounts/customer-payments
// A list endpoint was not supplied, so this service deliberately exposes only
// creation until the backend provides GET /admin/accounts/customer-payments.
export const createCustomerPayment = async (payment) => unwrap(await api.post('/admin/accounts/customer-payments', {
  customer_id: Number(payment.customer_id),
  order_id: Number(payment.order_id),
  date: payment.date,
  remarks: payment.remarks,
  amount: Number(payment.amount),
  payment_method_id: Number(payment.payment_method_id),
  account_id: Number(payment.account_id),
  cheque_number: payment.cheque_number || undefined,
}))
