import { useEffect, useState } from 'react'
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

  const approvedRequisitions = options.requisitions.filter((requisition) => String(requisition.status || '').toLowerCase() === 'approved')
  const selectRequisition = (requisitionId) => {
    const requisition = approvedRequisitions.find((item) => String(item.id) === String(requisitionId))
    if (!requisition) return setForm((current) => ({ ...current, requisitionId: '' }))
    const items = requisition.items ?? requisition.requisitionItems ?? []
    setError('')
    setForm((current) => ({
      ...current,
      requisitionId: String(requisition.id),
      fromWarehouseId: String(requisition.sourceWarehouseId ?? requisition.sourceWarehouse?.id ?? ''),
      toWarehouseId: String(requisition.requestingWarehouseId ?? requisition.requestingWarehouse?.id ?? ''),
      note: requisition.note ?? '',
      items: items.length ? items.map((item) => ({ productId: String(item.productId ?? item.product?.id ?? ''), quantity: Number(item.quantity ?? 1) })) : current.items,
    }))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.requisitionId || !form.fromWarehouseId || !form.toWarehouseId || form.fromWarehouseId === form.toWarehouseId || form.items.some((item) => !item.productId || Number(item.quantity) <= 0)) {
      setError('Select an approved requisition. Its warehouses and items must be complete.')
      return
    }
    setSaving(true); setError('')
    try {
      await createWarehouseTransfer({ fromWarehouseId: Number(form.fromWarehouseId), toWarehouseId: Number(form.toWarehouseId), requisitionId: Number(form.requisitionId), note: form.note, items: form.items.map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) })) })
      navigate('/warehouse-transfers')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create warehouse transfer.') } finally { setSaving(false) }
  }

  return <AdminLayout title="New Warehouse Transfer"><div className="brand-page"><div className="brand-heading"><div><p>INVENTORY & PURCHASE</p><h2>New Warehouse Transfer</h2><span>Move stock safely between warehouse locations.</span></div></div><form className="brand-form" onSubmit={submit}><section><h3>Transfer information</h3>{error && <div className="brand-error">{error}</div>}
    <label>Approved Requisition *<select required value={form.requisitionId} onChange={(event) => selectRequisition(event.target.value)}><option value="">Select approved requisition</option>{approvedRequisitions.map((requisition) => <option key={requisition.id} value={requisition.id}>#{requisition.id} — {requisition.note || 'Warehouse requisition'}</option>)}</select></label>
    <div className="brand-form-grid"><label>From Warehouse *<select required disabled={!form.requisitionId} value={form.fromWarehouseId} onChange={(event) => setForm((current) => ({ ...current, fromWarehouseId: event.target.value }))}><option value="">Select source warehouse</option>{options.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label><label>To Warehouse *<select required disabled={!form.requisitionId} value={form.toWarehouseId} onChange={(event) => setForm((current) => ({ ...current, toWarehouseId: event.target.value }))}><option value="">Select destination warehouse</option>{options.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label></div>
    <label>Transfer Note <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Transfer for approved requisition" /></label>
    <h3>Transfer Items</h3>{form.items.map((item, index) => <div className="brand-form-grid" key={index}><label>Product *<select required disabled value={item.productId}><option value="">Select product</option>{options.products.map((product) => <option key={product.id} value={product.id}>{product.name} {product.sku ? `(${product.sku})` : ''}</option>)}</select></label><label>Quantity *<input required disabled type="number" min="1" value={item.quantity} /></label></div>)}
    <div className="brand-form-actions"><button type="button" onClick={() => navigate('/warehouse-transfers')}>Cancel</button><button className="brand-primary" disabled={saving || !form.requisitionId}>{saving ? 'Creating…' : 'Create Transfer'}</button></div>
  </section></form></div></AdminLayout>
}
