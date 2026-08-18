import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckSquare, Square } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { createEmployee, getEmployee, updateEmployee } from '../../services/employeeService'
import { assignUserRoles, getRoles, getUserPermissions } from '../../services/roleService'
import '../brands/brands.css'
import '../roles/roles.css'
import './employees.css'

const initialForm = { firstName: '', lastName: '', phone: '', gender: 'male', email: '', role: '', password: '', isActive: true }
const requestMessage = (error, fallback) => error.response?.data?.errors?.map((item) => item.message || item.msg || item.code).filter(Boolean).join(' ') || error.response?.data?.message || error.response?.data?.error || fallback
const roleIdsFromEmployee = (employee) => (employee?.roles || employee?.user?.roles || []).map((role) => Number(role.roleId ?? role.id)).filter(Boolean)
const permissionLabel = (permission) => permission.moduleName || permission.module?.name || permission.permissionKey || permission.name

export default function EmployeeForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [roles, setRoles] = useState([])
  const [selectedRoleIds, setSelectedRoleIds] = useState([])
  const [permissions, setPermissions] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([getRoles(), editing ? getEmployee(id) : Promise.resolve(null)])
      .then(async ([roleList, employee]) => {
        if (!active) return
        setRoles(roleList)
        if (!employee) return
        setForm({ ...initialForm, ...employee, password: '' })
        setSelectedRoleIds(roleIdsFromEmployee(employee))
        const userId = employee.userId ?? employee.user?.id ?? employee.id
        if (!userId) return
        try { const access = await getUserPermissions(userId); if (active) setPermissions(access) } catch { /* Optional review data. */ }
      })
      .catch((requestError) => active && setError(requestMessage(requestError, 'Unable to load employee details.')))
    return () => { active = false }
  }, [editing, id])

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const toggleRole = (roleId) => setSelectedRoleIds((current) => current.includes(roleId) ? current.filter((item) => item !== roleId) : [...current, roleId])
  const submit = async (event) => {
    event.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.email.trim() || !form.role.trim() || (!editing && !form.password)) { setError('Please fill in every required field.'); return }
    setSaving(true); setError('')
    try {
      const savedEmployee = editing ? await updateEmployee(id, form) : await createEmployee(form)
      const userId = Number(savedEmployee?.userId ?? savedEmployee?.user?.id ?? savedEmployee?.id ?? id)
      if (selectedRoleIds.length && userId) await assignUserRoles(userId, selectedRoleIds)
      navigate('/employees')
    } catch (requestError) { setError(requestMessage(requestError, 'Unable to save employee.')) } finally { setSaving(false) }
  }

  return <AdminLayout title={editing ? 'Edit Employee' : 'Add Employee'}><div className="brand-page"><div className="brand-heading"><div><p>PEOPLE & SUPPORT</p><h2>{editing ? 'Edit Employee' : 'Add Employee'}</h2><span>Create an employee account and assign its system access roles.</span></div></div><form className="brand-form" onSubmit={submit}><section><h3>Employee information</h3>{error && <div className="brand-error">{error}</div>}<div className="brand-form-grid"><label>First Name *<input name="firstName" value={form.firstName} onChange={change} placeholder="Rahim" /></label><label>Last Name *<input name="lastName" value={form.lastName} onChange={change} placeholder="Uddin" /></label></div><div className="brand-form-grid"><label>Phone *<input name="phone" value={form.phone} onChange={change} placeholder="01700000000" /></label><label>Gender *<select name="gender" value={form.gender} onChange={change}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label></div><div className="brand-form-grid"><label>Email *<input type="email" name="email" value={form.email} onChange={change} placeholder="rahim@example.com" /></label><label>Job Title *<input name="role" value={form.role} onChange={change} placeholder="Cashier" /></label></div><label>{editing ? 'New Password (leave blank to keep current password)' : 'Password *'}<input type="password" name="password" value={form.password} onChange={change} placeholder="••••••••" autoComplete="new-password" /></label><label className="modal-status"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} />Active employee</label><div className="role-module-heading"><div><h3>System access roles</h3><p>Optional: choose one or more permission roles for this employee.</p></div></div><div className="role-module-grid">{roles.length ? roles.map((role) => { const roleId = Number(role.id); const checked = selectedRoleIds.includes(roleId); return <label className={`role-module-option ${checked ? 'selected' : ''}`} key={roleId}><input type="checkbox" checked={checked} onChange={() => toggleRole(roleId)} /><span>{checked ? <CheckSquare size={17} /> : <Square size={17} />}</span><div><strong>{role.name}</strong><small>{role.description || role.slug}</small></div></label> }) : <p className="role-module-loading">No access roles found. Create a role first.</p>}</div>{editing && <div className="employee-permissions"><strong>Current granted permissions</strong>{permissions.length ? <div>{permissions.slice(0, 14).map((permission, index) => <span key={permission.id || index}>{permissionLabel(permission)}</span>)}</div> : <small>No permission data returned for this user.</small>}</div>}<div className="brand-form-actions"><button type="button" onClick={() => navigate('/employees')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Employee' : 'Save Employee'}</button></div></section></form></div></AdminLayout>
}
