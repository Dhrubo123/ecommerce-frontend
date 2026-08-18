import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ImageOff, Minus, Plus, Search, ShoppingCart, Trash2, UserPlus } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getBrands } from '../../services/brandService'
import { getCategories } from '../../services/categoryService'
import { getCustomers } from '../../services/customerService'
import { createPosSale } from '../../services/posSaleService'
import { getProducts } from '../../services/productService'
import { getWarehouses } from '../../services/warehouseService'
import './pos.css'

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
const getImage = (product) => {
  const value = product.image?.url || product.image || product.thumbnailImage?.url || product.thumbnailImage || product.thumbnailImages?.[0]?.url || product.thumbnailImages?.[0]
  if (!value || typeof value !== 'string') return ''
  if (/^(https?:|data:|blob:)/i.test(value)) return value
  return `${apiBase}/${value.replace(/^\//, '')}`
}
const priceOf = (product) => Number(product.sellingPrice ?? product.salePrice ?? product.price ?? 0)
const stockOf = (product) => Number(product.stockQuantity ?? product.stock ?? 0)
const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const posDraftKey = 'ecommerce-admin:pos-sale-draft'
const getDraft = () => { try { return JSON.parse(sessionStorage.getItem(posDraftKey) || 'null') || {} } catch { return {} } }

