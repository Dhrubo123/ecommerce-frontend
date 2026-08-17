import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Debit voucher API: POST /admin/accounts/debit-vouchers
export const createDebitVoucher = async (voucher) => unwrap(await api.post('/admin/accounts/debit-vouchers', {
  date: voucher.date,
  account_id: Number(voucher.account_id),
  reverse_account_id: Number(voucher.reverse_account_id),
  amount: Number(voucher.amount),
  ledger_comment: voucher.ledger_comment,
  sub_type: voucher.sub_type,
}))
