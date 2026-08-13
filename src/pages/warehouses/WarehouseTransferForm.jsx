import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { getProducts } from '../../services/productService'
import { getWarehouseRequisitions } from '../../services/warehouseRequisitionService'
import { createWarehouseTransfer } from '../../services/warehouseTransferService'
import { getWarehouses } from '../../services/warehouseService'
import '../brands/brands.css'

const newItem = () => ({ productId: '', quantity: 1 })

export default function WarehouseTransferForm() {
  const navigate = useNavigate()
  const [options, setOptions] = useState({ warehouses: [], products: [], requisitions: [] })
  const [form, setForm] = useState({ fromWarehouseId: '', toWarehouseId: '', requisitionId: '', note: '', items: [newItem()] })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getWarehouses(), getProducts(), getWarehouseRequisitions()]).then(([warehouses, products, requisitions]) => setOptions({ warehouses, products, requisitions })).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load transfer options.'))
  }, [])

  const updateItem = (index, key, value) => setForm((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }))
  const removeItem = (index) => setForm((current) => ({ ...current, items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index) }))

  const submit = async (event) => {
    event.preventDefault()
    if (!form.fromWarehouseId || !form.toWarehouseId || form.fromWarehouseId === form.toWarehouseId || form.items.some((item) => !item.productId || Number(item.quantity) <= 0)) {
      setError('Choose two different warehouses and add at least one product with a quantity greater than zero.')
      return
    }
    setSaving(true); setError('')
    try {
      await createWarehouseTransfer({ fromWarehouseId: Number(form.fromWarehouseId), toWarehouseId: Number(form.toWarehouseId), ...(form.requisitionId ? { requisitionId: Number(form.requisitionId) } : {}), note: form.note, items: form.items.map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) })) })
      navigate('/warehouse-transfers')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create warehouse transfer.') } finally { setSaving(false) }
  }

  return <AdminLayout title="New Warehouse Transfer"><div className="brand-page"><div className="brand-heading"><div><p>INVENTORY & PURCHASE</p><h2>New Warehouse Transfer</h2><span>Move stock safely between warehouse locations.</span></div></div><form className="brand-form" onSubmit={submit}><section><h3>Transfer information</h3>{error && <div className="brand-error">{error}</div>}
    <div className="brand-form-grid"><label>From Warehouse *<select value={form.fromWarehouseId} onChange={(event) => setForm((current) => ({ ...current, fromWarehouseId: event.target.value }))}><option value="">Select source warehouse</option>{options.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label><label>To Warehouse *<select value={form.toWarehouseId} onChange={(event) => setForm((current) => ({ ...current, toWarehouseId: event.target.value }))}><option value="">Select destination warehouse</option>{options.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label></div>
    <label>Approved Requisition <select value={form.requisitionId} onChange={(event) => setForm((current) => ({ ...current, requisitionId: event.target.value }))}><option value="">No requisition (manual transfer)</option>{options.requisitions.map((requisition) => <option key={requisition.id} value={requisition.id}>#{requisition.id} — {requisition.note || 'Warehouse requisition'}</option>)}</select></label><label>Transfer Note <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Transfer for approved requisition" /></label>
    <h3>Transfer Items</h3>{form.items.map((item, index) => <div className="brand-form-grid" key={index}><label>Product *<select value={item.productId} onChange={(event) => updateItem(index, 'productId', event.target.value)}><option value="">Select product</option>{options.products.map((product) => <option key={product.id} value={product.id}>{product.name} {product.sku ? `(${product.sku})` : ''}</option>)}</select></label><label>Quantity *<input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} /></label>{form.items.length > 1 && <button type="button" aria-label="Remove item" onClick={() => removeItem(index)}><Minus size={16} /> Remove item</button>}</div>)}
    <button type="button" onClick={() => setForm((current) => ({ ...current, items: [...current.items, newItem()] }))}><Plus size={16} /> Add product</button><div className="brand-form-actions"><button type="button" onClick={() => navigate('/warehouse-transfers')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Transfer'}</button></div>
  </section></form></div></AdminLayout>
}
