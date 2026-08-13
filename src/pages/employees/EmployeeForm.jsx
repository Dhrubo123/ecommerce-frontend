import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createEmployee, getEmployee, updateEmployee } from '../../services/employeeService'
import '../brands/brands.css'

const initialForm = { firstName: '', lastName: '', phone: '', gender: 'male', email: '', role: '', password: '', isActive: true }

const formatValidationError = (item) => {
  if (typeof item === 'string') return item
  if (!item || typeof item !== 'object') return ''
  if (item.message || item.msg) return item.message || item.msg
  if (item.constraints) return Object.values(item.constraints).join(', ')
  const field = item.field || item.path || item.property
  const detail = item.error || item.reason || item.code
  if (field && detail) return `${field}: ${detail}`
  if (field) return `${field} is invalid.`
  const nestedText = Object.values(item).flatMap((value) => Array.isArray(value) ? value : [value]).filter((value) => typeof value === 'string').join(', ')
  return nestedText || JSON.stringify(item)
}

const requestMessage = (requestError, fallback) => {
  const body = requestError.response?.data
  const errors = Array.isArray(body?.errors) ? body.errors : body?.errors ? Object.values(body.errors).flat() : []
  const details = errors.map(formatValidationError).filter(Boolean).join(' ')
  return details || body?.message || body?.error || fallback
}

export default function EmployeeForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) return
    getEmployee(id).then((employee) => setForm({ ...initialForm, ...employee, password: '' })).catch((requestError) => setError(requestMessage(requestError, 'Unable to load employee.')))
  }, [editing, id])

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.email.trim() || !form.role.trim() || (!editing && !form.password)) {
      setError('Please fill in every required field.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editing) await updateEmployee(id, form); else await createEmployee(form)
      navigate('/employees')
    } catch (requestError) {
      console.error('Employee save failed:', requestError.response?.data || requestError)
      setError(requestMessage(requestError, 'Unable to save employee.'))
    } finally { setSaving(false) }
  }

  return <AdminLayout title={editing ? 'Edit Employee' : 'Add Employee'}><div className="brand-page">
    <div className="brand-heading"><div><p>PEOPLE & SUPPORT</p><h2>{editing ? 'Edit Employee' : 'Add Employee'}</h2><span>Create an employee account for your admin team.</span></div></div>
    <form className="brand-form" onSubmit={submit}><section><h3>Employee information</h3>{error && <div className="brand-error">{error}</div>}
      <div className="brand-form-grid"><label>First Name *<input name="firstName" value={form.firstName} onChange={change} placeholder="Rahim" /></label><label>Last Name *<input name="lastName" value={form.lastName} onChange={change} placeholder="Uddin" /></label></div>
      <div className="brand-form-grid"><label>Phone *<input name="phone" value={form.phone} onChange={change} placeholder="01700000000" /></label><label>Gender *<select name="gender" value={form.gender} onChange={change}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label></div>
      <div className="brand-form-grid"><label>Email *<input type="email" name="email" value={form.email} onChange={change} placeholder="rahim@example.com" /></label><label>Role *<input name="role" value={form.role} onChange={change} placeholder="Cashier" /></label></div>
      <label>{editing ? 'New Password (leave blank to keep current password)' : 'Password *'}<input type="password" name="password" value={form.password} onChange={change} placeholder="••••••••" autoComplete="new-password" /></label>
      <label className="modal-status"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} />Active employee</label>
      <div className="brand-form-actions"><button type="button" onClick={() => navigate('/employees')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Employee' : 'Save Employee'}</button></div>
    </section></form>
  </div></AdminLayout>
}
