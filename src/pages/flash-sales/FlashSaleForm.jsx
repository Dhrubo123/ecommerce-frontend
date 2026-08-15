import { useEffect, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createFlashSale, getFlashSale, updateFlashSale } from '../../services/flashSaleService'
import '../brands/brands.css'
import '../categories/categories.css'
import '../blogs/blogs.css'

const initialForm = { name: '', minimumDiscount: 0, startDate: '', startTime: '', endDate: '', endTime: '', description: '', image: null, imagePreview: '', isActive: true }

export default function FlashSaleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) return
    getFlashSale(id).then((sale) => setForm({ ...initialForm, ...sale, image: null, imagePreview: sale.image || '' }))
      .catch((error) => setErrors({ api: error.response?.data?.message || 'Unable to load flash sale.' }))
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
    if (!form.name.trim()) next.name = 'Flash sale name is required.'
    if (Number(form.minimumDiscount) < 0) next.minimumDiscount = 'Minimum discount cannot be negative.'
    if (!form.startDate) next.startDate = 'Start date is required.'
    if (!form.startTime) next.startTime = 'Start time is required.'
    if (!form.endDate) next.endDate = 'End date is required.'
    if (!form.endTime) next.endTime = 'End time is required.'
    if (!editing && !form.image) next.image = 'Flash sale image is required.'
    if (Object.keys(next).length) return setErrors(next)
    setSaving(true)
    try { await (editing ? updateFlashSale(id, form) : createFlashSale(form)); navigate('/flash-sales') }
    catch (error) { setErrors({ api: error.response?.data?.message || 'Unable to save flash sale.' }) }
    finally { setSaving(false) }
  }

  return <AdminLayout title={editing ? 'Edit Flash Sale' : 'Add Flash Sale'}><div className="brand-page">
    <div className="brand-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/flash-sales">Flash Sales</Link> / {editing ? 'Edit Flash Sale' : 'Add Flash Sale'}</div>
    <div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>{editing ? 'Edit Flash Sale' : 'Add Flash Sale'}</h2><span>Schedule a limited-time sale for your storefront.</span></div></div>
    <form className="brand-form" onSubmit={submit}><section><h3>Flash sale information</h3>{errors.api && <div className="brand-error">{errors.api}</div>}
      <label>Sale Name *<input name="name" value={form.name} onChange={change} placeholder="Eid Mega Sale" />{errors.name && <small>{errors.name}</small>}</label>
      <label>Minimum Discount *<input type="number" min="0" name="minimumDiscount" value={form.minimumDiscount} onChange={change} placeholder="10" />{errors.minimumDiscount && <small>{errors.minimumDiscount}</small>}</label>
      <div className="blog-form-grid"><label>Start Date *<input type="date" name="startDate" value={form.startDate} onChange={change} />{errors.startDate && <small>{errors.startDate}</small>}</label><label>Start Time *<input type="time" name="startTime" value={form.startTime} onChange={change} />{errors.startTime && <small>{errors.startTime}</small>}</label></div>
      <div className="blog-form-grid"><label>End Date *<input type="date" name="endDate" value={form.endDate} onChange={change} />{errors.endDate && <small>{errors.endDate}</small>}</label><label>End Time *<input type="time" name="endTime" value={form.endTime} onChange={change} />{errors.endTime && <small>{errors.endTime}</small>}</label></div>
      <label>Description<textarea name="description" rows="4" value={form.description} onChange={change} placeholder="Get special Eid discounts on selected products." /></label>
      <div className="form-field"><span>Sale Image *</span><div className="image-upload">{form.imagePreview ? <><img src={form.imagePreview} alt="Flash sale preview" /><button type="button" onClick={() => setForm((current) => ({ ...current, image: null, imagePreview: '' }))}><X size={14} /> Remove image</button></> : <><ImagePlus size={28} /><strong>Upload a flash sale image</strong><label className="upload-button"><Upload size={15} /> Choose file<input type="file" accept="image/*" onChange={chooseImage} /></label><small>PNG, JPG or WebP</small></>}</div>{errors.image && <small className="field-error">{errors.image}</small>}</div>
      <label className="blog-toggle"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} /><span><strong>Active flash sale</strong><small>Visible to customers while enabled.</small></span></label>
      <div className="brand-form-actions"><button type="button" onClick={() => navigate('/flash-sales')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Flash Sale' : 'Save Flash Sale'}</button></div>
    </section><aside><span>LIVE PREVIEW</span><div className="preview-image">{form.imagePreview ? <img src={form.imagePreview} alt="Flash sale" /> : <ImagePlus size={34} />}</div><h3>{form.name || 'Flash sale name'}</h3><p>{form.minimumDiscount || 0}% minimum discount</p><p>{form.startDate && form.endDate ? `${form.startDate} to ${form.endDate}` : 'Set the sale schedule'}</p></aside></form>
  </div></AdminLayout>
}
