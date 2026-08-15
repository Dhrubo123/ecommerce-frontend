import { useEffect, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createCustomer, getCustomer, updateCustomer } from '../../services/customerService'
import '../brands/brands.css'
import '../blogs/blogs.css'
import '../categories/categories.css'

const initialForm = { firstName: '', lastName: '', phone: '', email: '', password: '', gender: 'male', dateOfBirth: '', image: null, imagePreview: '', isActive: true }

export default function CustomerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) return
    getCustomer(id).then((customer) => setForm({ ...initialForm, ...customer, password: '', image: null, imagePreview: customer.image || '' }))
      .catch((error) => setErrors({ api: error.response?.data?.message || 'Unable to load customer.' }))
  }, [editing, id])

  const change = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '', api: '' }))
  }

  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setErrors((current) => ({ ...current, image: 'Choose a valid image file.' }))
    setForm((current) => ({ ...current, image: file, imagePreview: URL.createObjectURL(file) }))
    setErrors((current) => ({ ...current, image: '' }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    for (const field of ['firstName', 'lastName', 'phone', 'email', 'dateOfBirth']) if (!String(form[field]).trim()) next[field] = 'This field is required.'
    if (!editing && !form.password) next.password = 'Password is required.'
    if (!editing && !form.image) next.image = 'Customer image is required.'
    if (Object.keys(next).length) return setErrors(next)
    setSaving(true)
    try {
      await (editing ? updateCustomer(id, form) : createCustomer(form))
      navigate('/customers')
    } catch (error) {
      setErrors({ api: error.response?.data?.message || 'Unable to save customer.' })
    } finally {
      setSaving(false)
    }
  }

  const fieldError = (field) => errors[field] && <small>{errors[field]}</small>

  return <AdminLayout title={editing ? 'Edit Customer' : 'Add Customer'}><div className="brand-page"><div className="brand-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/customers">Customers</Link> / {editing ? 'Edit Customer' : 'Add Customer'}</div><div className="brand-heading"><div><p>PEOPLE & SUPPORT</p><h2>{editing ? 'Edit Customer' : 'Add Customer'}</h2><span>Create and manage customer profiles.</span></div></div>
    <form className="brand-form" onSubmit={submit}><section><h3>Customer information</h3>{errors.api && <div className="brand-error">{errors.api}</div>}
      <div className="blog-form-grid"><label>First Name *<input name="firstName" value={form.firstName} onChange={change} placeholder="Antar" />{fieldError('firstName')}</label><label>Last Name *<input name="lastName" value={form.lastName} onChange={change} placeholder="Nandi" />{fieldError('lastName')}</label></div>
      <div className="blog-form-grid"><label>Phone *<input name="phone" value={form.phone} onChange={change} placeholder="01824506162" />{fieldError('phone')}</label><label>Email *<input type="email" name="email" value={form.email} onChange={change} placeholder="customer@example.com" />{fieldError('email')}</label></div>
      <div className="blog-form-grid"><label>Password {editing ? '(leave blank to keep unchanged)' : '*'}<input type="password" name="password" value={form.password} onChange={change} placeholder="Enter password" />{fieldError('password')}</label><label>Gender *<select name="gender" value={form.gender} onChange={change}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label></div>
      <label>Date of Birth *<input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={change} />{fieldError('dateOfBirth')}</label>
      <div className="form-field"><span>Customer Image *</span><div className="image-upload">{form.imagePreview ? <><img src={form.imagePreview} alt="Customer preview" /><button type="button" onClick={() => setForm((current) => ({ ...current, image: null, imagePreview: '' }))}><X size={14} /> Remove image</button></> : <><ImagePlus size={28} /><strong>Upload customer image</strong><label className="upload-button"><Upload size={15} /> Choose file<input type="file" accept="image/*" onChange={chooseImage} /></label><small>PNG, JPG or WebP</small></>}</div>{errors.image && <small className="field-error">{errors.image}</small>}</div>
      <label className="blog-toggle"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} /><span><strong>Active customer</strong><small>Customer account can be used when enabled.</small></span></label>
      <div className="brand-form-actions"><button type="button" onClick={() => navigate('/customers')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Customer' : 'Save Customer'}</button></div>
    </section><aside><span>CUSTOMER PREVIEW</span><div className="preview-image">{form.imagePreview ? <img src={form.imagePreview} alt="Customer" /> : <ImagePlus size={34} />}</div><h3>{`${form.firstName} ${form.lastName}`.trim() || 'Customer name'}</h3><p>{form.phone || 'Phone number'}</p><p>{form.email || 'Email address'}</p><p>{form.isActive ? 'Active customer' : 'Inactive customer'}</p></aside></form>
  </div></AdminLayout>
}
