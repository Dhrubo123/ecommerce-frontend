import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { confirmOrder, getEcommerceOrder, updateOrderPaymentStatus, updateOrderStatus } from '../../services/ecommerceOrderService'
import { getWarehouses } from '../../services/warehouseService'
import '../brands/brands.css'
import './orders.css'

export default function EcommerceOrderView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [status, setStatus] = useState('pending')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [allocations, setAllocations] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getEcommerceOrder(id), getWarehouses()]).then(([data, warehouseData]) => {
      setOrder(data); setWarehouses(warehouseData); setStatus(String(data.status ?? data.orderStatus ?? data.order_status ?? 'pending').toLowerCase()); setPaymentStatus(String(data.paymentStatus ?? data.payment_status ?? 'unpaid').toLowerCase())
      const items = data.items || data.orderItems || []
      setAllocations(items.map((item) => ({ orderItemId: item.id ?? item.orderItemId, warehouseId: item.warehouseId ?? data.warehouseId ?? '', quantity: item.quantity ?? 1 })))
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load this order.'))
  }, [id])

  const request = async (action, done) => {
    setSaving(true); setError(''); setSuccess('')
    try { await action(); setSuccess(done) } catch (requestError) { setError(requestError.response?.data?.message || 'The order action could not be completed.') } finally { setSaving(false) }
  }
  const items = order?.items || order?.orderItems || []
  const customer = order?.customer || {}
  const changeAllocation = (index, key, value) => setAllocations((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))

  return <AdminLayout title="Order Details"><div className="brand-page">
    <button className="brand-back" onClick={() => navigate('/orders')}><ArrowLeft size={16} />Back to Orders</button>
    <div className="brand-heading"><div><p>ORDER MANAGEMENT</p><h2>Order #{order?.orderNumber || order?.id || id}</h2><span>Review, update and confirm this order.</span></div></div>
    {error && <div className="brand-error">{error}</div>}{success && <div className="brand-success">{success}</div>}
    {!order ? !error && <div className="brand-card brand-empty">Loading order details…</div> : <div className="order-detail-grid">
      <section className="brand-card order-detail-card"><h3>Customer & delivery</h3><p><strong>{customer.name || order.customerName || '—'}</strong><br />{customer.phone || order.phone || '—'}<br />{customer.email || '—'}<br />{customer.address || order.address || '—'}</p><p><strong>Warehouse:</strong> {order.warehouse?.name || order.warehouseName || order.warehouseId || '—'}<br /><strong>Payment:</strong> {order.paymentMethod || '—'}<br /><strong>Note:</strong> {order.note || '—'}</p></section>
      <section className="brand-card order-detail-card"><h3>Order controls</h3><label>Order status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label><button className="brand-primary" disabled={saving} onClick={() => request(() => updateOrderStatus(id, status), 'Order status updated.')}><Save size={15} />Save Status</button><label>Payment status<select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="refunded">Refunded</option></select></label><button className="brand-primary" disabled={saving} onClick={() => request(() => updateOrderPaymentStatus(id, paymentStatus), 'Payment status updated.')}><Save size={15} />Save Payment</button></section>
      <section className="brand-card order-detail-card order-wide"><h3>Order items</h3><div className="brand-table"><table><thead><tr><th>Product</th><th>Quantity</th><th>Price</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.id || index}><td>{item.product?.name || item.productName || `Product #${item.productId}`}</td><td>{item.quantity}</td><td>{item.unitPrice ?? item.price ?? '—'}</td></tr>)}</tbody></table></div></section>
      <section className="brand-card order-detail-card order-wide"><h3>Confirm & allocate stock</h3><p>Choose the warehouse for every item before confirmation.</p>{allocations.map((allocation, index) => <div className="order-allocation" key={allocation.orderItemId || index}><span>{items[index]?.product?.name || items[index]?.productName || `Item #${allocation.orderItemId}`}</span><select value={allocation.warehouseId} onChange={(event) => changeAllocation(index, 'warehouseId', event.target.value)}><option value="">Select warehouse</option>{warehouses.map((warehouse) => <option value={warehouse.id} key={warehouse.id}>{warehouse.name}</option>)}</select><input type="number" min="1" value={allocation.quantity} onChange={(event) => changeAllocation(index, 'quantity', event.target.value)} /></div>)}<button className="brand-primary" disabled={saving || !allocations.length} onClick={() => request(() => confirmOrder(id, allocations.map((item) => ({ ...item, warehouseId: Number(item.warehouseId), quantity: Number(item.quantity) }))), 'Order confirmed and stock allocated.')}><CheckCircle2 size={16} />Confirm Order</button></section>
    </div>}
  </div></AdminLayout>
}
