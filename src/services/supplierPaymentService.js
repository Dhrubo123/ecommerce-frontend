import api from './api'

const unwrap = (response) => response.data?.data ?? response.data
const asList = (data) => Array.isArray(data) ? data : (data.payments ?? data.supplierPayments ?? data.items ?? [])
const payload = (payment) => ({ supplier_id: Number(payment.supplier_id), purchase_id: Number(payment.purchase_id), date: payment.date, remarks: payment.remarks, amount: Number(payment.amount), payment_method_id: Number(payment.payment_method_id), account_id: Number(payment.account_id), cheque_number: payment.cheque_number || undefined })

// Supplier payments API: GET/POST /admin/accounts/supplier-payments
export const getSupplierPayments = async (params = {}) => asList(unwrap(await api.get('/admin/accounts/supplier-payments', { params })))
export const createSupplierPayment = async (payment) => unwrap(await api.post('/admin/accounts/supplier-payments', payload(payment)))
