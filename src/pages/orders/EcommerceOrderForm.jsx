import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createEcommerceOrder } from '../../services/ecommerceOrderService'
import { getProducts } from '../../services/productService'
import { getWarehouses } from '../../services/warehouseService'
import '../brands/brands.css'

const blankItem = () => ({ productId: '', quantity: 1 })
const initialForm = { warehouseId: '', customer: { name: '', phone: '', email: '', address: '' }, paymentMethod: 'cod', shippingCost: 60, discount: 0, note: '', items: [blankItem()] }

export default function EcommerceOrderForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [options, setOptions] = useState({ warehouses: [], products: [] })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { Promise.all([getWarehouses(), getProducts()]).then(([warehouses, products]) => setOptions({ warehouses, products })).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load warehouses or products.')) }, [])
  const customerChange = (event) => setForm((current) => ({ ...current, customer: { ...current.customer, [event.target.name]: event.target.value } }))
  const itemChange = (index, key, value) => setForm((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }))

  const submit = async (event) => {
    event.preventDefault()
    if (!form.warehouseId || !form.customer.name.trim() || !form.customer.phone.trim() || !form.customer.address.trim() || form.items.some((item) => !item.productId || Number(item.quantity) <= 0)) {
      setError('Choose a warehouse, complete the customer delivery details, and add at least one product.')
      return
    }
    setSaving(true); setError('')
    try {
      await createEcommerceOrder({ warehouseId: Number(form.warehouseId), customer: form.customer, paymentMethod: form.paymentMethod, shippingCost: Number(form.shippingCost), discount: Number(form.discount), note: form.note, items: form.items.map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) })) })
      navigate('/orders')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create ecommerce order.') } finally { setSaving(false) }
  }

  return <AdminLayout title="Create Order"><div className="brand-page"><div className="brand-heading"><div><p>ORDER MANAGEMENT</p><h2>Create Order</h2><span>Create an online order with delivery and payment information.</span></div></div><form className="brand-form" onSubmit={submit}><section><h3>Order information</h3>{error && <div className="brand-error">{error}</div>}
    <label>Fulfillment Warehouse *<select value={form.warehouseId} onChange={(event) => setForm((current) => ({ ...current, warehouseId: event.target.value }))}><option value="">Select warehouse</option>{options.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label>
    <div className="brand-form-grid"><label>Payment Method <select value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}><option value="cod">Cash on Delivery</option><option value="cash">Cash</option><option value="card">Card</option><option value="mobile_banking">Mobile Banking</option></select></label><label>Shipping Cost <input type="number" min="0" value={form.shippingCost} onChange={(event) => setForm((current) => ({ ...current, shippingCost: event.target.value }))} /></label></div>
    <label>Order Discount <input type="number" min="0" value={form.discount} onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))} /></label><label>Order Note <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Please call before delivery" /></label>
    <h3>Customer Delivery Details</h3><div className="brand-form-grid"><label>Customer Name *<input name="name" value={form.customer.name} onChange={customerChange} placeholder="Avi Rahman" /></label><label>Phone *<input name="phone" value={form.customer.phone} onChange={customerChange} placeholder="01700000000" /></label></div><div className="brand-form-grid"><label>Email <input name="email" type="email" value={form.customer.email} onChange={customerChange} placeholder="avi@example.com" /></label><label>Address *<input name="address" value={form.customer.address} onChange={customerChange} placeholder="House 10, Road 5, Dhaka" /></label></div>
    <div className="order-items-heading"><h3>Order Items</h3><button type="button" onClick={() => setForm((current) => ({ ...current, items: [...current.items, blankItem()] }))}><Plus size={16} /> Add Product</button></div>{form.items.map((item, index) => <div className="brand-form-grid order-item-row" key={index}><label>Product *<select value={item.productId} onChange={(event) => itemChange(index, 'productId', event.target.value)}><option value="">Select product</option>{options.products.map((product) => <option key={product.id} value={product.id}>{product.name} {product.sku ? `(${product.sku})` : ''}</option>)}</select></label><label>Quantity *<input type="number" min="1" value={item.quantity} onChange={(event) => itemChange(index, 'quantity', event.target.value)} /></label>{form.items.length > 1 && <button className="order-remove" type="button" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}><Minus size={16} /> Remove</button>}</div>)}
    <div className="brand-form-actions"><button type="button" onClick={() => navigate('/orders')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Order'}</button></div>
  </section></form></div></AdminLayout>
}