export default function PosSaleForm() {
  const navigate = useNavigate()
  const [data, setData] = useState({ warehouses: [], customers: [], products: [], categories: [], brands: [] })
  const [form, setForm] = useState(() => ({ warehouseId: '', customerId: '', paymentMethod: 'cash', note: '', discount: 0, paidAmount: 0, ...getDraft().form }))
  const [cart, setCart] = useState(() => getDraft().cart || [])
  const [filters, setFilters] = useState(() => ({ search: '', categoryId: '', brandId: '', ...getDraft().filters }))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getWarehouses(), getCustomers(), getProducts(), getCategories(), getBrands()]).then(([warehouses, customers, products, categories, brands]) => {
      setData({ warehouses, customers, products, categories, brands })
      setForm((current) => ({ ...current, warehouseId: current.warehouseId || String(warehouses[0]?.id || '') }))
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load POS products and options.')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    sessionStorage.setItem(posDraftKey, JSON.stringify({ form, cart, filters }))
  }, [form, cart, filters])

  const products = useMemo(() => data.products.filter((product) => {
    const query = filters.search.toLowerCase().trim()
    const matchesSearch = !query || product.name?.toLowerCase().includes(query) || product.sku?.toLowerCase().includes(query)
    const categoryId = product.categoryId ?? product.category?.id
    const brandId = product.brandId ?? product.brand?.id
    return matchesSearch && (!filters.categoryId || String(categoryId) === filters.categoryId) && (!filters.brandId || String(brandId) === filters.brandId)
  }), [data.products, filters])

  const addProduct = (product) => {
    if (stockOf(product) <= 0) return
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id)
      if (existing) return current.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, stockOf(product)) } : item)
      return [...current, { productId: product.id, name: product.name, sku: product.sku, image: getImage(product), quantity: 1, unitPrice: priceOf(product), discount: 0, stock: stockOf(product) }]
    })
  }

  const updateCart = (productId, changes) => setCart((current) => current.map((item) => item.productId === productId ? { ...item, ...changes } : item))
  const removeCart = (productId) => setCart((current) => current.filter((item) => item.productId !== productId))
  const subtotal = cart.reduce((total, item) => total + (Number(item.unitPrice) * Number(item.quantity)) - Number(item.discount || 0), 0)
  const grandTotal = Math.max(0, subtotal - Number(form.discount || 0))

  const completeSale = async () => {
    if (!form.warehouseId || !form.customerId || cart.length === 0) {
      setError('Select a warehouse and customer, then add at least one product to the cart.')
      return
    }
    if (Number(form.paidAmount) > grandTotal) {
      setError('Paid amount cannot exceed the grand total.')
      return
    }
    setSaving(true); setError('')
    try {
      await createPosSale({ warehouseId: Number(form.warehouseId), customerId: Number(form.customerId), paymentMethod: form.paymentMethod, note: form.note.trim(), discount: Number(form.discount), paidAmount: Number(form.paidAmount), items: cart.map(({ productId, quantity, unitPrice, discount }) => ({ productId: Number(productId), quantity: Number(quantity), unitPrice: Number(unitPrice), discount: Number(discount) })) })
      sessionStorage.removeItem(posDraftKey)
      navigate('/pos-sales')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to complete POS sale.') }
    finally { setSaving(false) }
  }

  return <AdminLayout title="Point of Sale"><div className="pos-page">
    {error && <div className="pos-alert">{error}</div>}
    <div className="pos-workspace">
      <section className="pos-catalog"><div className="pos-section-heading"><div><p>POINT OF SALE</p><h2>Select Products</h2></div><span>{products.length} products</span></div>
        <div className="pos-filters"><select value={filters.brandId} onChange={(event) => setFilters((current) => ({ ...current, brandId: event.target.value }))}><option value="">All brands</option>{data.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select><select value={filters.categoryId} onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}><option value="">All categories</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><label><Search size={18} /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search product name or SKU" /></label></div>
        {loading ? <div className="pos-empty">Loading products…</div> : products.length === 0 ? <div className="pos-empty"><ImageOff size={30} /><strong>No products found</strong><span>Try changing your filters.</span></div> : <div className="pos-product-grid">{products.map((product) => { const image = getImage(product); const stock = stockOf(product); return <button className="pos-product" type="button" key={product.id} disabled={stock <= 0} onClick={() => addProduct(product)}><div className="pos-product-image">{image ? <img src={image} alt={product.name} onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling?.classList.add('show') }} /> : null}<span className={image ? '' : 'show'}><ImageOff size={24} /></span>{stock <= 0 && <b>Out of stock</b>}</div><div className="pos-product-info"><strong>{product.name}</strong><small>{product.sku || 'No SKU'}</small><div><span>৳{money(priceOf(product))}</span><em>{stock} in stock</em></div></div></button> })}</div>}
      </section>
      <aside className="pos-cart"><div className="pos-cart-header"><div><ShoppingCart size={20} /><h2>Current Sale</h2></div><span>{cart.reduce((total, item) => total + Number(item.quantity), 0)} items</span></div>
        <div className="pos-customer"><label>Customer *<select value={form.customerId} onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}><option value="">Select customer</option>{data.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} {customer.phone ? `— ${customer.phone}` : ''}</option>)}</select></label><Link to="/customers/create?returnTo=/pos-sales/create" title="Add customer"><UserPlus size={18} /></Link></div>
        <label className="pos-field">Warehouse *<select value={form.warehouseId} onChange={(event) => setForm((current) => ({ ...current, warehouseId: event.target.value }))}><option value="">Select warehouse</option>{data.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label>
        <div className="pos-cart-items">{cart.length === 0 ? <div className="pos-cart-empty"><ShoppingCart size={38} /><strong>Your cart is empty</strong><span>Click a product to add it.</span></div> : cart.map((item) => <article className="pos-cart-item" key={item.productId}><div className="pos-cart-thumb">{item.image ? <img src={item.image} alt="" /> : <ImageOff size={18} />}</div><div className="pos-cart-copy"><strong>{item.name}</strong><small>৳{money(item.unitPrice)} each</small><div className="pos-quantity"><button type="button" onClick={() => item.quantity === 1 ? removeCart(item.productId) : updateCart(item.productId, { quantity: item.quantity - 1 })}><Minus size={14} /></button><span>{item.quantity}</span><button type="button" disabled={item.quantity >= item.stock} onClick={() => updateCart(item.productId, { quantity: item.quantity + 1 })}><Plus size={14} /></button></div></div><div className="pos-cart-price"><strong>৳{money((item.unitPrice * item.quantity) - item.discount)}</strong><button type="button" onClick={() => removeCart(item.productId)}><Trash2 size={15} /></button></div></article>)}</div>
        <div className="pos-payment"><div className="pos-total-row"><span>Subtotal</span><strong>৳{money(subtotal)}</strong></div><label>Order Discount<input type="number" min="0" max={subtotal} value={form.discount} onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))} /></label><div className="pos-total-row grand"><span>Grand Total</span><strong>৳{money(grandTotal)}</strong></div><div className="pos-payment-grid"><label>Payment Method<select value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}><option value="cash">Cash</option><option value="card">Card</option><option value="mobile_banking">Mobile Banking</option></select></label><label>Paid Amount<input type="number" min="0" max={grandTotal} value={form.paidAmount} onChange={(event) => setForm((current) => ({ ...current, paidAmount: event.target.value }))} /></label></div><label>Note<textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Counter sale" /></label><button className="pos-checkout" type="button" disabled={saving || cart.length === 0} onClick={completeSale}>{saving ? 'Completing Sale…' : `Complete Sale · ৳${money(grandTotal)}`}</button></div>
      </aside>
    </div>
  </div></AdminLayout>
}
