import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Search } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getEcommerceOrders } from '../../services/ecommerceOrderService'
import '../brands/brands.css'

const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
const statusTabs = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirm', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Pickup', value: 'pickup' },
  { label: 'On The Way', value: 'on_the_way' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function EcommerceOrderList() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEcommerceOrders({ search, ...(status ? { status } : {}) }).then((data) => { setOrders(data); setError('') }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load ecommerce orders.')).finally(() => setLoading(false))
  }, [search, status])

  return <AdminLayout title="Orders"><div className="brand-page">
    <div className="brand-heading"><div><p>ORDER MANAGEMENT</p><h2>Orders</h2><span>Review sales and customer delivery details. New orders are created from POS.</span></div></div>
    <section className="brand-card"><div className="order-status-tabs" aria-label="Filter orders by status">{statusTabs.map((tab) => <button key={tab.value || 'all'} type="button" className={status === tab.value ? 'is-active' : ''} onClick={() => setStatus(tab.value)}>{tab.label}</button>)}</div><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, or phone" /></label></div>{error && <div className="brand-error">{error}</div>}
      <div className="brand-table"><table><thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Warehouse</th><th>Payment</th><th>Total</th><th>Status</th><th>Created</th><th>Action</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="9">Loading orders…</td></tr> : orders.length === 0 ? <tr><td colSpan="9">No orders found.</td></tr> : orders.map((order, index) => <tr key={order.id || index}><td><strong>#{order.orderNumber || order.id || index + 1}</strong></td><td>{order.customer?.name || order.customerName || '—'}</td><td>{order.customer?.phone || order.phone || '—'}</td><td>{order.warehouse?.name || order.warehouseName || '—'}</td><td>{order.paymentMethod || '—'}</td><td>{money(order.totalAmount ?? order.total)}</td><td><span className={`brand-status ${String(order.status || '').toLowerCase() === 'cancelled' ? 'inactive' : 'active'}`}>{order.status || 'Pending'}</span></td><td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td><td><div className="brand-actions"><Link to={`/orders/${order.id}`} title="View order"><Eye size={15} /></Link></div></td></tr>)}
      </tbody></table></div>
    </section>
  </div></AdminLayout>
}
