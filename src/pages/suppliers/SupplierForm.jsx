import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createSupplier, getSupplier, updateSupplier } from '../../services/supplierService'
import '../brands/brands.css'
import './suppliers.css'

const blank = { name: '', phone: '', email: '', address: '', image: null, existingImage: '', isActive: true }
const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
const imageUrl = (value) => !value ? '' : /^(https?:|data:|blob:)/i.test(value) ? value : `${apiBase}/${String(value).replace(/^\//, '')}`
const requestMessage = (error) => { const body = error.response?.data; return body?.errors?.map?.((item) => item.message || item.msg || String(item)).join(' ') || body?.message || body?.error || 'Unable to save supplier.' }

export default function SupplierForm() {
  const { id } = useParams(); const navigate = useNavigate(); const edit = Boolean(id); const inputRef = useRef(null)
  const [form, setForm] = useState(blank); const [preview, setPreview] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false)
  useEffect(() => { if (edit) getSupplier(id).then((supplier) => { const existingImage = supplier.image?.url || supplier.imageUrl || supplier.image || ''; setForm({ ...blank, ...supplier, image: null, existingImage }); setPreview(imageUrl(existingImage)) }).catch(() => setError('Unable to load supplier.')) }, [id, edit])
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview) }, [preview])
  const change = (event) => { const { name, value, type, checked } = event.target; setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })); setError('') }
  const chooseImage = (event) => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) return setError('Please choose a valid image file.'); if (file.size > 5 * 1024 * 1024) return setError('Supplier image must be 5 MB or smaller.'); setForm((current) => ({ ...current, image: file })); setPreview(URL.createObjectURL(file)); setError('') }
  const removeImage = () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); setPreview(''); setForm((current) => ({ ...current, image: null, existingImage: '' })); if (inputRef.current) inputRef.current.value = '' }
  const save = async (event) => { event.preventDefault(); if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.address.trim()) return setError('Name, phone, email, and address are required.'); if (!edit && !form.image) return setError('Supplier image is required.'); setSaving(true); setError(''); try { if (edit) await updateSupplier(id, form); else await createSupplier(form); navigate('/suppliers') } catch (requestError) { setError(requestMessage(requestError)) } finally { setSaving(false) } }

  return <AdminLayout title={edit ? 'Edit Supplier' : 'Add Supplier'}><div className="brand-page"><div className="brand-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/suppliers">Suppliers</Link> / {edit ? 'Edit Supplier' : 'Add Supplier'}</div><div className="brand-heading"><div><p>INVENTORY & PURCHASE</p><h2>{edit ? 'Edit Supplier' : 'Add Supplier'}</h2><span>Keep supplier business and contact information organized.</span></div></div>
    <form className="brand-form supplier-form" onSubmit={save}><section><h3>Supplier information</h3>{error && <div className="brand-error">{error}</div>}<label>Supplier Name *<input name="name" value={form.name} onChange={change} placeholder="Apple Distribution BD" /></label><div className="supplier-grid"><label>Phone *<input name="phone" value={form.phone} onChange={change} placeholder="01712345678" /></label><label>Email *<input type="email" name="email" value={form.email} onChange={change} placeholder="sales@example.com" /></label></div><label>Address *<textarea name="address" value={form.address} onChange={change} rows="3" placeholder="Dhaka, Bangladesh" /></label>
      <label>Supplier Image {!edit && '*'}<button className={`supplier-upload ${preview ? 'has-image' : ''}`} type="button" onClick={() => inputRef.current?.click()}>{preview ? <img src={preview} alt="Supplier preview" /> : <><ImagePlus size={27} /><strong>Choose supplier image</strong><span>PNG, JPG or WEBP · maximum 5 MB</span></>}</button><input ref={inputRef} className="supplier-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseImage} />{preview && <button className="supplier-remove" type="button" onClick={removeImage}><X size={14} />Remove image</button>}</label><label className="modal-status"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} />Active supplier</label><div className="brand-form-actions"><button type="button" onClick={() => navigate('/suppliers')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : edit ? 'Update Supplier' : 'Save Supplier'}</button></div></section>
      <aside><span>SUPPLIER PREVIEW</span>{preview ? <img src={preview} alt="Supplier" /> : <div className="brand-preview-logo">{form.name?.[0] || 'S'}</div>}<h3>{form.name || 'Supplier name'}</h3><p>{form.phone || 'Phone number'}</p><p>{form.email || 'sales@example.com'}</p><p>{form.address || 'Business address'}</p></aside></form></div></AdminLayout>
}
