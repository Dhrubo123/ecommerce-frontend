import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createCashAdjustment } from '../../services/cashAdjustmentService'
import { getChartOfAccounts } from '../../services/accountService'
import '../brands/brands.css'

const createBlankForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  adjustment_type: 'debit',
  cash_account_id: '',
  adjustment_account_id: '',
  remarks: '',
  amount: '',
})
const flattenAccounts = (items) => items.flatMap((item) => [{ id: item.id, name: item.headName ?? item.name, code: item.headCode ?? item.code }, ...flattenAccounts(item.children ?? [])])

export default function CashAdjustmentForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(createBlankForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    getChartOfAccounts()
      .then((data) => setAccounts(flattenAccounts(Array.isArray(data) ? data : data?.accounts ?? data?.items ?? [])))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load account heads.'))
  }, [])

  const change = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
    setSuccess('')
  }

  const save = async (event) => {
    event.preventDefault()

    if (!form.date || !form.adjustment_type || !form.cash_account_id || !form.adjustment_account_id || !form.remarks.trim() || Number(form.amount) <= 0) {
      setError('Select the cash and adjustment accounts, then enter the date, remarks, and a valid amount.')
      return
    }
    if (form.cash_account_id === form.adjustment_account_id) { setError('Cash account and adjustment account must be different.'); return }

    setSaving(true)
    setError('')
    try {
      const amount = Number(form.amount)
      const cashIsDebit = form.adjustment_type === 'debit'
      await createCashAdjustment({ ...form, entries: [
        { account_id: Number(form.cash_account_id), debit: cashIsDebit ? amount : 0, credit: cashIsDebit ? 0 : amount },
        { account_id: Number(form.adjustment_account_id), debit: cashIsDebit ? 0 : amount, credit: cashIsDebit ? amount : 0 },
      ] })
      setSuccess('Cash adjustment saved successfully.')
      setForm(createBlankForm())
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save cash adjustment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Cash Adjustment">
      <div className="brand-page">
        <div className="brand-heading">
          <div>
            <p>ACCOUNTS</p>
            <h2>Cash Adjustment</h2>
            <span>Record a cash difference found during reconciliation or counting.</span>
          </div>
        </div>

        <form className="brand-form" onSubmit={save}>
          <section>
            <h3>Adjustment information</h3>
            {error && <div className="brand-error">{error}</div>}
            {success && <div className="brand-success">{success}</div>}

            <div className="brand-form-grid">
              <label>
                Adjustment Date *
                <input type="date" name="date" value={form.date} onChange={change} />
              </label>
              <label>
                Amount *
                <input type="number" min="0.01" step="0.01" name="amount" value={form.amount} onChange={change} placeholder="500" />
              </label>
            </div>

            <div className="brand-form-grid">
              <label>
                Cash Account *
                <select name="cash_account_id" value={form.cash_account_id} onChange={change}>
                  <option value="">Select cash account</option>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.name} {account.code ? `(${account.code})` : ''}</option>)}
                </select>
              </label>
              <label>
                Adjustment Account *
                <select name="adjustment_account_id" value={form.adjustment_account_id} onChange={change}>
                  <option value="">Select adjustment account</option>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.name} {account.code ? `(${account.code})` : ''}</option>)}
                </select>
              </label>
            </div>

            <label>
              Adjustment Type *
              <select name="adjustment_type" value={form.adjustment_type} onChange={change}>
                <option value="debit">Debit — cash counted above system balance</option>
                <option value="credit">Credit — cash counted below system balance</option>
              </select>
            </label>

            <label>
              Remarks *
              <textarea name="remarks" value={form.remarks} onChange={change} rows="4" placeholder="Cash counted above system balance" />
            </label>

            <div className="brand-form-actions">
              <button type="button" onClick={() => navigate('/chart-of-accounts')}>Cancel</button>
              <button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Cash Adjustment'}</button>
            </div>
          </section>

          <aside>
            <span>ADJUSTMENT PREVIEW</span>
            <div className="brand-preview-logo">CA</div>
            <h3>{form.amount || '0.00'}</h3>
            <p>{form.adjustment_type === 'debit' ? 'Debit adjustment' : 'Credit adjustment'}</p>
            <p>{form.date}</p>
            <p>{form.remarks || 'Adjustment remarks'}</p>
          </aside>
        </form>
      </div>
    </AdminLayout>
  )
}
