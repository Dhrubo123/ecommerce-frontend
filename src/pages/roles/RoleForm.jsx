import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createRole, getRole, updateRole } from '../../services/roleService'
import '../brands/brands.css'

const blank = { name: '', slug: '', description: '' }
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function RoleForm() {
  const { id } = useParams(); const navigate = useNavigate(); const editing = Boolean(id); const [role, setRole] = useState(blank); const [slugEdited, setSlugEdited] = useState(false); const [error, setError] = useState(''); const [saving, setSaving] = useState(false)
  useEffect(() => { if (editing) getRole(id).then((data) => { setRole({ name: data.name || '', slug: data.slug || '', description: data.description || '' }); setSlugEdited(true) }).catch((e) => setError(e.response?.data?.message || 'Unable to load role.')) }, [editing, id])
  const change = (event) => { const { name, value } = event.target; if (name === 'slug') setSlugEdited(true); setRole((current) => ({ ...current, [name]: value, ...(name === 'name' && !slugEdited ? { slug: slugify(value) } : {}) })); setError('') }
  const save = async (event) => { event.preventDefault(); if (!role.name.trim() || !role.slug.trim()) { setError('Role name and slug are required.'); return } setSaving(true); setError(''); try { await (editing ? updateRole(id, role) : createRole(role)); navigate('/roles') } catch (e) { setError(e.response?.data?.message || 'Unable to save role.') } finally { setSaving(false) } }
  return <AdminLayout title={editing ? 'Edit Role' : 'Add Role'}><div className="brand-page"><div className="brand-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/roles">Roles & Permissions</Link> / {editing ? 'Edit Role' : 'Add Role'}</div><div className="brand-heading"><div><p>SYSTEM SETTINGS</p><h2>{editing ? 'Edit Role' : 'Add Role'}</h2><span>Create a role for your administration team.</span></div></div><form className="brand-form" onSubmit={save}><section><h3>Role information</h3>{error && <div className="brand-error">{error}</div>}<label>Role Name *<input name="name" value={role.name} onChange={change} placeholder="Warehouse Manager" /></label><label>Slug *<input name="slug" value={role.slug} onChange={change} placeholder="warehouse-manager" /></label><label>Description<textarea name="description" value={role.description} onChange={change} rows="4" placeholder="Manages warehouse orders" /></label><div className="brand-form-actions"><button type="button" onClick={() => navigate('/roles')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Role' : 'Save Role'}</button></div></section><aside><span>ROLE PREVIEW</span><div className="brand-preview-logo">{role.name?.[0] || 'R'}</div><h3>{role.name || 'Role name'}</h3><code>{role.slug || 'role-slug'}</code><p>{role.description || 'Role description'}</p></aside></form></div></AdminLayout>
}
