import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteBrand, getBrands } from '../../services/brandService'
import './brands.css'
import '../accounts/accounts-module.css'

const blank = { name: '', slug: '', description: '', status: '' }
const includes = (value, query) => !query || String(value ?? '').toLowerCase().includes(query.toLowerCase())
export default function BrandList() {
  const [brands, setBrands] = useState([]); const [filters, setFilters] = useState(blank); const [error, setError] = useState('')
  const load = () => { setError(''); getBrands().then(setBrands).catch((e) => setError(e.response?.data?.message || 'Unable to load brands.')) }
  useEffect(() => { load() }, [])
  const visible = useMemo(() => brands.filter((brand) => includes(brand.name, filters.name) && includes(brand.slug, filters.slug) && includes(brand.description, filters.description) && (!filters.status || String(brand.status ?? '').toLowerCase() === filters.status)), [brands, filters])
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const remove = async (id) => { if (!window.confirm('Delete this brand?')) return; try { await deleteBrand(id); load() } catch (e) { setError(e.response?.data?.message || 'Unable to delete brand.') } }
  return <AdminLayout title="Brands"><div className="brand-page"><div className="brand-heading"><div><p>PRODUCT ATTRIBUTES</p><h2>Brands</h2><span>Manage product brands available across your catalog.</span></div><Link className="brand-primary" to="/brands/create"><Plus size={17} />Add Brand</Link></div><section className="brand-card"><div className="brand-toolbar report-filters individual-filter-grid"><label>Brand name<input value={filters.name} onChange={(e) => setFilter('name', e.target.value)} placeholder="Filter brand name" /></label><label>Slug<input value={filters.slug} onChange={(e) => setFilter('slug', e.target.value)} placeholder="Filter slug" /></label><label>Description<input value={filters.description} onChange={(e) => setFilter('description', e.target.value)} placeholder="Filter description" /></label><label>Status<select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label><button type="button" className="warehouse-clear" onClick={() => setFilters(blank)}>Clear filters</button></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Logo</th><th>Brand Name</th><th>Slug</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map((brand) => <tr key={brand.id}><td>{brand.logoUrl ? <img src={brand.logoUrl} alt="" /> : <span className="brand-logo-placeholder">{brand.name?.[0]}</span>}</td><td><Link to={`/brands/${brand.id}`}>{brand.name}</Link></td><td><code>{brand.slug}</code></td><td>{brand.description || '—'}</td><td><span className={`brand-status ${brand.status}`}>{brand.status}</span></td><td><div className="brand-actions"><Link to={`/brands/${brand.id}`} title="View"><Eye size={16} /></Link><Link to={`/brands/${brand.id}/edit`} title="Edit"><Pencil size={16} /></Link><button onClick={() => remove(brand.id)} title="Delete"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>{!error && !visible.length && <div className="brand-empty">No brands match these filters.</div>}</section></div></AdminLayout>
}
