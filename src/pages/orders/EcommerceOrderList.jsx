import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Plus, Search } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getEcommerceOrders } from '../../services/ecommerceOrderService'
import '../brands/brands.css'

const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })

export default function EcommerceOrderList() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEcommerceOrders({ search }).then((data) => { setOrders(data); setError('') }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load ecommerce orders.')).finally(() => setLoading(false))
  }, [search])

  return <AdminLayout title="Orders"><div className="brand-page">
    <div className="brand-heading"><div><p>ORDER MANAGEMENT</p><h2>Orders</h2><span>Manage online orders and customer delivery details.</span></div><Link className="brand-primary" to="/orders/create"><Plus size={17} />Create Order</Link></div>
    <section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, or phone" /></label></div>{error && <div className="brand-error">{error}</div>}
      <div className="brand-table"><table><thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Warehouse</th><th>Payment</th><th>Total</th><th>Status</th><th>Created</th><th>Action</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="9">Loading orders…</td></tr> : orders.length === 0 ? <tr><td colSpan="9">No orders found.</td></tr> : orders.map((order, index) => <tr key={order.id || index}><td><strong>#{order.orderNumber || order.id || index + 1}</strong></td><td>{order.customer?.name || order.customerName || '—'}</td><td>{order.customer?.phone || order.phone || '—'}</td><td>{order.warehouse?.name || order.warehouseName || '—'}</td><td>{order.paymentMethod || '—'}</td><td>{money(order.totalAmount ?? order.total)}</td><td><span className={`brand-status ${String(order.status || '').toLowerCase() === 'cancelled' ? 'inactive' : 'active'}`}>{order.status || 'Pending'}</span></td><td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td><td><div className="brand-actions"><Link to={`/orders/${order.id}`} title="View order"><Eye size={15} /></Link></div></td></tr>)}
      </tbody></table></div>
    </section>
  </div></AdminLayout>
}
