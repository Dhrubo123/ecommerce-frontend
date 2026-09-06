import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// The backend specification currently provides this endpoint for Cash Adjustments.
// If the backend later exposes /admin/accounts/cash-adjustments, change only this constant.
const CASH_ADJUSTMENT_ENDPOINT = '/admin/accounts/journal-vouchers'

export const createCashAdjustment = async (adjustment) => unwrap(await api.post(CASH_ADJUSTMENT_ENDPOINT, {
  date: adjustment.date,
  ledger_comment: adjustment.remarks,
  entries: adjustment.entries,
}))
