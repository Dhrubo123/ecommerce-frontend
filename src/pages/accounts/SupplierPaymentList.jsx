import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getSupplierPayments } from '../../services/supplierPaymentService'
import '../brands/brands.css'

export default function SupplierPaymentList() {
  const [payments, setPayments] = useState([]); const [search, setSearch] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => { setLoading(true); getSupplierPayments({ search }).then(setPayments).catch((e) => setError(e.response?.data?.message || 'Unable to load supplier payments.')).finally(() => setLoading(false)) }, [search])
  return <AdminLayout title="Supplier Payments"><div className="brand-page"><div className="brand-heading"><div><p>ACCOUNTS</p><h2>Supplier Payments</h2><span>Record and review payments made to suppliers.</span></div><Link className="brand-primary" to="/supplier-payments/create"><Plus size={17} />Add Supplier Payment</Link></div><section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supplier payments" /></label></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Date</th><th>Supplier</th><th>Purchase</th><th>Method</th><th>Account</th><th>Amount</th><th>Cheque No.</th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Loading supplier payments…</td></tr> : payments.length === 0 ? <tr><td colSpan="7">No supplier payments found.</td></tr> : payments.map((payment) => <tr key={payment.id}><td>{payment.date || payment.paymentDate || '—'}</td><td>{payment.supplier?.name || payment.supplierName || payment.supplier_id || '—'}</td><td>{payment.purchase?.invoiceNumber || payment.purchase_id || '—'}</td><td>{payment.paymentMethod?.name || payment.paymentMethodName || payment.payment_method_id || '—'}</td><td>{payment.account?.name || payment.accountName || payment.account_id || '—'}</td><td><strong>{Number(payment.amount || 0).toLocaleString()}</strong></td><td>{payment.cheque_number || payment.chequeNumber || '—'}</td></tr>)}</tbody></table></div></section></div></AdminLayout>
}
