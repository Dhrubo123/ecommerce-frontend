import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { confirmOrder, getEcommerceOrder, updateOrderPaymentStatus, updateOrderStatus } from '../../services/ecommerceOrderService'
import { getWarehouses } from '../../services/warehouseService'
import { getStockReports } from '../../services/stockReportService'
import '../brands/brands.css'
import './orders.css'

const getWarehouseId = (value) => value?.id ?? value?.warehouseId ?? value?.warehouse_id ?? value ?? ''
const getOrderItemId = (item) => item?.id ?? item?.orderItemId ?? item?.order_item_id ?? ''
const getErrorMessage = (requestError, fallback) => requestError.response?.data?.errors?.[0]?.message || requestError.response?.data?.message || fallback

export default function EcommerceOrderView() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const viewTab = searchParams.get('tab')
  const isStatusView = viewTab === 'status'
  const isHistoryView = viewTab === 'history'
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [status, setStatus] = useState('pending')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [allocations, setAllocations] = useState([])
  const [stockByWarehouse, setStockByWarehouse] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getEcommerceOrder(id), getWarehouses()]).then(([data, warehouseData]) => {
      setOrder(data); setWarehouses(warehouseData); setStatus(String(data.status ?? data.orderStatus ?? data.order_status ?? 'pending').toLowerCase()); setPaymentStatus(String(data.paymentStatus ?? data.payment_status ?? 'unpaid').toLowerCase())
      const items = data.items || data.orderItems || []
      const defaultWarehouseId = getWarehouseId(data.warehouse ?? data.warehouseId ?? data.warehouse_id)
      setAllocations(items.map((item) => ({ orderItemId: getOrderItemId(item), warehouseId: getWarehouseId(item.warehouse ?? item.warehouseId ?? item.warehouse_id ?? defaultWarehouseId), quantity: item.quantity ?? 1 })))
    }).catch((requestError) => setError(getErrorMessage(requestError, 'Unable to load this order.')))
  }, [id])

  useEffect(() => {
    const warehouseIds = [...new Set(allocations.map((item) => item.warehouseId).filter(Boolean))]
    if (!warehouseIds.length) return
    Promise.all(warehouseIds.map((warehouseId) => getStockReports({ warehouseId }).then((rows) => [warehouseId, rows])))
      .then((results) => setStockByWarehouse(Object.fromEntries(results)))
      .catch(() => setStockByWarehouse({}))
  }, [allocations])

  const request = async (action, done) => {
    setSaving(true); setError(''); setSuccess('')
    try { await action(); setSuccess(done) } catch (requestError) { setError(getErrorMessage(requestError, 'The order action could not be completed.')) } finally { setSaving(false) }
  }
  const items = order?.items || order?.orderItems || []
  const customer = order?.customer || {}
  const changeAllocation = (index, key, value) => setAllocations((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  const submitConfirmation = () => {
    const payload = allocations.map((item) => ({
      orderItemId: Number(item.orderItemId),
      warehouseId: Number(item.warehouseId),
      quantity: Number(item.quantity),
    }))

    if (payload.some((item) => !Number.isFinite(item.orderItemId) || !Number.isFinite(item.warehouseId) || !Number.isFinite(item.quantity) || item.quantity < 1)) {
      setError('Select a valid warehouse and quantity for every order item before confirmation.')
      return
    }

    request(async () => { await confirmOrder(id, payload); await updateOrderStatus(id, 'processing') }, 'Order assigned and moved to processing.')
  }

  return <AdminLayout title="Order Details"><div className="brand-page">
    <button className="brand-back" onClick={() => navigate('/orders')}><ArrowLeft size={16} />Back to Orders</button>
    <div className="brand-heading"><div><p>ORDER MANAGEMENT</p><h2>Order #{order?.orderNumber || order?.id || id}</h2><span>{isStatusView ? 'Update order status and assign stock.' : isHistoryView ? 'Review the order status timeline.' : 'Review customer, delivery, payment, and item details.'}</span></div></div>
    {error && <div className="brand-error">{error}</div>}{success && <div className="brand-success">{success}</div>}
    {!order ? !error && <div className="brand-card brand-empty">Loading order details…</div> : <div className="order-detail-grid">
      <section className="brand-card order-detail-card"><h3>Customer & delivery</h3><p><strong>{customer.name || order.customerName || '—'}</strong><br />{customer.phone || order.phone || '—'}<br />{customer.email || '—'}<br />{customer.address || order.address || '—'}</p><p><strong>Warehouse:</strong> {order.warehouse?.name || order.warehouseName || order.warehouseId || '—'}<br /><strong>Payment:</strong> {order.paymentMethod || '—'}<br /><strong>Note:</strong> {order.note || '—'}</p></section>
      {isStatusView && <section className="brand-card order-detail-card"><h3>Order controls</h3><label>Order status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label><button className="brand-primary" disabled={saving} onClick={() => request(() => updateOrderStatus(id, status), 'Order status updated.')}><Save size={15} />Save Status</button><label>Payment status<select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="refunded">Refunded</option></select></label><button className="brand-primary" disabled={saving} onClick={() => request(() => updateOrderPaymentStatus(id, paymentStatus), 'Payment status updated.')}><Save size={15} />Save Payment</button></section>}
      <section className="brand-card order-detail-card order-wide"><h3>Order items</h3><div className="brand-table"><table><thead><tr><th>Product</th><th>Quantity</th><th>Price</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.id || index}><td>{item.product?.name || item.productName || `Product #${item.productId}`}</td><td>{item.quantity}</td><td>{item.unitPrice ?? item.price ?? '—'}</td></tr>)}</tbody></table></div></section>
      {isStatusView && <section className="brand-card order-detail-card order-wide"><h3>Assign warehouse & start processing</h3><p>Choose a warehouse for every product. Current stock is shown before the order is moved to Processing.</p>{allocations.map((allocation, index) => { const productId = items[index]?.productId ?? items[index]?.product?.id; const stock = (stockByWarehouse[allocation.warehouseId] || []).find((row) => String(row.productId ?? row.product_id) === String(productId)); const available = Number(stock?.quantity ?? stock?.currentQuantity ?? 0); return <div className="order-allocation" key={allocation.orderItemId || index}><span>{items[index]?.product?.name || items[index]?.productName || `Item #${allocation.orderItemId}`}<small>Available stock: {allocation.warehouseId ? available : 'Select warehouse'} {allocation.warehouseId && available < Number(allocation.quantity) ? ' — insufficient' : ''}</small></span><select value={allocation.warehouseId} onChange={(event) => changeAllocation(index, 'warehouseId', event.target.value)}><option value="">Select warehouse</option>{warehouses.filter((warehouse) => warehouse.id !== '').map((warehouse) => <option value={warehouse.id} key={warehouse.id}>{warehouse.name}</option>)}</select><input type="number" min="1" value={allocation.quantity} onChange={(event) => changeAllocation(index, 'quantity', event.target.value)} /></div>})}<button className="brand-primary" disabled={saving || !allocations.length} onClick={submitConfirmation}><CheckCircle2 size={16} />Assign & Start Processing</button></section>}
      {isHistoryView && <section className="brand-card order-detail-card order-wide"><h3>Order history</h3>{(order.statusHistory || order.history || order.orderHistories || []).length ? <div className="order-history">{(order.statusHistory || order.history || order.orderHistories).map((entry, index) => <p key={entry.id || index}><strong>{entry.status || entry.toStatus || 'Status updated'}</strong><span>{entry.createdAt || entry.changedAt ? new Date(entry.createdAt || entry.changedAt).toLocaleString() : 'Date not provided'}</span></p>)}</div> : <p>No historical status entries were returned by the API. The current status is <strong>{status}</strong>.</p>}</section>}
    </div>}
  </div></AdminLayout>
}
