import { useEffect, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createBanner, getBanner, updateBanner } from '../../services/bannerService'
import '../brands/brands.css'
import '../categories/categories.css'

const initialForm = { title: '', image: null, imagePreview: '', isOwnShop: true, isActive: true }

export default function BannerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) return
    getBanner(id)
      .then((banner) => setForm({ ...initialForm, ...banner, image: null, imagePreview: banner.image || '' }))
      .catch((error) => setErrors({ api: error.response?.data?.message || 'Unable to load banner.' }))
  }, [editing, id])

  const change = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '', api: '' }))
  }

  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, image: 'Choose a valid image file.' }))
      return
    }
    setForm((current) => ({ ...current, image: file, imagePreview: URL.createObjectURL(file) }))
    setErrors((current) => ({ ...current, image: '' }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Banner title is required.'
    if (!editing && !form.image) next.image = 'Banner image is required.'
    if (Object.keys(next).length) return setErrors(next)

    setSaving(true)
    try {
      await (editing ? updateBanner(id, form) : createBanner(form))
      navigate('/banners')
    } catch (error) {
      setErrors({ api: error.response?.data?.message || 'Unable to save banner.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title={editing ? 'Edit Banner' : 'Add Banner'}>
      <div className="brand-page">
        <div className="brand-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/banners">Banners</Link> / {editing ? 'Edit Banner' : 'Add Banner'}</div>
        <div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>{editing ? 'Edit Banner' : 'Add Banner'}</h2><span>Create a storefront banner.</span></div></div>
        <form className="brand-form" onSubmit={submit}>
          <section>
            <h3>Banner information</h3>
            {errors.api && <div className="brand-error">{errors.api}</div>}
            <label>Title *<input name="title" value={form.title} onChange={change} placeholder="Eid Collection 2026" />{errors.title && <small>{errors.title}</small>}</label>
            <div className="form-field"><span>Banner Image *</span><div className="image-upload">
              {form.imagePreview ? <><img src={form.imagePreview} alt="Banner preview" /><button type="button" onClick={() => setForm((current) => ({ ...current, image: null, imagePreview: '' }))}><X size={14} /> Remove image</button></> : <><ImagePlus size={28} /><strong>Upload a banner image</strong><label className="upload-button"><Upload size={15} /> Choose file<input type="file" accept="image/*" onChange={chooseImage} /></label><small>PNG, JPG or WebP</small></>}
            </div>{errors.image && <small className="field-error">{errors.image}</small>}</div>
            <label className="blog-toggle"><input type="checkbox" name="isOwnShop" checked={form.isOwnShop} onChange={change} /><span><strong>Show on own shop</strong><small>Display this banner on your own storefront.</small></span></label>
            <label className="blog-toggle"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} /><span><strong>Active banner</strong><small>Visible to customers when enabled.</small></span></label>
            <div className="brand-form-actions"><button type="button" onClick={() => navigate('/banners')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Banner' : 'Save Banner'}</button></div>
          </section>
          <aside><span>LIVE PREVIEW</span><div className="preview-image">{form.imagePreview ? <img src={form.imagePreview} alt="Banner" /> : <ImagePlus size={34} />}</div><h3>{form.title || 'Banner title'}</h3><p>{form.isOwnShop ? 'Own Shop banner' : 'Marketplace banner'}</p><p>{form.isActive ? 'Visible to customers' : 'Hidden from customers'}</p></aside>
        </form>
      </div>
    </AdminLayout>
  )
}
