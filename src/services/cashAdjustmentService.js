import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// The backend specification currently provides this endpoint for Cash Adjustments.
// If the backend later exposes /admin/accounts/cash-adjustments, change only this constant.
const CASH_ADJUSTMENT_ENDPOINT = '/admin/accounts/journal-vouchers'

export const createCashAdjustment = async (adjustment) => unwrap(await api.post(CASH_ADJUSTMENT_ENDPOINT, {
  date: adjustment.date,
  adjustment_type: adjustment.adjustment_type,
  remarks: adjustment.remarks,
  amount: Number(adjustment.amount),
}))
