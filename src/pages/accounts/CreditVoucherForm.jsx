import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { getChartOfAccounts } from '../../services/accountService'
import { createCreditVoucher } from '../../services/creditVoucherService'
import '../brands/brands.css'

const blank = { date: new Date().toISOString().slice(0, 10), account_id: '', reverse_account_id: '', amount: '', ledger_comment: '', sub_type: 'Sales' }
const flattenAccounts = (items) => items.flatMap((item) => [{ id: item.id, name: item.name, code: item.headCode ?? item.code }, ...flattenAccounts(item.children ?? [])])

export default function CreditVoucherForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(blank)
  const [accounts, setAccounts] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { getChartOfAccounts().then((data) => setAccounts(flattenAccounts(Array.isArray(data) ? data : data?.accounts ?? data?.items ?? []))).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load account heads.')) }, [])
  const change = ({ target: { name, value } }) => { setForm((current) => ({ ...current, [name]: value })); setError(''); setSuccess('') }
  const save = async (event) => {
    event.preventDefault()
    if (!form.date || !form.account_id || !form.reverse_account_id || !form.amount || !form.ledger_comment || !form.sub_type) { setError('Complete all required voucher fields.'); return }
    if (form.account_id === form.reverse_account_id) { setError('Account and reverse account must be different.'); return }
    setSaving(true); setError('')
    try { await createCreditVoucher(form); setSuccess('Credit voucher saved successfully.'); setForm(blank) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save credit voucher.') }
    finally { setSaving(false) }
  }
  const selectAccount = (name, label) => <label>{label} *<select name={name} value={form[name]} onChange={change}><option value="">{accounts.length ? 'Select account head' : 'Loading account heads…'}</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} {account.code ? `(${account.code})` : ''}</option>)}</select></label>

  return <AdminLayout title="Credit Voucher"><div className="brand-page"><div className="brand-heading"><div><p>ACCOUNTS</p><h2>Credit Voucher</h2><span>Record a credit-side accounting entry.</span></div></div><form className="brand-form" onSubmit={save}><section><h3>Voucher information</h3>{error && <div className="brand-error">{error}</div>}{success && <div className="brand-success">{success}</div>}<div className="brand-form-grid"><label>Date *<input type="date" name="date" value={form.date} onChange={change} /></label><label>Amount *<input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={change} placeholder="1000" /></label></div><div className="brand-form-grid">{selectAccount('account_id', 'Credit Account')}{selectAccount('reverse_account_id', 'Reverse Account')}</div><label>Sub Type *<select name="sub_type" value={form.sub_type} onChange={change}><option value="Sales">Sales</option><option value="Income">Income</option><option value="Other">Other</option></select></label><label>Ledger Comment *<textarea name="ledger_comment" value={form.ledger_comment} onChange={change} rows="4" placeholder="Sales voucher for customer" /></label><div className="brand-form-actions"><button type="button" onClick={() => navigate('/chart-of-accounts')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Credit Voucher'}</button></div></section><aside><span>VOUCHER PREVIEW</span><div className="brand-preview-logo">CV</div><h3>{form.amount || '0.00'}</h3><p>{form.sub_type || 'Sales'}</p><p>{form.date}</p><p>{form.ledger_comment || 'Voucher comment'}</p></aside></form></div></AdminLayout>
}
