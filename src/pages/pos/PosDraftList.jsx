import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getCustomers } from '../../services/customerService'
import { deletePosDraft, getPosDraft, getPosDrafts } from '../../services/posSaleService'
import { getWarehouses } from '../../services/warehouseService'
import '../brands/brands.css'

export default function PosDraftList() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState({ warehouses: [], customers: [] })
  const [filters, setFilters] = useState({ search: '', warehouseId: '', customerId: '', from: '', to: '' })
  const load = () => { setLoading(true); getPosDrafts().then((data) => { setDrafts(data); setError('') }).catch((err) => setError(err.response?.data?.message || 'Unable to load POS drafts.')).finally(() => setLoading(false)) }
  useEffect(() => { load(); Promise.all([getWarehouses(), getCustomers()]).then(([warehouses, customers]) => setOptions({ warehouses, customers })).catch(() => {}) }, [])
  const remove = async (id) => { if (!window.confirm('Delete this POS draft?')) return; try { await deletePosDraft(id); load() } catch (err) { setError(err.response?.data?.message || 'Unable to delete POS draft.') } }
  const customerName = (customer) => [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || customer?.name || ''
  const dateValue = (draft) => String(draft.updatedAt ?? draft.createdAt ?? draft.draftDate ?? '').slice(0, 10)
  const visible = useMemo(() => drafts.filter((draft) => { const text = `${draft.id} ${customerName(draft.customer) || draft.customerName || ''}`.toLowerCase(); const date = dateValue(draft); return (!filters.search || text.includes(filters.search.toLowerCase())) && (!filters.warehouseId || String(draft.warehouseId ?? draft.warehouse?.id) === filters.warehouseId) && (!filters.customerId || String(draft.customerId ?? draft.customer?.id) === filters.customerId) && (!filters.from || date >= filters.from) && (!filters.to || date <= filters.to) }), [drafts, filters])
  const change = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const resume = async (draft) => {
    try {
      setError('')
      const response = await getPosDraft(draft.id)
      const fullDraft = response.draft ?? response
      navigate('/pos-sales/create', { state: { draft: { ...draft, ...fullDraft, items: fullDraft.items ?? fullDraft.orderItems ?? [] } } })
    } catch (err) { setError(err.response?.data?.message || 'Unable to load the draft items. Please try again.') }
  }
  return <AdminLayout title="POS Drafts"><div className="brand-page"><div className="brand-heading"><div><p>POINT OF SALE</p><h2>POS Drafts</h2><span>Park an unfinished customer sale and resume it later.</span></div><Link className="brand-primary" to="/pos-sales/create"><Plus size={17} />New POS Sale</Link></div><section className="brand-card"><div className="order-filters"><label><Search size={17} /><input value={filters.search} onChange={(event) => change('search', event.target.value)} placeholder="Search draft or customer" /></label><label>Warehouse<select value={filters.warehouseId} onChange={(event) => change('warehouseId', event.target.value)}><option value="">All warehouses</option>{options.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label><label>Customer<select value={filters.customerId} onChange={(event) => change('customerId', event.target.value)}><option value="">All customers</option>{options.customers.map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer)}</option>)}</select></label><label>From date<input type="date" value={filters.from} onChange={(event) => change('from', event.target.value)} /></label><label>To date<input type="date" min={filters.from} value={filters.to} onChange={(event) => change('to', event.target.value)} /></label></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Draft</th><th>Customer</th><th>Warehouse</th><th>Items</th><th>Total</th><th>Updated</th><th>Action</th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Loading drafts…</td></tr> : visible.length === 0 ? <tr><td colSpan="7">No POS drafts match these filters.</td></tr> : visible.map((draft) => <tr key={draft.id}><td>#{draft.id}</td><td>{customerName(draft.customer) || draft.customerName || 'Walk-in customer'}</td><td>{draft.warehouse?.name || draft.warehouseName || '—'}</td><td>{draft.items?.length ?? draft.orderItems?.length ?? draft.itemCount ?? 0}</td><td>{draft.grandTotal ?? draft.totalAmount ?? 0}</td><td>{dateValue(draft) || '—'}</td><td><div className="brand-actions"><button type="button" title="Resume draft" onClick={() => resume(draft)}><Play size={15} /></button><button type="button" title="Delete draft" onClick={() => remove(draft.id)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section></div></AdminLayout>
}
