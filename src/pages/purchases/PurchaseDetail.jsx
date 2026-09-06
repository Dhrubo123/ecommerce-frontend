import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { getPurchase } from '../../services/purchaseService'
import './purchase.css'

const number = (value) => Number(value || 0)
const money = (value) => `৳${number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const date = (value) => value ? String(value).slice(0, 10) : '—'
const productName = (item) => item.product?.name ?? item.productName ?? item.name ?? `Product #${item.productId ?? '—'}`

export default function PurchaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [purchase, setPurchase] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getPurchase(id).then(setPurchase).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load purchase details.')) }, [id])
  const items = useMemo(() => purchase?.items ?? purchase?.purchaseItems ?? purchase?.details ?? [], [purchase])
  if (error) return <AdminLayout title="Purchase Details"><div className="brand-page"><div className="brand-error">{error}</div></div></AdminLayout>
  if (!purchase) return <AdminLayout title="Purchase Details"><div className="brand-page"><div className="purchase-loading">Loading purchase details…</div></div></AdminLayout>
  const subtotal = number(purchase.subtotal ?? purchase.totalAmount ?? items.reduce((sum, item) => sum + number(item.lineTotal ?? number(item.quantity) * (number(item.unitPrice ?? item.price) - number(item.discountPerUnit ?? item.discount))), 0))
  const itemDiscount = number(purchase.itemDiscountTotal)
  const purchaseDiscount = number(purchase.purchaseDiscount ?? purchase.discount) - itemDiscount
  const shipping = number(purchase.shippingCost)
  const grandTotal = number(purchase.grandTotal ?? subtotal - purchaseDiscount + shipping)
  const paid = number(purchase.paidAmount)
  const due = number(purchase.dueAmount ?? grandTotal - paid)
  return <AdminLayout title="Purchase Details"><div className="brand-page purchase-detail-page"><button className="brand-back" type="button" onClick={() => navigate('/purchases')}><ArrowLeft size={16} />Back to purchases</button><div className="brand-heading"><div><p>INVENTORY & PURCHASE</p><h2>Purchase Details</h2><span>Purchase invoice {purchase.invoiceNumber || `#${purchase.id}`}</span></div><div className="purchase-detail-actions"><Link className="brand-primary" to={`/purchases/${id}/edit`}>Edit Purchase</Link><button type="button" onClick={() => window.print()}><Printer size={16} />Print Invoice</button></div></div>
    <section className="purchase-invoice"><header><div><span>SUPPLIER PURCHASE INVOICE</span><h3>{purchase.invoiceNumber || `Purchase #${purchase.id}`}</h3><p>Purchase date: {date(purchase.purchaseDate ?? purchase.date)}</p></div><FileText size={38} /></header><div className="purchase-parties"><div><span>SUPPLIER</span><strong>{purchase.supplier?.name ?? purchase.supplierName ?? '—'}</strong><p>{purchase.supplier?.phone ?? purchase.supplierPhone ?? ''}</p></div><div><span>WAREHOUSE</span><strong>{purchase.warehouse?.name ?? purchase.warehouseName ?? '—'}</strong><p>{purchase.warehouse?.address ?? purchase.warehouseAddress ?? ''}</p></div><div><span>PAYMENT</span><strong>{purchase.paymentMethod ?? 'Cash'}</strong><p>{purchase.chequeNumber ? `Cheque: ${purchase.chequeNumber}` : purchase.bank?.name ?? ''}</p></div></div><div className="brand-table"><table><thead><tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Discount / Unit</th><th>Line Total</th></tr></thead><tbody>{items.length ? items.map((item, index) => { const quantity = number(item.quantity); const unitPrice = number(item.unitPrice ?? item.price); const discount = number(item.discountPerUnit ?? item.productDiscount ?? item.discount); const lineTotal = number(item.lineTotal ?? quantity * (unitPrice - discount)); return <tr key={item.id ?? index}><td><strong>{productName(item)}</strong></td><td>{quantity}</td><td>{money(unitPrice)}</td><td>{money(discount)}</td><td><strong>{money(lineTotal)}</strong></td></tr> }) : <tr><td colSpan="5">No purchase items available.</td></tr>}</tbody></table></div><div className="purchase-invoice-bottom"><div><span>Notes</span><p>{purchase.notes ?? purchase.note ?? '—'}</p></div><div className="purchase-invoice-totals"><p><span>Items subtotal</span><b>{money(subtotal)}</b></p>{itemDiscount > 0 && <p><span>Item discount</span><b>- {money(itemDiscount)}</b></p>}<p><span>Purchase discount</span><b>- {money(Math.max(0, purchaseDiscount))}</b></p><p><span>Shipping cost</span><b>+ {money(shipping)}</b></p><p className="invoice-grand"><span>Grand total</span><b>{money(grandTotal)}</b></p><p><span>Paid amount</span><b>{money(paid)}</b></p><p className="invoice-due"><span>Due amount</span><b>{money(due)}</b></p></div></div></section>
  </div></AdminLayout>
}
