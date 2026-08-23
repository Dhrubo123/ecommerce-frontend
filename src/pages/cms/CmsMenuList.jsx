import { useEffect, useMemo, useState } from 'react'
import { Menu, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteCmsMenu, getCmsMenus } from '../../services/cmsMenuService'
import './cms.css'
import './cmsMenus.css'

export default function CmsMenuList() {
  const [items, setItems] = useState([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const load = async () => { setLoading(true); try { setItems(await getCmsMenus()); setError('') } catch (err) { setError(err.response?.data?.message || 'Unable to load CMS menu items.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const shown = useMemo(() => { const term = search.toLowerCase(); return term ? items.filter((item) => `${item.label} ${item.location} ${item.url}`.toLowerCase().includes(term)) : items }, [items, search])
  const remove = async (item) => { if (!window.confirm(`Delete “${item.label}”?`)) return; try { await deleteCmsMenu(item.id); await load() } catch (err) { setError(err.response?.data?.message || 'Unable to delete this menu item.') } }
  return <AdminLayout title="CMS Menus"><div className="cms-page"><div className="cms-heading"><div><p>MARKETING & CONTENT</p><h2>CMS Menus</h2><span>Manage header and footer navigation links for your storefront.</span></div><Link className="cms-primary" to="/cms-menus/create"><Plus size={17} /> Add Menu Item</Link></div>{error && <div className="cms-error">{error}</div>}<section className="cms-card"><div className="cms-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu items" /></label><span>{items.length} menu items</span></div><div className="cms-table"><table><thead><tr><th>Label</th><th>Location</th><th>URL</th><th>Parent</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Loading menu items...</td></tr> : shown.length === 0 ? <tr><td colSpan="7">No menu items found.</td></tr> : shown.map((item) => <tr key={item.id}><td><span className="cms-file-icon"><Menu size={16} /></span><strong>{item.label}</strong></td><td><span className="cms-location">{item.location}</span></td><td><code>{item.url || '—'}</code></td><td>{items.find((parent) => String(parent.id) === String(item.parentId))?.label || 'Root item'}</td><td>{item.sortOrder}</td><td><span className={`cms-status ${item.isActive ? 'active' : 'inactive'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td><td><div className="cms-actions"><Link to={`/cms-menus/${item.id}/edit`}><Pencil size={15} /></Link><button type="button" onClick={() => remove(item)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section></div></AdminLayout>
}
