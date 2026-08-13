import { useEffect, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createCategory, getCategory, updateCategory } from '../../services/categoryService'
import './categories.css'

const initial = {
  name: '',
  slug: '',
  image: null,
  imagePreview: '',
  banner: null,
  bannerPreview: '',
  description: '',
  order: 0,
  status: 'active',
}
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function CategoryForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    getCategory(id)
      .then((category) => category && setForm({
        ...initial,
        ...category,
        image: null,
        banner: null,
        imagePreview: category.image || '',
        bannerPreview: category.banner || '',
        order: category.order ?? category.sortOrder ?? 0,
      }))
      .catch((error) => setErrors({ api: error.response?.data?.message || 'Unable to load category.' }))
  }, [id, isEdit])

  const change = (event) => {
    const { name, value } = event.target
    if (name === 'slug') setSlugEdited(true)
    setForm((current) => ({ ...current, [name]: value, ...(name === 'name' && !slugEdited ? { slug: slugify(value) } : {}) }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }
  const chooseFile = (field) => (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, [field]: 'Choose a valid image file.' }))
      return
    }
    setForm((current) => ({
      ...current,
      [field]: file,
      [`${field}Preview`]: URL.createObjectURL(file),
    }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }
  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Category name is required.'
    if (!form.slug.trim()) next.slug = 'Slug is required.'
    if (!isEdit && !form.image) next.image = 'Category image is required.'
    if (!isEdit && !form.banner) next.banner = 'Category banner is required.'
    if (Number(form.order) < 0) next.order = 'Order cannot be negative.'
    if (Object.keys(next).length) return setErrors(next)
    setSaving(true)
    try { await (isEdit ? updateCategory(id, form) : createCategory(form)); navigate('/categories') } catch (error) { setErrors({ api: error.response?.data?.message || 'Unable to save category.' }) } finally { setSaving(false) }
  }

  const uploadField = (field, label, preview) => (
    <div className="form-field">
      <span>{label} *</span>
      <div className="image-upload">
        {preview ? (
          <>
            <img src={preview} alt={`${label} preview`} />
            <button type="button" onClick={() => setForm((current) => ({ ...current, [field]: null, [`${field}Preview`]: '' }))}>
              <X size={14} /> Remove {field}
            </button>
          </>
        ) : (
          <>
            <ImagePlus size={28} />
            <strong>Upload {label.toLowerCase()}</strong>
            <label className="upload-button">
              <Upload size={15} /> Choose file
              <input type="file" accept="image/*" onChange={chooseFile(field)} />
            </label>
            <small>PNG, JPG or WebP</small>
          </>
        )}
      </div>
      {errors[field] && <small className="field-error">{errors[field]}</small>}
    </div>
  )

  return (
    <AdminLayout title={isEdit ? 'Edit Category' : 'Add Category'}>
      <div className="crud-page">
        <div className="breadcrumbs">
          <Link to="/dashboard">Dashboard</Link><span>/</span>
          <Link to="/categories">Categories</Link><span>/</span>
          <strong>{isEdit ? 'Edit Category' : 'Add Category'}</strong>
        </div>
        <div className="page-heading"><div>
          <h2>{isEdit ? 'Edit Category' : 'Add Category'}</h2>
          <p>Create and manage your storefront category.</p>
        </div></div>

        <form className="form-layout" onSubmit={submit}>
          <section className="form-card">
            <h3>Category information</h3>
            {errors.api && <div className="api-error">{errors.api}</div>}

            <div className="form-row">
              <label className="form-field">
                <span>Category Name *</span>
                <input name="name" value={form.name} onChange={change} placeholder="Electronics" />
                {errors.name && <small className="field-error">{errors.name}</small>}
              </label>
              <label className="form-field">
                <span>Slug *</span>
                <input name="slug" value={form.slug} onChange={change} placeholder="electronics" />
                {errors.slug && <small className="field-error">{errors.slug}</small>}
              </label>
            </div>

            {uploadField('image', 'Category Image', form.imagePreview)}
            {uploadField('banner', 'Category Banner', form.bannerPreview)}

            <label className="form-field">
              <span>Description</span>
              <textarea name="description" rows="4" value={form.description} onChange={change} placeholder="Phones, computers, gadgets and accessories." />
            </label>
            <label className="form-field">
              <span>Order</span>
              <input type="number" min="0" name="order" value={form.order} onChange={change} />
              {errors.order && <small className="field-error">{errors.order}</small>}
            </label>
            <div className="form-field">
              <span>Status</span>
              <div className="toggle-row">
                <button type="button" className={form.status === 'active' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'active' }))}>Active</button>
                <button type="button" className={form.status === 'inactive' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'inactive' }))}>Inactive</button>
              </div>
            </div>
            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={() => navigate('/categories')}>Cancel</button>
              <button className="primary-button" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}</button>
            </div>
          </section>

          <aside className="preview-card">
            <span className="preview-label">LIVE PREVIEW</span>
            <div className="preview-image">{form.imagePreview ? <img src={form.imagePreview} alt="Category" /> : <ImagePlus size={28} />}</div>
            <h3>{form.name || 'Category name'}</h3>
            <code>{form.slug || 'category-slug'}</code>
            <p>{form.description || 'Category description will appear here.'}</p>
            <p>{form.status === 'active' ? 'Visible to customers' : 'Hidden from customers'}</p>
          </aside>
        </form>
      </div>
    </AdminLayout>
  )
}
