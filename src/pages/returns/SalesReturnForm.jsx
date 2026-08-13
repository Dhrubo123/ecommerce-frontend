import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { getEcommerceOrders } from '../../services/ecommerceOrderService'
import { getPosSales } from '../../services/posSaleService'
import { getProducts } from '../../services/productService'
import { createSalesReturn } from '../../services/salesReturnService'
import '../brands/brands.css'
import './sales-returns.css'

const blankItem = () => ({ productId: '', quantity: 1 })

export default function SalesReturnForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ sourceType: 'pos_sale', sourceId: '', returnDate: new Date().toISOString().slice(0, 10), reason: '', items: [blankItem()] })
  const [options, setOptions] = useState({ posSales: [], ecommerceOrders: [], products: [] })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getPosSales(), getEcommerceOrders(), getProducts()]).then(([posSales, ecommerceOrders, products]) => setOptions({ posSales, ecommerceOrders, products })).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load sales return options.'))
  }, [])

  const sources = form.sourceType === 'pos_sale' ? options.posSales : options.ecommerceOrders
  const updateItem = (index, key, value) => setForm((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }))

  const submit = async (event) => {
    event.preventDefault()
    if (!form.sourceId || !form.returnDate || !form.reason.trim() || form.items.some((item) => !item.productId || Number(item.quantity) <= 0)) {
      setError('Select a source sale, enter the return reason, and add at least one valid product.')
      return
    }
    setSaving(true); setError('')
    try {
      await createSalesReturn({ sourceType: form.sourceType, sourceId: Number(form.sourceId), returnDate: form.returnDate, reason: form.reason.trim(), items: form.items.map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) })) })
      navigate('/sales-returns')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create sales return.') }
    finally { setSaving(false) }
  }

  return <AdminLayout title="Add Sales Return"><div className="brand-page"><div className="brand-heading"><div><p>ORDER MANAGEMENT</p><h2>Add Sales Return</h2><span>Return products from a completed POS or ecommerce sale.</span></div></div>
    <form className="brand-form sales-return-form" onSubmit={submit}><section><h3>Return information</h3>{error && <div className="brand-error">{error}</div>}
      <div className="return-grid"><label>Source Type *<select value={form.sourceType} onChange={(event) => setForm((current) => ({ ...current, sourceType: event.target.value, sourceId: '' }))}><option value="pos_sale">POS Sale</option><option value="ecommerce_order">Ecommerce Order</option></select></label><label>Source Sale *<select value={form.sourceId} onChange={(event) => setForm((current) => ({ ...current, sourceId: event.target.value }))}><option value="">Select {form.sourceType === 'pos_sale' ? 'POS sale' : 'ecommerce order'}</option>{sources.map((source) => <option key={source.id} value={source.id}>#{source.orderNumber || source.id} — {source.customer?.name || source.customerName || 'Customer'}</option>)}</select></label></div>
      <label>Return Date *<input type="date" value={form.returnDate} onChange={(event) => setForm((current) => ({ ...current, returnDate: event.target.value }))} /></label><label>Reason *<textarea value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Customer received a damaged item" /></label>
      <div className="return-items-heading"><h3>Returned Items</h3><button type="button" onClick={() => setForm((current) => ({ ...current, items: [...current.items, blankItem()] }))}><Plus size={16} />Add Product</button></div>
      {form.items.map((item, index) => <div className="return-item" key={index}><label>Product *<select value={item.productId} onChange={(event) => updateItem(index, 'productId', event.target.value)}><option value="">Select product</option>{options.products.map((product) => <option key={product.id} value={product.id}>{product.name} {product.sku ? `(${product.sku})` : ''}</option>)}</select></label><label>Quantity *<input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} /></label>{form.items.length > 1 && <button className="return-remove" type="button" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}><Minus size={16} />Remove</button>}</div>)}
      <div className="brand-form-actions"><button type="button" onClick={() => navigate('/sales-returns')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : 'Create Sales Return'}</button></div>
    </section><aside><span>RETURN SUMMARY</span><div className="return-summary"><strong>{form.sourceType === 'pos_sale' ? 'POS Sale' : 'Ecommerce Order'}</strong><p>Source: {form.sourceId ? `#${form.sourceId}` : 'Not selected'}</p><p>Date: {form.returnDate || 'Not selected'}</p><p>Products: {form.items.filter((item) => item.productId).length}</p><p>Total quantity: {form.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)}</p></div></aside></form>
  </div></AdminLayout>
}
