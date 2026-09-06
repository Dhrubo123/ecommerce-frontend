import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { getEcommerceOrder } from '../../services/ecommerceOrderService'
import './orders.css'

const number = (value) => Number(value || 0)
const money = (value) => `৳${number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const date = (value) => value ? new Date(value).toLocaleDateString() : '—'

export default function OrderInvoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getEcommerceOrder(id).then(setOrder).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load the order invoice.')) }, [id])
  const items = useMemo(() => order?.items ?? order?.orderItems ?? [], [order])
  if (error) return <AdminLayout title="Order Invoice"><div className="brand-page"><div className="brand-error">{error}</div></div></AdminLayout>
  if (!order) return <AdminLayout title="Order Invoice"><div className="brand-page"><div className="purchase-loading">Loading invoice…</div></div></AdminLayout>
  const customer = order.customer ?? {}
  const subtotal = number(order.subtotal ?? order.totalAmount ?? items.reduce((sum, item) => sum + number(item.lineTotal ?? number(item.quantity) * number(item.unitPrice ?? item.price)), 0))
  const discount = number(order.discount)
  const shipping = number(order.shippingCost)
  const grandTotal = number(order.grandTotal ?? subtotal - discount + shipping)
  return <AdminLayout title="Order Invoice"><div className="brand-page order-invoice-page"><button className="brand-back" type="button" onClick={() => navigate('/orders')}><ArrowLeft size={16} />Back to Orders</button><div className="brand-heading"><div><p>ORDER MANAGEMENT</p><h2>Order Invoice</h2><span>{order.orderNumber || `Order #${order.id}`}</span></div><button className="brand-primary invoice-print" type="button" onClick={() => window.print()}><Printer size={16} />Print Invoice</button></div><section className="order-invoice"><header><div><span>ECOMMERCE ORDER INVOICE</span><h3>{order.orderNumber || `Order #${order.id}`}</h3><p>Order date: {date(order.createdAt ?? order.orderDate)}</p></div><b>{String(order.status ?? 'pending').replaceAll('_', ' ')}</b></header><div className="order-invoice-parties"><div><span>CUSTOMER</span><strong>{customer.name ?? order.customerName ?? '—'}</strong><p>{customer.phone ?? order.phone ?? ''}</p><p>{customer.email ?? order.email ?? ''}</p><p>{customer.address ?? order.address ?? ''}</p></div><div><span>DELIVERY WAREHOUSE</span><strong>{order.warehouse?.name ?? order.warehouseName ?? '—'}</strong><p>{order.warehouse?.address ?? ''}</p></div><div><span>PAYMENT</span><strong>{order.paymentMethod ?? '—'}</strong><p>{order.paymentStatus ?? order.payment_status ?? '—'}</p></div></div><div className="brand-table"><table><thead><tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead><tbody>{items.length ? items.map((item, index) => { const quantity = number(item.quantity); const price = number(item.unitPrice ?? item.price); const itemDiscount = number(item.discount); const total = number(item.lineTotal ?? quantity * price - itemDiscount); return <tr key={item.id ?? index}><td><strong>{item.product?.name ?? item.productName ?? `Product #${item.productId}`}</strong></td><td>{quantity}</td><td>{money(price)}</td><td>{money(itemDiscount)}</td><td><strong>{money(total)}</strong></td></tr> }) : <tr><td colSpan="5">No order items available.</td></tr>}</tbody></table></div><div className="order-invoice-bottom"><div><span>Note</span><p>{order.note ?? '—'}</p></div><div className="order-invoice-totals"><p><span>Subtotal</span><b>{money(subtotal)}</b></p><p><span>Order discount</span><b>- {money(discount)}</b></p><p><span>Shipping cost</span><b>+ {money(shipping)}</b></p><p className="invoice-grand"><span>Grand total</span><b>{money(grandTotal)}</b></p></div></div></section></div></AdminLayout>
}
