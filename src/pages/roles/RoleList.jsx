import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteRole, getRoles } from '../../services/roleService'
import '../brands/brands.css'

export default function RoleList() {
  const [roles, setRoles] = useState([]); const [search, setSearch] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); getRoles({ search }).then(setRoles).catch((e) => setError(e.response?.data?.message || 'Unable to load roles.')).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [search])
  const remove = async (id) => { if (!window.confirm('Delete this role?')) return; try { await deleteRole(id); load() } catch (e) { setError(e.response?.data?.message || 'Unable to delete role.') } }
  return <AdminLayout title="Roles & Permissions"><div className="brand-page"><div className="brand-heading"><div><p>SYSTEM SETTINGS</p><h2>Roles & Permissions</h2><span>Define staff roles for your ecommerce administration team.</span></div><Link className="brand-primary" to="/roles/create"><Plus size={17} />Add Role</Link></div><section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles" /></label></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Role</th><th>Slug</th><th>Description</th><th>Created</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="5">Loading roles…</td></tr> : roles.length === 0 ? <tr><td colSpan="5">No roles found.</td></tr> : roles.map((role) => <tr key={role.id}><td><strong>{role.name}</strong></td><td><code>{role.slug}</code></td><td>{role.description || '—'}</td><td>{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '—'}</td><td><div className="brand-actions"><Link to={`/roles/${role.id}/edit`} title="Edit role"><Pencil size={16} /></Link><button onClick={() => remove(role.id)} title="Delete role"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></section></div></AdminLayout>
}
