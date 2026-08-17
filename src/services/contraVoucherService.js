import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Contra voucher API: POST /admin/accounts/contra-vouchers
export const createContraVoucher = async (voucher) => unwrap(await api.post('/admin/accounts/contra-vouchers', {
  date: voucher.date,
  account_id: Number(voucher.account_id),
  reverse_account_id: Number(voucher.reverse_account_id),
  amount: Number(voucher.amount),
  ledger_comment: voucher.ledger_comment,
  sub_type: voucher.sub_type,
}))
