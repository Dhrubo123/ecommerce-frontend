import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createCustomer } from '../../services/customerService'
import '../brands/brands.css'

const fields = [
  { name: 'name', label: 'Name' },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email' },
  { name: 'address', label: 'Address' },
]

export default function CustomerForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', isActive: true })
  const [error, setError] = useState('')
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const submit = async (event) => { event.preventDefault(); try { await createCustomer(form); navigate('/customers') } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save customer.') } }

  return <AdminLayout title="Add Customer"><div className="brand-page"><div className="brand-heading"><div><h2>Add Customer</h2><span>Create a customer profile.</span></div></div><form className="brand-form" onSubmit={submit}><section><h3>Customer information</h3>{error && <div className="brand-error">{error}</div>}{fields.map((field) => <label key={field.name}>{field.label}<input name={field.name} value={form[field.name]} onChange={change} /></label>)}<label className="modal-status"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} />Active customer</label><div className="brand-form-actions"><button type="button" onClick={() => navigate(-1)}>Cancel</button><button className="brand-primary">Save Customer</button></div></section></form></div></AdminLayout>
}
