import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { getChartOfAccounts } from '../../services/accountService'
import { getCustomers } from '../../services/customerService'
import { getEcommerceOrders } from '../../services/ecommerceOrderService'
import { createCustomerPayment } from '../../services/customerPaymentService'
import '../brands/brands.css'

const blank = { customer_id: '', order_id: '', date: new Date().toISOString().slice(0, 10), remarks: '', amount: '', payment_method_id: '', account_id: '', cheque_number: '' }
const flattenAccounts = (items) => items.flatMap((item) => [{ id: item.id, name: item.name, code: item.headCode ?? item.code }, ...flattenAccounts(item.children ?? [])])
const customerName = (customer) => [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.name || `Customer #${customer.id}`

export default function CustomerPaymentForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(blank)
  const [options, setOptions] = useState({ customers: [], orders: [], accounts: [] })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getCustomers(), getEcommerceOrders(), getChartOfAccounts()])
      .then(([customers, orders, accounts]) => setOptions({ customers, orders, accounts: flattenAccounts(Array.isArray(accounts) ? accounts : accounts?.accounts ?? accounts?.items ?? []) }))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load customer payment options.'))
  }, [])

  const orders = useMemo(() => options.orders.filter((order) => !form.customer_id || String(order.customerId ?? order.customer?.id) === String(form.customer_id)), [form.customer_id, options.orders])
  const change = ({ target: { name, value } }) => { setForm((current) => ({ ...current, [name]: value, ...(name === 'customer_id' ? { order_id: '' } : {}) })); setError(''); setSuccess('') }
  const save = async (event) => {
    event.preventDefault()
    if (!form.customer_id || !form.order_id || !form.date || !form.amount || !form.payment_method_id || !form.account_id) { setError('Complete all required payment fields.'); return }
    setSaving(true); setError('')
    try { await createCustomerPayment(form); setSuccess('Customer payment saved successfully.'); setForm(blank) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save customer payment.') }
    finally { setSaving(false) }
  }

  return <AdminLayout title="Customer Receive"><div className="brand-page"><div className="brand-heading"><div><p>ACCOUNTS</p><h2>Customer Receive</h2><span>Record a payment received from a customer order.</span></div></div><form className="brand-form" onSubmit={save}><section><h3>Receipt information</h3>{error && <div className="brand-error">{error}</div>}{success && <div className="brand-success">{success}</div>}<div className="brand-form-grid"><label>Customer *<select name="customer_id" value={form.customer_id} onChange={change}><option value="">Select customer</option>{options.customers.map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer)}</option>)}</select></label><label>Order *<select name="order_id" value={form.order_id} onChange={change}><option value="">Select order</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.orderNumber || order.invoiceNumber || `Order #${order.id}`}</option>)}</select></label></div><div className="brand-form-grid"><label>Payment Date *<input type="date" name="date" value={form.date} onChange={change} /></label><label>Amount *<input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={change} placeholder="1000" /></label></div><div className="brand-form-grid"><label>Payment Method ID *<input type="number" min="1" name="payment_method_id" value={form.payment_method_id} onChange={change} placeholder="3" /></label><label>Account *<select name="account_id" value={form.account_id} onChange={change}><option value="">Select account head</option>{options.accounts.map((account) => <option key={account.id} value={account.id}>{account.name} {account.code ? `(${account.code})` : ''}</option>)}</select></label></div><label>Cheque Number<input name="cheque_number" value={form.cheque_number} onChange={change} placeholder="83837878" /></label><label>Remarks<textarea name="remarks" value={form.remarks} onChange={change} rows="4" placeholder="Cheque received" /></label><div className="brand-form-actions"><button type="button" onClick={() => navigate('/chart-of-accounts')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Customer Payment'}</button></div></section><aside><span>RECEIPT PREVIEW</span><div className="brand-preview-logo">৳</div><h3>{form.amount || '0.00'}</h3><p>{customerName(options.customers.find((customer) => String(customer.id) === String(form.customer_id)) || {}) || 'Customer name'}</p><p>{form.date}</p><p>{form.remarks || 'Receipt remarks'}</p></aside></form></div></AdminLayout>
}
