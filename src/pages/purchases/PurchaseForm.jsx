import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createPurchase, getPurchase, updatePurchase } from '../../services/purchaseService'
import { getSuppliers } from '../../services/supplierService'
import { getWarehouses } from '../../services/warehouseService'
import { getProducts } from '../../services/productService'
import '../brands/brands.css'

const blank = { supplierId: '', warehouseId: '', purchaseDate: new Date().toISOString().slice(0, 10), invoiceNumber: '', notes: '', discount: 0, shippingCost: 0, paidAmount: 0, items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }] }

const asForm = (purchase) => ({
  ...blank,
  ...purchase,
  supplierId: purchase.supplierId ?? purchase.supplier?.id ?? '',
  warehouseId: purchase.warehouseId ?? purchase.warehouse?.id ?? '',
  purchaseDate: String(purchase.purchaseDate ?? blank.purchaseDate).slice(0, 10),
  items: (purchase.items?.length ? purchase.items : blank.items).map((item) => ({ productId: item.productId ?? item.product?.id ?? '', quantity: item.quantity ?? 1, unitPrice: item.unitPrice ?? item.price ?? 0, discount: item.discount ?? 0 })),
})

export default function PurchaseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(blank)
  const [data, setData] = useState({ suppliers: [], warehouses: [], products: [] })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const [suppliers, warehouses, products, purchase] = await Promise.all([getSuppliers(), getWarehouses(), getProducts(), isEdit ? getPurchase(id) : Promise.resolve(null)])
        setData({ suppliers, warehouses, products })
        if (purchase) setForm(asForm(purchase))
      } catch (err) { setError(err.response?.data?.message || 'Unable to load purchase details.') }
    }
    load()
  }, [id, isEdit])

  const field = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const changeItem = (index, key, value) => setForm((current) => ({ ...current, items: current.items.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: key === 'productId' ? value : Number(value) } : row) }))
  const getPayload = () => ({
    ...form,
    supplierId: Number(form.supplierId), warehouseId: Number(form.warehouseId), discount: Number(form.discount), shippingCost: Number(form.shippingCost), paidAmount: Number(form.paidAmount),
    items: form.items.map((row) => ({ ...row, productId: Number(row.productId), quantity: Number(row.quantity), unitPrice: Number(row.unitPrice), discount: Number(row.discount) })),
  })
  const save = async (event) => {
    event.preventDefault()
    if (!form.supplierId || !form.warehouseId || form.items.some((row) => !row.productId)) return setError('Select a supplier, warehouse, and product.')
    try {
      setSaving(true); setError('')
      if (isEdit) await updatePurchase(id, getPayload()); else await createPurchase(getPayload())
      navigate('/purchases')
    } catch (err) { setError(err.response?.data?.message || `Unable to ${isEdit ? 'update' : 'create'} purchase.`) } finally { setSaving(false) }
  }
  const select = (name, value, options, label) => <label>{label}<select name={name} value={value} onChange={field}><option value="">Select {label}</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>

  return <AdminLayout title={isEdit ? 'Edit Purchase' : 'Add Purchase'}>
    <div className="brand-page"><div className="brand-heading"><div><p>INVENTORY & PURCHASE</p><h2>{isEdit ? 'Edit Purchase' : 'Add Purchase'}</h2><span>{isEdit ? 'Update an incoming supplier stock record.' : 'Record incoming supplier stock.'}</span></div></div>
      <form className="brand-form" onSubmit={save}><section><h3>Purchase information</h3>{error && <div className="brand-error">{error}</div>}
        {select('supplierId', form.supplierId, data.suppliers, 'Supplier')}{select('warehouseId', form.warehouseId, data.warehouses, 'Warehouse')}
        <label>Purchase Date<input type="date" name="purchaseDate" value={form.purchaseDate} onChange={field} /></label><label>Invoice Number<input name="invoiceNumber" value={form.invoiceNumber} onChange={field} /></label><label>Notes<textarea name="notes" value={form.notes} onChange={field} /></label>
        <div className="three">{['discount', 'shippingCost', 'paidAmount'].map((key) => <label key={key}>{key}<input type="number" name={key} value={form[key]} onChange={field} /></label>)}</div>
        <h3>Items</h3>{form.items.map((row, index) => <div className="three" key={index}><label>Product<select value={row.productId} onChange={(event) => changeItem(index, 'productId', event.target.value)}><option value="">Select Product</option>{data.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>{['quantity', 'unitPrice', 'discount'].map((key) => <label key={key}>{key}<input type="number" value={row[key]} onChange={(event) => changeItem(index, key, event.target.value)} /></label>)}</div>)}
        <button type="button" onClick={() => setForm((current) => ({ ...current, items: [...current.items, { productId: '', quantity: 1, unitPrice: 0, discount: 0 }] }))}>Add item</button>
        <div className="brand-form-actions"><button type="button" onClick={() => navigate('/purchases')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update Purchase' : 'Save Purchase'}</button></div>
      </section></form>
    </div>
  </AdminLayout>
}
