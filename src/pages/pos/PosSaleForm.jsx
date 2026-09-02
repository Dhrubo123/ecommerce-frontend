import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ImageOff, Minus, Plus, Search, ShoppingCart, Trash2, UserPlus } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getBrands } from '../../services/brandService'
import { getCategories } from '../../services/categoryService'
import { getCustomers } from '../../services/customerService'
import { createPosDraft, createPosSale } from '../../services/posSaleService'
import { getProducts } from '../../services/productService'
import { getStockReports } from '../../services/stockReportService'
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
const warehouseStockOf = (report) => Number(report?.availableQuantity ?? report?.availableStock ?? report?.stockQuantity ?? report?.quantity ?? report?.stock ?? 0)
const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const posDraftKey = 'ecommerce-admin:pos-sale-draft'
const getDraft = () => { try { return JSON.parse(sessionStorage.getItem(posDraftKey) || 'null') || {} } catch { return {} } }
const firstOptionId = (product, keys) => { for (const key of keys) { const values = product[key]; const first = Array.isArray(values) ? values[0] : values; const id = Number(first?.id ?? first?.sizeId ?? first?.colorId ?? first); if (Number.isFinite(id) && id > 0) return id } return null }

export default function PosSaleForm() {
  const navigate = useNavigate()
  const [data, setData] = useState({ warehouses: [], customers: [], products: [], categories: [], brands: [] })
  const [form, setForm] = useState(() => ({ warehouseId: '', customerId: '', paymentMethod: 'cash', note: '', discount: 0, paidAmount: 0, ...getDraft().form }))
  const [cart, setCart] = useState(() => getDraft().cart || [])
  const [filters, setFilters] = useState(() => ({ search: '', categoryId: '', brandId: '', ...getDraft().filters }))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [stockByProduct, setStockByProduct] = useState({})
  const [loadingWarehouseStock, setLoadingWarehouseStock] = useState(false)

  useEffect(() => {
    if (form.paymentMethod !== 'cash') setForm((current) => ({ ...current, paymentMethod: 'cash' }))
  }, [form.paymentMethod])

  useEffect(() => {
    Promise.all([getWarehouses(), getCustomers(), getProducts(), getCategories(), getBrands()]).then(([warehouses, customers, products, categories, brands]) => {
      setData({ warehouses, customers, products, categories, brands })
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load POS products and options.')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!form.warehouseId || data.products.length === 0) {
      setStockByProduct({})
      return
    }

    let cancelled = false
    setLoadingWarehouseStock(true)
    Promise.all(data.products.map(async (product) => {
      const reports = await getStockReports({ warehouseId: Number(form.warehouseId), productId: Number(product.id) })
      const report = Array.isArray(reports) ? reports[0] : reports
      return [product.id, warehouseStockOf(report)]
    })).then((entries) => {
      if (!cancelled) setStockByProduct(Object.fromEntries(entries))
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.response?.data?.message || 'Unable to load stock for the selected warehouse.')
    }).finally(() => { if (!cancelled) setLoadingWarehouseStock(false) })

    return () => { cancelled = true }
  }, [form.warehouseId, data.products])

  useEffect(() => {
    sessionStorage.setItem(posDraftKey, JSON.stringify({ form, cart, filters }))
  }, [form, cart, filters])

  const products = useMemo(() => data.products.filter((product) => {
    const query = filters.search.toLowerCase().trim()
    const matchesSearch = !query || product.name?.toLowerCase().includes(query) || product.sku?.toLowerCase().includes(query)
    const categoryId = product.categoryId ?? product.category?.id
    const brandId = product.brandId ?? product.brand?.id
    return matchesSearch && (!filters.categoryId || String(categoryId) === filters.categoryId) && (!filters.brandId || String(brandId) === filters.brandId)
  }).map((product) => form.warehouseId ? { ...product, stockQuantity: Number(stockByProduct[product.id] ?? 0) } : product), [data.products, filters, form.warehouseId, stockByProduct])
  const availableStock = (product) => form.warehouseId ? Number(stockByProduct[product.id] ?? 0) : stockOf(product)

  const selectWarehouse = (warehouseId) => {
    if (warehouseId !== form.warehouseId && cart.length) {
      setCart([])
      setError('Cart cleared because the selling warehouse changed.')
    }
    setForm((current) => ({ ...current, warehouseId }))
  }

  const addProduct = (product) => {
    const warehouseStock = availableStock(product)
    if (!form.warehouseId) return setError('Select the selling warehouse before adding products.')
    if (warehouseStock <= 0) return
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id)
      if (existing) return current.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, warehouseStock) } : item)
      return [...current, { productId: product.id, name: product.name, sku: product.sku, image: getImage(product), quantity: 1, unitPrice: priceOf(product), discount: 0, stock: warehouseStock, sizeId: firstOptionId(product, ['sizes', 'sizeIds', 'sizeId']), colorId: firstOptionId(product, ['colors', 'colorIds', 'colorId']) }]
    })
  }

  const updateCart = (productId, changes) => setCart((current) => current.map((item) => item.productId === productId ? { ...item, ...changes } : item))
  const removeCart = (productId) => setCart((current) => current.filter((item) => item.productId !== productId))
  const subtotal = cart.reduce((total, item) => total + (Number(item.unitPrice) * Number(item.quantity)) - Number(item.discount || 0), 0)
  const grandTotal = Math.max(0, subtotal - Number(form.discount || 0))
  const selectedCustomer = data.customers.find((customer) => String(customer.id) === String(form.customerId))
  const isWalkInCustomer = /walk[\s-]*in/i.test(selectedCustomer?.name || '')

  useEffect(() => {
    if (isWalkInCustomer) setForm((current) => Number(current.paidAmount) === grandTotal ? current : { ...current, paidAmount: grandTotal })
  }, [isWalkInCustomer, grandTotal])

  const saveDraft = async () => {
    if (!form.warehouseId || cart.length === 0) return setError('Select a warehouse and add at least one product before saving a draft.')
    try {
      setSavingDraft(true)
      setError('')
      await createPosDraft({ warehouseId: Number(form.warehouseId), ...(form.customerId ? { customerId: Number(form.customerId) } : {}), paymentMethod: 'cash', discount: Number(form.discount), totalAmount: subtotal, grandTotal, paidAmount: Number(form.paidAmount), dueAmount: Math.max(0, grandTotal - Number(form.paidAmount || 0)), note: form.note.trim(), items: cart.map(({ productId, sizeId, colorId, quantity, unitPrice, discount }) => ({ productId: Number(productId), ...(sizeId ? { sizeId: Number(sizeId) } : {}), ...(colorId ? { colorId: Number(colorId) } : {}), quantity: Number(quantity), price: Number(unitPrice), discount: Number(discount) })) })
      navigate('/pos-sales/drafts')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save POS draft.') }
    finally { setSavingDraft(false) }
  }

  useEffect(() => {
    const handleSaveDraft = () => { if (!savingDraft && !saving) saveDraft() }
    window.addEventListener('pos:save-draft', handleSaveDraft)
    return () => window.removeEventListener('pos:save-draft', handleSaveDraft)
  }, [savingDraft, saving, form, cart, subtotal, grandTotal])

  useEffect(() => {
    const paymentPanel = document.querySelector('.pos-payment')
    const checkoutButton = paymentPanel?.querySelector('.pos-checkout')
    if (!paymentPanel || !checkoutButton) return undefined
    const draftsButton = document.createElement('button')
    draftsButton.type = 'button'
    draftsButton.className = 'pos-view-drafts'
    draftsButton.textContent = 'Save Current Sale as Draft'
    const saveCurrentSale = () => window.dispatchEvent(new CustomEvent('pos:save-draft'))
    draftsButton.addEventListener('click', saveCurrentSale)
    paymentPanel.insertBefore(draftsButton, checkoutButton)
    return () => { draftsButton.removeEventListener('click', saveCurrentSale); draftsButton.remove() }
  }, [navigate])

  const completeSale = async () => {
    if (!form.warehouseId || !form.customerId || cart.length === 0) {
      setError('Select a warehouse and customer, then add at least one product to the cart.')
      return
    }
    const paidAmount = isWalkInCustomer ? grandTotal : Number(form.paidAmount)
    if (paidAmount > grandTotal) {
      setError('Paid amount cannot exceed the grand total.')
      return
    }
    setSaving(true); setError('')
    try {
      await createPosSale({ warehouseId: Number(form.warehouseId), customerId: Number(form.customerId), paymentMethod: 'cash', discount: Number(form.discount), totalAmount: subtotal, grandTotal, paidAmount, dueAmount: Math.max(0, grandTotal - paidAmount), note: form.note.trim(), items: cart.map(({ productId, sizeId, colorId, quantity, unitPrice, discount }) => ({ productId: Number(productId), ...(sizeId ? { sizeId: Number(sizeId) } : {}), ...(colorId ? { colorId: Number(colorId) } : {}), quantity: Number(quantity), price: Number(unitPrice), discount: Number(discount) })) })
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
        <label className="pos-field">Sell From Warehouse *<select value={form.warehouseId} onChange={(event) => setForm((current) => ({ ...current, warehouseId: event.target.value }))}><option value="">Select warehouse</option>{data.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label>
        <div className="pos-cart-items">{cart.length === 0 ? <div className="pos-cart-empty"><ShoppingCart size={38} /><strong>Your cart is empty</strong><span>Click a product to add it.</span></div> : cart.map((item) => <article className="pos-cart-item" key={item.productId}><div className="pos-cart-thumb">{item.image ? <img src={item.image} alt="" /> : <ImageOff size={18} />}</div><div className="pos-cart-copy"><strong>{item.name}</strong><small>৳{money(item.unitPrice)} each</small><div className="pos-quantity"><button type="button" onClick={() => item.quantity === 1 ? removeCart(item.productId) : updateCart(item.productId, { quantity: item.quantity - 1 })}><Minus size={14} /></button><span>{item.quantity}</span><button type="button" disabled={item.quantity >= item.stock} onClick={() => updateCart(item.productId, { quantity: item.quantity + 1 })}><Plus size={14} /></button></div></div><div className="pos-cart-price"><strong>৳{money((item.unitPrice * item.quantity) - item.discount)}</strong><button type="button" onClick={() => removeCart(item.productId)}><Trash2 size={15} /></button></div></article>)}</div>
        <div className="pos-payment"><div className="pos-total-row"><span>Subtotal</span><strong>৳{money(subtotal)}</strong></div><label>Order Discount<input type="number" min="0" max={subtotal} value={form.discount} onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))} /></label><div className="pos-total-row grand"><span>Grand Total</span><strong>৳{money(grandTotal)}</strong></div><div className="pos-payment-grid"><label>Payment Method<select value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}><option value="cash">Cash</option><option value="card">Card</option><option value="mobile_banking">Mobile Banking</option></select></label><label>Paid Amount<input type="number" min="0" max={grandTotal} value={form.paidAmount} onChange={(event) => setForm((current) => ({ ...current, paidAmount: event.target.value }))} /></label></div><label>Note<textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Counter sale" /></label><button className="pos-checkout" type="button" disabled={saving || cart.length === 0} onClick={completeSale}>{saving ? 'Completing Sale…' : `Complete Sale · ৳${money(grandTotal)}`}</button></div>
      </aside>
    </div>
  </div></AdminLayout>
}
