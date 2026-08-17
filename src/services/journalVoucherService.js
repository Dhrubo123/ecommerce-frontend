import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Journal voucher API: POST /admin/accounts/journal-vouchers
export const createJournalVoucher = async (voucher) => unwrap(await api.post('/admin/accounts/journal-vouchers', {
  date: voucher.date,
  ledger_comment: voucher.ledger_comment,
  sub_type: voucher.sub_type,
  entries: voucher.entries.map((entry) => ({ account_id: Number(entry.account_id), debit: Number(entry.debit || 0), credit: Number(entry.credit || 0) })),
}))
