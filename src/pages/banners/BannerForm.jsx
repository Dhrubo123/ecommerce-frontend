import { useEffect, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createBanner, getBanner, updateBanner } from '../../services/bannerService'
import '../brands/brands.css'
import '../categories/categories.css'

const initialForm = { title: '', image: '', isOwnShop: true, isActive: true }

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
      .then((banner) => setForm({ ...initialForm, ...banner, image: banner.image || '' }))
      .catch((error) => setErrors({ api: error.response?.data?.message || 'Unable to load banner.' }))
  }, [editing, id])

  const change = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '', api: '' }))
  }

  const changeImage = (event) => {
    const image = event.target.files?.[0] || ''
    setForm((current) => ({ ...current, image }))
    setErrors((current) => ({ ...current, image: '', api: '' }))
  }

  const previewUrl = form.image instanceof File ? URL.createObjectURL(form.image) : form.image

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
            <label className="form-field"><span>Banner Image *</span><input name="image" type="file" accept="image/*" onChange={changeImage} />{errors.image && <small className="field-error">{errors.image}</small>}<small>Upload a JPG, PNG, or WebP image.</small></label>
            <label className="blog-toggle"><input type="checkbox" name="isOwnShop" checked={form.isOwnShop} onChange={change} /><span><strong>Show on own shop</strong><small>Display this banner on your own storefront.</small></span></label>
            <label className="blog-toggle"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} /><span><strong>Active banner</strong><small>Visible to customers when enabled.</small></span></label>
            <div className="brand-form-actions"><button type="button" onClick={() => navigate('/banners')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Banner' : 'Save Banner'}</button></div>
          </section>
          <aside><span>LIVE PREVIEW</span><div className="preview-image">{previewUrl ? <img src={previewUrl} alt="Banner" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <ImagePlus size={34} />}</div><h3>{form.title || 'Banner title'}</h3><p>{form.isOwnShop ? 'Own Shop banner' : 'Marketplace banner'}</p><p>{form.isActive ? 'Visible to customers' : 'Hidden from customers'}</p></aside>
        </form>
      </div>
    </AdminLayout>
  )
}
