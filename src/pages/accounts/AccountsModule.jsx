import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import '../brands/brands.css'
import './accounts.css'
import './accounts-module.css'

const field = (key, label, type = 'text', options) => ({ key, label, type, options })
const account = (key, label) => field(key, label, 'select', 'coa')
const date = field('date', 'Date', 'date')
const amount = field('amount', 'Amount', 'number')
const voucher = [date, account('account_id', 'Account'), account('reverse_account_id', 'Reverse account'), amount, field('ledger_comment', 'Comment')]
const payment = [date, amount, field('payment_method_id', 'Payment method', 'select', 'payment-methods'), field('remarks', 'Remarks')]
export const accountModules = {
  'sub-accounts': { title: 'Sub Account List', endpoint: 'sub-accounts', filter: account('parentId', 'Parent account'), post: 'coa', fields: [account('parentId', 'Parent account'), field('headName', 'Account name')] },
  'predefined-accounts': { title: 'Predefined Accounts', endpoint: 'predefined-accounts' },
  'financial-years': { title: 'Financial Year', endpoint: 'financial-years', fields: [field('name', 'Name'), field('startDate', 'Start date', 'date'), field('endDate', 'End date', 'date'), field('isActive', 'Active', 'checkbox')] },
  'opening-balances': { title: 'Opening Balance', endpoint: 'opening-balances', filter: field('financialYearId', 'Financial year', 'select', 'financial-years'), fields: [field('financialYearId', 'Financial year', 'select', 'financial-years'), account('accountId', 'Account'), account('offsetAccountId', 'Offset account'), field('openingDate', 'Opening date', 'date'), field('entryType', 'Entry type', 'select', ['debit', 'credit']), amount, field('note', 'Note')] },
  'debit-vouchers': { title: 'Debit Voucher', endpoint: 'debit-vouchers', list: false, fields: voucher },
  'credit-vouchers': { title: 'Credit Voucher', endpoint: 'credit-vouchers' },
  'contra-vouchers': { title: 'Contra Voucher', endpoint: 'contra-vouchers', list: false, fields: voucher },
  'payment-methods': { title: 'Payment Method List', endpoint: 'payment-methods', fields: [field('key', 'Key'), field('name', 'Name'), field('requiresBankAccount', 'Requires bank account', 'checkbox')] },
  'bank-reconciliations': { title: 'Bank Reconciliation', endpoint: 'bank-reconciliations', filter: field('bankId', 'Bank', 'select', 'banks'), fields: [field('bankId', 'Bank', 'select', 'banks'), field('statementDate', 'Statement date', 'date'), field('statementClosingBalance', 'Statement closing balance', 'number'), field('transactionIds', 'Transaction IDs (comma separated, optional)'), field('notes', 'Notes')] },
  'supplier-payments': { title: 'Supplier Payment', endpoint: 'supplier-payments', filter: field('supplier_id', 'Supplier', 'select', '/admin/suppliers'), fields: [field('supplier_id', 'Supplier', 'select', '/admin/suppliers'), field('purchase_id', 'Purchase', 'select', '/admin/purchases'), ...payment] },
  'customer-payments': { title: 'Customer Receive', endpoint: 'customer-payments', list: false, fields: [field('customer_id', 'Customer', 'select', '/admin/customers'), field('order_id', 'Sale', 'select', '/admin/pos-sales'), ...payment] },
}
const unwrap = (r) => { if (r.data?.success === false) throw new Error(r.data.message || 'Request failed'); return r.data?.data ?? r.data }
const rowsOf = (data) => {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  const list = Object.values(data).find(Array.isArray)
  return list || Object.entries(data).filter(([key]) => !['success', 'message', 'meta', 'pagination'].includes(key)).map(([key, value]) => typeof value === 'object' && value ? { key, ...value } : { key, value })
}
const flatten = (rows) => rows.flatMap((row) => [row, ...flatten(row.children ?? row.subAccounts ?? [])])
const labelOf = (row) => row.headName ?? row.name ?? row.accountName ?? row.invoiceNumber ?? row.saleNumber ?? row.orderNumber ?? `#${row.id}`
const url = (endpoint) => endpoint.startsWith('/') ? endpoint : `/admin/accounts/${endpoint}`
const defaults = (fields = []) => Object.fromEntries(fields.map((f) => [f.key, f.type === 'checkbox' ? false : f.type === 'date' ? new Date().toLocaleDateString('en-CA') : '']))
const display = (value) => value == null ? '—' : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : typeof value === 'object' ? (value.name ?? value.headName ?? JSON.stringify(value)) : String(value)
const dateValue = (value) => value ? String(value).slice(0, 10) : ''
const accountColumns = [
  { label: 'Account code', value: (row) => row.headCode ?? row.code ?? row.accountCode ?? '—' },
  { label: 'Account name', value: (row) => row.headName ?? row.name ?? row.accountName ?? '—' },
  { label: 'Account type', value: (row) => row.headType ?? row.accountType ?? row.type ?? 'Sub account' },
  { label: 'Status', value: (row) => row.isActive },
]

