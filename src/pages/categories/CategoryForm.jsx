import { useEffect, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createCategory, getCategory, updateCategory } from '../../services/categoryService'
import './categories.css'

const initial = { name: '', slug: '', image: '', status: 'active' }
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function CategoryForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => { if (isEdit) getCategory(id).then((category) => category && setForm(category)) }, [id, isEdit])

  const change = (event) => {
    const { name, value } = event.target
    if (name === 'slug') setSlugEdited(true)
    setForm((current) => ({ ...current, [name]: value, ...(name === 'name' && !slugEdited ? { slug: slugify(value) } : {}) }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }
  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setErrors((current) => ({ ...current, image: 'Choose a valid image file.' }))
    const reader = new FileReader()
    reader.onload = () => setForm((current) => ({ ...current, image: reader.result }))
    reader.readAsDataURL(file)
  }
  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Category name is required.'
    if (!form.slug.trim()) next.slug = 'Slug is required.'
    if (Object.keys(next).length) return setErrors(next)
    setSaving(true)
    try { await (isEdit ? updateCategory(id, form) : createCategory(form)); navigate('/categories') } catch (error) { setErrors({ api: error.response?.data?.message || 'Unable to save category.' }) } finally { setSaving(false) }
  }

  return <AdminLayout title={isEdit ? 'Edit Category' : 'Add Category'}><div className="crud-page"><div className="breadcrumbs"><Link to="/dashboard">Dashboard</Link><span>/</span><Link to="/categories">Categories</Link><span>/</span><strong>{isEdit ? 'Edit Category' : 'Add Category'}</strong></div><div className="page-heading"><div><h2>{isEdit ? 'Edit Category' : 'Add Category'}</h2><p>Create and manage your storefront category.</p></div></div><form className="form-layout" onSubmit={submit}><section className="form-card"><h3>Category information</h3>{errors.api && <div className="api-error">{errors.api}</div>}<label className="form-field"><span>Category Name</span><input name="name" value={form.name} onChange={change} placeholder="Electronics" />{errors.name && <small className="field-error">{errors.name}</small>}</label><label className="form-field"><span>Slug</span><input name="slug" value={form.slug} onChange={change} placeholder="electronics" />{errors.slug && <small className="field-error">{errors.slug}</small>}</label><div className="form-field"><span>Category Image</span><div className="image-upload">{form.image ? <><img src={form.image} alt="Category preview" /><button type="button" onClick={() => setForm((current) => ({ ...current, image: '' }))}><X size={14} />Remove image</button></> : <><ImagePlus size={28} /><strong>Upload a category image</strong><label className="upload-button"><Upload size={15} />Choose image<input type="file" accept="image/*" onChange={chooseImage} /></label><small>or paste a public image URL below</small><input name="image" value={form.image} onChange={change} placeholder="https://example.com/categories/electronics.jpg" /></>}</div>{errors.image && <small className="field-error">{errors.image}</small>}</div><div className="form-field"><span>Status</span><div className="toggle-row"><button type="button" className={form.status === 'active' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'active' }))}>Active</button><button type="button" className={form.status === 'inactive' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'inactive' }))}>Inactive</button></div></div><div className="form-actions"><button className="secondary-button" type="button" onClick={() => navigate('/categories')}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}</button></div></section><aside className="preview-card"><span className="preview-label">LIVE PREVIEW</span><div className="preview-image">{form.image ? <img src={form.image} alt="" /> : <ImagePlus size={28} />}</div><h3>{form.name || 'Category name'}</h3><code>{form.slug || 'category-slug'}</code><p>{form.status === 'active' ? 'Visible to customers' : 'Hidden from customers'}</p></aside></form></div></AdminLayout>
}
