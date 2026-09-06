import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleDollarSign, Clock3, Eye, FileText, Search, Settings2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getEcommerceOrders } from '../../services/ecommerceOrderService'
import { getCustomers } from '../../services/customerService'
import { getWarehouses } from '../../services/warehouseService'
import '../brands/brands.css'

const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
const statuses = ['pending', 'confirmed', 'processing', 'pickup', 'on_the_way', 'delivered', 'cancelled']

export default function EcommerceOrderList() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [options, setOptions] = useState({ warehouses: [], customers: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([getEcommerceOrders(), getWarehouses(), getCustomers()]).then(([data, warehouses, customers]) => { setOrders(data); setOptions({ warehouses, customers }); setError('') }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load ecommerce orders.')).finally(() => setLoading(false))
  }, [])
  const visibleOrders = useMemo(() => orders.filter((order) => {
    const customer = order.customer ?? {}
    const orderWarehouseId = order.warehouseId ?? order.warehouse?.id
    const orderCustomerId = order.customerId ?? customer.id
    const matchesSearch = !search.trim() || [order.orderNumber, order.id, order.customerName, customer.name, order.phone, customer.phone].some((value) => String(value ?? '').toLowerCase().includes(search.trim().toLowerCase()))
    const matchesStatus = !status || String(order.status ?? order.orderStatus ?? '').toLowerCase() === status
    const matchesWarehouse = !warehouseId || String(orderWarehouseId) === warehouseId
    const matchesCustomer = !customerId || String(orderCustomerId) === customerId
    const date = String(order.createdAt ?? order.orderDate ?? '').slice(0, 10)
    const matchesDate = (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo)
    return matchesSearch && matchesStatus && matchesWarehouse && matchesCustomer && matchesDate
  }), [orders, search, status, warehouseId, customerId, dateFrom, dateTo])

  return <AdminLayout title="Orders"><div className="brand-page">
    <div className="brand-heading"><div><p>ORDER MANAGEMENT</p><h2>Orders</h2><span>Review sales and customer delivery details. New orders are created from POS.</span></div></div>
    <section className="brand-card"><div className="order-filters"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, or phone" /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label><label>Warehouse<select value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)}><option value="">All warehouses</option>{options.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label><label>Customer<select value={customerId} onChange={(event) => setCustomerId(event.target.value)}><option value="">All customers</option>{options.customers.map((customer) => <option key={customer.id} value={customer.id}>{`${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || customer.name || `Customer #${customer.id}`}</option>)}</select></label><label>From date<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label><label>To date<input type="date" min={dateFrom} value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label></div>{error && <div className="brand-error">{error}</div>}
      <div className="brand-table"><table><thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Warehouse</th><th>Payment</th><th>Total</th><th>Status</th><th>Created</th><th>Action</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="9">Loading orders…</td></tr> : visibleOrders.length === 0 ? <tr><td colSpan="9">No orders match these filters.</td></tr> : visibleOrders.map((order, index) => <tr key={order.id || index}><td><strong>#{order.orderNumber || order.id || index + 1}</strong></td><td>{order.customer?.name || order.customerName || '—'}</td><td>{order.customer?.phone || order.phone || '—'}</td><td>{order.warehouse?.name || order.warehouseName || '—'}</td><td>{order.paymentMethod || '—'}</td><td>{money(order.totalAmount ?? order.total)}</td><td><span className={`brand-status ${String(order.status || '').toLowerCase() === 'cancelled' ? 'inactive' : 'active'}`}>{order.status || 'Pending'}</span></td><td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td><td><div className="brand-actions"><Link to={`/orders/${order.id}`} title="Order details"><Eye size={15} /></Link><Link to={`/orders/${order.id}?tab=status`} title="Change status"><Settings2 size={15} /></Link><Link to={`/orders/${order.id}?tab=history`} title="Order history"><Clock3 size={15} /></Link><Link to={`/orders/${order.id}/invoice`} title="View invoice"><FileText size={15} /></Link><Link to={`/customer-payments/create?orderId=${order.id}&customerId=${order.customerId ?? order.customer?.id ?? ''}`} title="Receive payment"><CircleDollarSign size={15} /></Link></div></td></tr>)}
      </tbody></table></div>
    </section>
  </div></AdminLayout>
}