export default function AccountsModule({ module, create = false }) {
  const config = accountModules[module]
  const requiresFilter = module === 'sub-accounts'
  const isFinancialYear = module === 'financial-years'
  const isBankReconciliation = module === 'bank-reconciliations'
  const [rows, setRows] = useState([])
  const [options, setOptions] = useState({})
  const [form, setForm] = useState(() => defaults(config.fields))
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [financialFilters, setFinancialFilters] = useState({ name: '', status: '', from: '', to: '' })
  const [bookClosingBalance, setBookClosingBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    const sources = [...new Set([...(config.fields || []), config.filter].filter(Boolean).map((f) => f.options).filter((value) => typeof value === 'string'))]
    Promise.all(sources.map(async (source) => [source, flatten(rowsOf(unwrap(await api.get(url(source)))))]))
      .then((entries) => { if (active) setOptions(Object.fromEntries(entries)) })
      .catch((e) => { if (active) setError(e.response?.data?.message || e.message) })
    return () => { active = false }
  }, [config, revision])
  useEffect(() => {
    if (config.list === false || create) return
    if (requiresFilter && !filter) { setRows([]); setLoading(false); return }
    let active = true
    setLoading(true)
    api.get(url(config.endpoint), { params: config.filter && filter ? { [config.filter.key]: Number(filter) } : {} })
      .then((r) => { if (active) { setRows(rowsOf(unwrap(r))); setError('') } })
      .catch((e) => { if (active) { setRows([]); setError(e.response?.data?.message || e.message) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [config, filter, revision, create, requiresFilter])
  const control = (f, value, change, required = true) => f.type === 'select' ? <select required={required} value={value} onChange={(e) => change(e.target.value)}><option value="">Select {f.label.toLowerCase()}</option>{(Array.isArray(f.options) ? f.options.map((v) => ({ id: v, name: v })) : options[f.options] || []).map((row) => <option key={row.id} value={row.id}>{labelOf(row)}</option>)}</select> : <input type={f.type} required={required && !['checkbox', 'note', 'notes', 'remarks', 'ledger_comment', 'transactionIds'].includes(f.type === 'checkbox' ? f.type : f.key)} checked={f.type === 'checkbox' ? Boolean(value) : undefined} value={f.type === 'checkbox' ? undefined : value} step={f.type === 'number' ? '0.01' : undefined} min={f.key === 'amount' ? '0.01' : undefined} onChange={(e) => change(f.type === 'checkbox' ? e.target.checked : e.target.value)} />
  const save = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    if (saving) return
    const payload = Object.fromEntries(config.fields.map((f) => [f.key, f.type === 'number' || (f.type === 'select' && !Array.isArray(f.options)) ? Number(form[f.key]) : typeof form[f.key] === 'string' ? form[f.key].trim() : form[f.key]]))
    if (config.fields.some((f) => f.type === 'select' && !Array.isArray(f.options) && (!Number.isInteger(payload[f.key]) || payload[f.key] <= 0))) return setError('Select a valid record for each required dropdown.')
    if (config.fields.some((f) => f.type === 'number' && !Number.isFinite(payload[f.key]))) return setError('Enter valid amounts.')
    if (payload.amount !== undefined && payload.amount <= 0) return setError('Amount must be greater than zero.')
    if (payload.transactionIds !== undefined) {
      payload.transactionIds = payload.transactionIds ? payload.transactionIds.split(',').map((v) => Number(v.trim())) : []
      if (payload.transactionIds.some((id) => !Number.isInteger(id) || id <= 0)) return setError('Enter valid transaction IDs separated by commas.')
    }
    if (payload.startDate && payload.endDate < payload.startDate) return setError('End date must be on or after start date.')
    if ((payload.accountId && payload.accountId === payload.offsetAccountId) || (payload.account_id && payload.account_id === payload.reverse_account_id)) return setError('Select two different accounts.')
    setSaving(true)
    try { unwrap(await api.post(url(config.post || config.endpoint), payload)); setSuccess('Saved successfully.'); setForm(defaults(config.fields)); setRevision((v) => v + 1) }
    catch (e) { setError(e.response?.data?.message || e.message) }
    finally { setSaving(false) }
  }
  const visible = rows.filter((row) => {
    const hasSearch = Object.values(row).some((v) => display(v).toLowerCase().includes(search.toLowerCase()))
    if (!hasSearch || !isFinancialYear) return hasSearch
    const name = String(row.name ?? row.financialYearName ?? '').toLowerCase()
    const active = row.isActive ?? row.active
    const start = dateValue(row.startDate ?? row.start_date)
    const end = dateValue(row.endDate ?? row.end_date)
    return (!financialFilters.name || name.includes(financialFilters.name.toLowerCase()))
      && (!financialFilters.status || String(Boolean(active)) === financialFilters.status)
      && (!financialFilters.from || (end && end >= financialFilters.from))
      && (!financialFilters.to || (start && start <= financialFilters.to))
  })
  const columns = [...new Set(rows.flatMap(Object.keys))].filter((key) => !['children', 'password', 'token'].includes(key))
  const updateFinancialFilter = (key, value) => setFinancialFilters((current) => ({ ...current, [key]: value }))
  const renderCell = (value, key) => key === 'isActive' || key === 'active'
    ? <span className={`accounts-status ${value ? 'active' : 'inactive'}`}>{value ? 'Active' : 'Inactive'}</span>
    : display(value)
  return <AdminLayout title={config.title}><div className="brand-page"><div className="brand-heading"><div><p>ACCOUNTS</p><h2>{create ? 'Add Payment Method' : config.title}</h2></div><button type="button" onClick={() => setRevision((v) => v + 1)}>Refresh</button></div>
    {error && <div className="brand-error" role="alert">{error}</div>}{success && <div className="brand-success" role="status">{success}</div>}
    {config.fields && <form className="brand-form accounts-entry-form" onSubmit={save}><section><h3>Add {module === 'sub-accounts' ? 'sub account' : config.title.toLowerCase()}</h3><div className="brand-form-grid">{config.fields.map((f) => <label key={f.key}>{f.label}{control(f, form[f.key], (value) => setForm((current) => ({ ...current, [f.key]: value })))}</label>)}</div>{isBankReconciliation && <div className="reconciliation-check"><label>Book closing balance<input type="number" min="0" step="0.01" value={bookClosingBalance} onChange={(event) => setBookClosingBalance(event.target.value)} placeholder="Enter balance from your books" /></label><div><span>Reconciliation difference</span><strong>{Number(form.statementClosingBalance || 0) - Number(bookClosingBalance || 0)}</strong><small>{bookClosingBalance === '' ? 'Enter the book balance to compare it with the bank statement.' : Number(form.statementClosingBalance || 0) === Number(bookClosingBalance) ? 'Reconciled — no difference.' : 'Difference = bank statement balance − book balance.'}</small></div></div>}<div className="brand-form-actions"><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div></section></form>}
    {config.list !== false && !create && <section className="brand-card accounts-list-card"><div className={`brand-toolbar accounts-toolbar ${isFinancialYear ? 'financial-year-filters' : ''}`}>
      {config.filter && <label className="accounts-parent-filter">{config.filter.label}{control(config.filter, filter, setFilter, false)}</label>}
      {isFinancialYear && <><label>Financial year name<input value={financialFilters.name} onChange={(e) => updateFinancialFilter('name', e.target.value)} placeholder="Search financial year" /></label><label>Status<select value={financialFilters.status} onChange={(e) => updateFinancialFilter('status', e.target.value)}><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select></label><label>Starts from<input type="date" value={financialFilters.from} onChange={(e) => updateFinancialFilter('from', e.target.value)} /></label><label>Ends by<input type="date" value={financialFilters.to} onChange={(e) => updateFinancialFilter('to', e.target.value)} /></label><button type="button" className="accounts-clear-filters" onClick={() => setFinancialFilters({ name: '', status: '', from: '', to: '' })}>Clear filters</button></>}
      <label className="accounts-search">Search<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={requiresFilter ? 'Search selected sub accounts' : 'Search records'} /></label></div><div className="brand-table"><table><thead><tr>{requiresFilter ? accountColumns.map((column) => <th key={column.label}>{column.label}</th>) : columns.map((key) => <th key={key}>{key.replace(/([A-Z])/g, ' $1').replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={(requiresFilter ? accountColumns : columns).length || 1}>Loading…</td></tr> : requiresFilter && !filter ? <tr><td colSpan={accountColumns.length}>Choose a parent account to show its sub accounts.</td></tr> : !visible.length ? <tr><td colSpan={(requiresFilter ? accountColumns : columns).length || 1}>No records found.</td></tr> : visible.map((row, index) => <tr key={row.id ?? index}>{requiresFilter ? accountColumns.map((column) => <td key={column.label}>{column.label === 'Status' ? renderCell(column.value(row), 'isActive') : display(column.value(row))}</td>) : columns.map((key) => <td key={key}>{renderCell(row[key], key)}</td>)}</tr>)}</tbody></table></div></section>}
  </div></AdminLayout>
}
