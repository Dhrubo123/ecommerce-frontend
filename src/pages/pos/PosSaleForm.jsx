import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ImageOff, Minus, Plus, Search, ShoppingCart, Trash2, UserPlus, X } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getBrands } from '../../services/brandService'
import { getCategories } from '../../services/categoryService'
import { createCustomer, getCustomers } from '../../services/customerService'
import { createPosDraft, createPosSale, deletePosDraft } from '../../services/posSaleService'
import { getProducts } from '../../services/productService'
import { getStockReports } from '../../services/stockReportService'
import { getWarehouses } from '../../services/warehouseService'
import './pos.css'

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
const getImage = (product) => {
  const value = product.image?.url || product.image || product.imageUrl || product.productImage?.url || product.productImage || product.thumbnail?.url || product.thumbnail || product.thumbnailImage?.url || product.thumbnailImage || product.thumbnailImages?.[0]?.url || product.thumbnailImages?.[0] || product.images?.[0]?.url || product.images?.[0]
  if (!value || typeof value !== 'string') return ''
  if (/^(https?:|data:|blob:)/i.test(value)) return value
  return `${apiBase}/${value.replace(/^\//, '')}`
}
const priceOf = (product) => Number(product.sellingPrice ?? product.salePrice ?? product.price ?? 0)
const stockOf = (product) => Number(product.stockQuantity ?? product.stock ?? 0)
const warehouseStockOf = (report) => Number(report?.availableQuantity ?? report?.availableStock ?? report?.stockQuantity ?? report?.quantity ?? report?.stock ?? 0)
const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const posDraftKey = 'ecommerce-admin:pos-sale-draft'
const emptySaleForm = { warehouseId: '', customerId: '', paymentMethod: 'cash', note: '', discount: 0, paidAmount: 0 }
const emptyProductFilters = { search: '', categoryId: '', brandId: '' }
const firstOptionId = (product, keys) => { for (const key of keys) { const values = product[key]; const first = Array.isArray(values) ? values[0] : values; const id = Number(first?.id ?? first?.sizeId ?? first?.colorId ?? first); if (Number.isFinite(id) && id > 0) return id } return null }
const saleDateTime = () => {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
const customerName = (customer) => [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || customer?.name || `Customer #${customer?.id}`

export default function PosSaleForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState({ warehouses: [], customers: [], products: [], categories: [], brands: [] })
  const [form, setForm] = useState(emptySaleForm)
  const [cart, setCart] = useState([])
  const [filters, setFilters] = useState(emptyProductFilters)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [stockByProduct, setStockByProduct] = useState({})
  const [loadingWarehouseStock, setLoadingWarehouseStock] = useState(false)
  const [productPage, setProductPage] = useState(1)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', dateOfBirth: '' })
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [resumedDraftId, setResumedDraftId] = useState(null)

  useEffect(() => {
    const draft = location.state?.draft
    if (!draft?.id) {
      // Entering through New POS Sale must never restore a previous cart.
      sessionStorage.removeItem(posDraftKey)
      setForm(emptySaleForm)
      setCart([])
      setFilters(emptyProductFilters)
      setResumedDraftId(null)
      return
    }
    const draftItems = draft.items || draft.orderItems || []
    setForm((current) => ({ ...current, warehouseId: String(draft.warehouseId ?? draft.warehouse?.id ?? ''), customerId: String(draft.customerId ?? draft.customer?.id ?? ''), paymentMethod: draft.paymentMethod || 'cash', discount: draft.discount ?? 0, paidAmount: draft.paidAmount ?? 0, note: draft.note || '' }))
    setCart(draftItems.map((item) => ({ productId: Number(item.productId ?? item.product?.id), name: item.product?.name || item.productName || `Product #${item.productId}`, sku: item.product?.sku || item.sku || '', image: getImage(item.product || item), quantity: Number(item.quantity || 1), unitPrice: Number(item.price ?? item.unitPrice ?? 0), discount: Number(item.discount || 0), stock: Number(item.stock ?? item.availableStock ?? 999999), sizeId: item.sizeId ?? null, colorId: item.colorId ?? null })))
    setResumedDraftId(Number(draft.id))
  }, [location.state])

  useEffect(() => {
    if (form.paymentMethod !== 'cash') setForm((current) => ({ ...current, paymentMethod: 'cash' }))
  }, [form.paymentMethod])

  useEffect(() => {
    Promise.all([getWarehouses(), getCustomers(), getProducts(), getCategories(), getBrands()]).then(([warehouses, customers, products, categories, brands]) => {
      setData({ warehouses, customers, products, categories, brands })
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load POS products and options.')).finally(() => setLoading(false))
  }, [])

  // Draft summaries/items may not include the product image. Once the product
  // catalogue is available, fill missing cart display data from its source.
  useEffect(() => {
    if (!data.products.length) return
    setCart((current) => current.map((item) => {
      const product = data.products.find((entry) => String(entry.id) === String(item.productId))
      if (!product) return item
      return { ...item, name: item.name?.startsWith('Product #') ? product.name : item.name, sku: item.sku || product.sku || '', image: item.image || getImage(product), stock: item.stock ?? availableStock(product) }
    }))
  }, [data.products])

  useEffect(() => {
    if (!form.warehouseId || data.products.length === 0) {
      setStockByProduct({})
      return
    }

    let cancelled = false
    setLoadingWarehouseStock(true)
    getStockReports({ warehouseId: Number(form.warehouseId) }).then((reports) => {
      const stock = reports.reduce((totals, report) => {
        const productId = report.productId ?? report.product?.id ?? report.product?.productId
        if (productId !== undefined && productId !== null) {
          totals[productId] = (totals[productId] || 0) + warehouseStockOf(report)
        }
        return totals
      }, {})
      if (!cancelled) setStockByProduct(stock)
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
    const hasWarehouseStock = !form.warehouseId || Number(stockByProduct[product.id] ?? 0) > 0
    return matchesSearch && hasWarehouseStock && (!filters.categoryId || String(categoryId) === filters.categoryId) && (!filters.brandId || String(brandId) === filters.brandId)
  }).map((product) => form.warehouseId ? { ...product, stockQuantity: Number(stockByProduct[product.id] ?? 0) } : product), [data.products, filters, form.warehouseId, stockByProduct])
  const availableStock = (product) => form.warehouseId ? Number(stockByProduct[product.id] ?? 0) : stockOf(product)
  const productsPerPage = 9
  const totalProductPages = Math.max(1, Math.ceil(products.length / productsPerPage))
  const pageProducts = products.slice((productPage - 1) * productsPerPage, productPage * productsPerPage)

  useEffect(() => { setProductPage(1) }, [filters.search, filters.categoryId, filters.brandId, form.warehouseId])
  useEffect(() => { if (productPage > totalProductPages) setProductPage(totalProductPages) }, [productPage, totalProductPages])

  const selectWarehouse = (warehouseId) => {
    if (warehouseId !== form.warehouseId && cart.length) {
      setCart([])
      setError('Cart cleared because the selling warehouse changed.')
    }
    setForm((current) => ({ ...current, warehouseId }))
  }

  const saveCustomer = async (event) => {
    event.preventDefault()
    if (!newCustomer.firstName.trim() || !newCustomer.lastName.trim() || !newCustomer.phone.trim() || !newCustomer.email.trim() || !newCustomer.password || !newCustomer.dateOfBirth) return setError('Complete all required customer fields before creating the customer.')
    setSavingCustomer(true); setError('')
    try {
      const customer = await createCustomer({ ...newCustomer, gender: 'other', isActive: true })
      setData((current) => ({ ...current, customers: [...current.customers, customer] }))
      setForm((current) => ({ ...current, customerId: String(customer.id) }))
      setNewCustomer({ firstName: '', lastName: '', phone: '', email: '', password: '', dateOfBirth: '' })
      setShowCustomerModal(false)
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create customer.') }
    finally { setSavingCustomer(false) }
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
  useEffect(() => {
    setForm((current) => Number(current.paidAmount) === grandTotal ? current : { ...current, paidAmount: grandTotal })
  }, [grandTotal])

  const saveDraft = async () => {
    if (!form.warehouseId || !form.customerId || cart.length === 0) return setError('Select a warehouse and customer, then add at least one product before saving a draft.')
    try {
      setSavingDraft(true)
      setError('')
      await createPosDraft({
        warehouseId: Number(form.warehouseId),
        customerId: Number(form.customerId),
        saleDate: saleDateTime(),
        paymentMethod: 'cash',
        discount: Number(form.discount || 0),
        paidAmount: grandTotal,
        note: form.note.trim(),
        items: cart.map(({ productId, sizeId, colorId, quantity, unitPrice, discount }) => ({
          productId: Number(productId),
          sizeId: sizeId ? Number(sizeId) : null,
          colorId: colorId ? Number(colorId) : null,
          quantity: Number(quantity),
          price: Number(unitPrice),
          discount: Number(discount || 0),
        })),
      })
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
    const paidAmount = grandTotal
    setSaving(true); setError('')
    try {
      await createPosSale({ warehouseId: Number(form.warehouseId), customerId: Number(form.customerId), paymentMethod: 'cash', discount: Number(form.discount), totalAmount: subtotal, grandTotal, paidAmount, dueAmount: 0, note: form.note.trim(), items: cart.map(({ productId, sizeId, colorId, quantity, unitPrice, discount }) => ({ productId: Number(productId), ...(sizeId ? { sizeId: Number(sizeId) } : {}), ...(colorId ? { colorId: Number(colorId) } : {}), quantity: Number(quantity), price: Number(unitPrice), discount: Number(discount) })) })
      if (resumedDraftId) await deletePosDraft(resumedDraftId)
      sessionStorage.removeItem(posDraftKey)
      navigate('/pos-sales')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to complete POS sale.') }
    finally { setSaving(false) }
  }

  return <AdminLayout title="Point of Sale"><div className="pos-page">
    {error && <div className="pos-alert">{error}</div>}
    {showCustomerModal && <div className="pos-modal-backdrop" role="dialog" aria-modal="true" aria-label="Add customer"><form className="pos-customer-modal" onSubmit={saveCustomer}><button className="pos-modal-close" type="button" onClick={() => setShowCustomerModal(false)}><X size={18} /></button><h3>Add customer</h3><p>Create a customer and select them for this sale.</p><div><label>First name *<input value={newCustomer.firstName} onChange={(event) => setNewCustomer((current) => ({ ...current, firstName: event.target.value }))} autoFocus /></label><label>Last name *<input value={newCustomer.lastName} onChange={(event) => setNewCustomer((current) => ({ ...current, lastName: event.target.value }))} /></label></div><label>Phone *<input value={newCustomer.phone} onChange={(event) => setNewCustomer((current) => ({ ...current, phone: event.target.value }))} /></label><label>Email *<input type="email" value={newCustomer.email} onChange={(event) => setNewCustomer((current) => ({ ...current, email: event.target.value }))} /></label><div><label>Password *<input type="password" value={newCustomer.password} onChange={(event) => setNewCustomer((current) => ({ ...current, password: event.target.value }))} /></label><label>Date of birth *<input type="date" value={newCustomer.dateOfBirth} onChange={(event) => setNewCustomer((current) => ({ ...current, dateOfBirth: event.target.value }))} /></label></div><div className="pos-modal-actions"><button type="button" onClick={() => setShowCustomerModal(false)}>Cancel</button><button className="pos-checkout" disabled={savingCustomer}>{savingCustomer ? 'Creating…' : 'Create Customer'}</button></div></form></div>}
    <div className="pos-workspace">
      <section className="pos-catalog"><div className="pos-section-heading"><div><p>POINT OF SALE</p><h2>Select Products</h2></div><span>{products.length} products</span></div>
        <div className="pos-filters"><select value={filters.brandId} onChange={(event) => setFilters((current) => ({ ...current, brandId: event.target.value }))}><option value="">All brands</option>{data.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select><select value={filters.categoryId} onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}><option value="">All categories</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><label><Search size={18} /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search product name or SKU" /></label></div>
        {loading ? <div className="pos-empty">Loading products…</div> : products.length === 0 ? <div className="pos-empty"><ImageOff size={30} /><strong>No products found</strong><span>Try changing your filters.</span></div> : <><div className="pos-product-grid">{pageProducts.map((product) => { const image = getImage(product); const stock = stockOf(product); return <button className="pos-product" type="button" key={product.id} disabled={stock <= 0} onClick={() => addProduct(product)}><div className="pos-product-image">{image ? <img src={image} alt={product.name} onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling?.classList.add('show') }} /> : null}<span className={image ? '' : 'show'}><ImageOff size={24} /></span>{stock <= 0 && <b>Out of stock</b>}</div><div className="pos-product-info"><strong>{product.name}</strong><small>{product.sku || 'No SKU'}</small><div><span>৳{money(priceOf(product))}</span><em>{stock} in stock</em></div></div></button> })}</div><div className="pos-pagination"><span>Page {productPage} of {totalProductPages}</span><button type="button" disabled={productPage === 1} onClick={() => setProductPage((page) => page - 1)}>Previous</button><button type="button" disabled={productPage === totalProductPages} onClick={() => setProductPage((page) => page + 1)}>Next</button></div></>}
      </section>
      <aside className="pos-cart"><div className="pos-cart-header"><div><ShoppingCart size={20} /><h2>Current Sale</h2></div><span>{cart.reduce((total, item) => total + Number(item.quantity), 0)} items</span></div>
        <div className="pos-customer"><label>Customer *<select value={form.customerId} onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}><option value="">Select customer</option>{data.customers.map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer)} {customer.phone ? `— ${customer.phone}` : ''}</option>)}</select></label><button type="button" title="Add customer" onClick={() => setShowCustomerModal(true)}><UserPlus size={18} /></button></div>
        <label className="pos-field">Sell From Warehouse *<select value={form.warehouseId} onChange={(event) => setForm((current) => ({ ...current, warehouseId: event.target.value }))}><option value="">Select warehouse</option>{data.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label>
        <div className="pos-cart-items">{cart.length === 0 ? <div className="pos-cart-empty"><ShoppingCart size={38} /><strong>Your cart is empty</strong><span>Click a product to add it.</span></div> : cart.map((item) => <article className="pos-cart-item" key={item.productId}><div className="pos-cart-thumb">{item.image ? <img src={item.image} alt="" /> : <ImageOff size={18} />}</div><div className="pos-cart-copy"><strong>{item.name}</strong><small>৳{money(item.unitPrice)} each</small><div className="pos-quantity"><button type="button" onClick={() => item.quantity === 1 ? removeCart(item.productId) : updateCart(item.productId, { quantity: item.quantity - 1 })}><Minus size={14} /></button><span>{item.quantity}</span><button type="button" disabled={item.quantity >= item.stock} onClick={() => updateCart(item.productId, { quantity: item.quantity + 1 })}><Plus size={14} /></button></div></div><div className="pos-cart-price"><strong>৳{money((item.unitPrice * item.quantity) - item.discount)}</strong><button type="button" onClick={() => removeCart(item.productId)}><Trash2 size={15} /></button></div></article>)}</div>
        <div className="pos-payment"><div className="pos-total-row"><span>Subtotal</span><strong>৳{money(subtotal)}</strong></div><label>Order Discount<input type="number" min="0" max={subtotal} value={form.discount} onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))} /></label><div className="pos-total-row grand"><span>Grand Total</span><strong>৳{money(grandTotal)}</strong></div><div className="pos-payment-grid"><label>Payment Method<select value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}><option value="cash">Cash</option><option value="card">Card</option><option value="mobile_banking">Mobile Banking</option></select></label><label>Paid Amount<input type="number" value={grandTotal} readOnly title="POS sales must be paid in full" /></label></div><label>Note<textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Counter sale" /></label><button className="pos-checkout" type="button" disabled={saving || cart.length === 0} onClick={completeSale}>{saving ? 'Completing Sale…' : `Complete Sale · ৳${money(grandTotal)}`}</button></div>
      </aside>
    </div>
  </div></AdminLayout>
}
