import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckSquare, Square } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { assignRoleModules, createRole, getRole, getRoleModules, updateRole } from '../../services/roleService'
import '../brands/brands.css'
import './roles.css'

const blank = { name: '', slug: '', description: '' }
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const selectedIds = (role) => (role?.modules || role?.roleModules || []).map((item) => Number(item.moduleId ?? item.id)).filter(Boolean)
const errorMessage = (error) => error.response?.data?.errors?.map((item) => item.message).join(', ') || error.response?.data?.message || 'Unable to save role.'

export default function RoleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [role, setRole] = useState(blank)
  const [modules, setModules] = useState([])
  const [moduleIds, setModuleIds] = useState([])
  const [slugEdited, setSlugEdited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([getRoleModules(), editing ? getRole(id) : Promise.resolve(null)])
      .then(([moduleList, roleData]) => {
        if (!active) return
        setModules(moduleList)
        if (roleData) {
          setRole({ name: roleData.name || '', slug: roleData.slug || '', description: roleData.description || '' })
          setModuleIds(selectedIds(roleData))
          setSlugEdited(true)
        }
      })
      .catch((requestError) => active && setError(errorMessage(requestError)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [editing, id])

  const change = (event) => {
    const { name, value } = event.target
    if (name === 'slug') setSlugEdited(true)
    setRole((current) => ({ ...current, [name]: value, ...(name === 'name' && !slugEdited ? { slug: slugify(value) } : {}) }))
    setError('')
  }
  const toggleModule = (moduleId) => setModuleIds((current) => current.includes(moduleId) ? current.filter((item) => item !== moduleId) : [...current, moduleId])
  const allSelected = modules.length > 0 && moduleIds.length === modules.length
  const toggleAll = () => setModuleIds(allSelected ? [] : modules.map((module) => Number(module.id)))
  const save = async (event) => {
    event.preventDefault()
    if (!role.name.trim() || !role.slug.trim()) { setError('Role name and slug are required.'); return }
    if (!moduleIds.length) { setError('Select at least one module for this role.'); return }
    setSaving(true); setError('')
    try {
      const savedRole = editing ? await updateRole(id, role) : await createRole(role)
      const roleId = Number(savedRole?.id ?? id)
      if (!roleId) throw new Error('The backend did not return the new role ID.')
      await assignRoleModules(roleId, moduleIds)
      navigate('/roles')
    } catch (requestError) {
      setError(requestError.message?.includes('new role ID') ? requestError.message : errorMessage(requestError))
    } finally { setSaving(false) }
  }

  return <AdminLayout title={editing ? 'Edit Role' : 'Add Role'}><div className="brand-page"><div className="brand-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/roles">Roles & Permissions</Link> / {editing ? 'Edit Role' : 'Add Role'}</div><div className="brand-heading"><div><p>SYSTEM SETTINGS</p><h2>{editing ? 'Edit Role' : 'Add Role'}</h2><span>Create a role and choose exactly what areas of the admin panel it can access.</span></div></div><form className="brand-form role-form" onSubmit={save}><section><h3>Role information</h3>{error && <div className="brand-error">{error}</div>}<label>Role Name *<input name="name" value={role.name} onChange={change} placeholder="Warehouse Manager" /></label><label>Slug *<input name="slug" value={role.slug} onChange={change} placeholder="warehouse-manager" /></label><label>Description<textarea name="description" value={role.description} onChange={change} rows="3" placeholder="Manages warehouse orders" /></label><div className="role-module-heading"><div><h3>Allowed modules *</h3><p>Choose the admin areas this role may access.</p></div><button type="button" onClick={toggleAll}>{allSelected ? <CheckSquare size={16} /> : <Square size={16} />}{allSelected ? 'Clear all' : 'Select all'}</button></div>{loading ? <p className="role-module-loading">Loading modules…</p> : <div className="role-module-grid">{modules.map((module) => { const moduleId = Number(module.id); const checked = moduleIds.includes(moduleId); return <label className={`role-module-option ${checked ? 'selected' : ''}`} key={moduleId}><input type="checkbox" checked={checked} onChange={() => toggleModule(moduleId)} /><span>{checked ? <CheckSquare size={17} /> : <Square size={17} />}</span><div><strong>{module.name || module.moduleKey}</strong><small>{module.description || module.moduleKey}</small></div></label> })}</div>}<div className="brand-form-actions"><button type="button" onClick={() => navigate('/roles')}>Cancel</button><button className="brand-primary" disabled={saving || loading}>{saving ? 'Saving…' : editing ? 'Update Role' : 'Save Role'}</button></div></section><aside><span>ROLE PREVIEW</span><div className="brand-preview-logo">{role.name?.[0] || 'R'}</div><h3>{role.name || 'Role name'}</h3><code>{role.slug || 'role-slug'}</code><p>{role.description || 'Role description'}</p><div className="role-preview-count">{moduleIds.length} module{moduleIds.length === 1 ? '' : 's'} selected</div></aside></form></div></AdminLayout>
}
