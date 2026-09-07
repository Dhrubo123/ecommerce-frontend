import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteWarehouse, getWarehouses } from '../../services/warehouseService'
import '../brands/brands.css'

const blankFilters = { name: '', code: '', phone: '', address: '', status: '' }
const includes = (value, query) => !query || String(value ?? '').toLowerCase().includes(query.toLowerCase())

export default function WarehouseList() {
  const [items, setItems] = useState([]); const [error, setError] = useState(''); const [filters, setFilters] = useState(blankFilters)
  const load = () => getWarehouses().then(setItems).catch((e) => setError(e.response?.data?.message || 'Unable to load warehouses.'))
  useEffect(() => { load() }, [])
  const visible = useMemo(() => items.filter((item) => includes(item.name, filters.name) && includes(item.code, filters.code) && includes(item.phone, filters.phone) && includes(item.address, filters.address) && (!filters.status || String(Boolean(item.isActive)) === filters.status)), [items, filters])
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  return <AdminLayout title="Warehouses"><div className="brand-page"><div className="brand-heading"><div><p>INVENTORY & PURCHASE</p><h2>Warehouses</h2><span>Manage warehouse locations and inventory storage.</span></div><Link className="brand-primary" to="/warehouses/create"><Plus size={17} />Add Warehouse</Link></div><section className="brand-card"><div className="brand-toolbar report-filters warehouse-filters"><label>Warehouse<input value={filters.name} onChange={(event) => setFilter('name', event.target.value)} placeholder="Filter warehouse name" /></label><label>Code<input value={filters.code} onChange={(event) => setFilter('code', event.target.value)} placeholder="Filter code" /></label><label>Phone<input value={filters.phone} onChange={(event) => setFilter('phone', event.target.value)} placeholder="Filter phone" /></label><label>Address<input value={filters.address} onChange={(event) => setFilter('address', event.target.value)} placeholder="Filter address" /></label><label>Status<select value={filters.status} onChange={(event) => setFilter('status', event.target.value)}><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select></label><button className="warehouse-clear" type="button" onClick={() => setFilters(blankFilters)}>Clear filters</button></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Warehouse</th><th>Code</th><th>Phone</th><th>Address</th><th>Status</th><th>Action</th></tr></thead><tbody>{!visible.length ? <tr><td colSpan="6">No warehouses match these filters.</td></tr> : visible.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.code || '—'}</td><td>{item.phone || '—'}</td><td>{item.address || '—'}</td><td><span className={`brand-status ${item.isActive ? 'active' : 'inactive'}`}>{item.isActive ? 'active' : 'inactive'}</span></td><td><div className="brand-actions"><Link to={`/warehouses/${item.id}/edit`} title="Edit warehouse"><Pencil size={16} /></Link><button title="Delete warehouse" onClick={async () => { if (confirm('Delete this warehouse?')) { await deleteWarehouse(item.id); load() } }}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></section></div></AdminLayout>
}
