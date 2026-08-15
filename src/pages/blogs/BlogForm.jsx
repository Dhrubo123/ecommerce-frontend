import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createBlog, getBlog, updateBlog } from '../../services/blogService'
import { getCategories } from '../../services/categoryService'
import '../brands/brands.css'
import './blogs.css'

const initialForm = { title: '', slug: '', categoryId: '', tags: '', description: '', image: null, imagePreview: '', isActive: true }
const makeSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function BlogForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = Boolean(id)
  const slugEdited = useRef(false)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getCategories({ status: 'active' })
      .then(setCategories)
      .catch(() => setApiError('Unable to load blog categories.'))
  }, [])

  useEffect(() => {
    if (!editing) return
    getBlog(id).then((blog) => {
      setForm({
        ...initialForm,
        ...blog,
        categoryId: blog.category_id ?? blog.categoryId ?? blog.category?.id ?? '',
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
        image: null,
        imagePreview: blog.image || '',
      })
      slugEdited.current = true
    }).catch((requestError) => setApiError(requestError.response?.data?.message || 'Unable to load blog.'))
  }, [editing, id])

  const change = (event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    setForm((current) => ({ ...current, [name]: nextValue, ...(name === 'title' && !slugEdited.current ? { slug: makeSlug(value) } : {}) }))
    if (name === 'slug') slugEdited.current = true
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Title is required.'
    if (!form.slug.trim()) nextErrors.slug = 'Slug is required.'
    if (!form.categoryId) nextErrors.categoryId = 'Category is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'
    if (!editing && !form.image) nextErrors.image = 'Blog image is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true); setApiError('')
    try { if (editing) await updateBlog(id, form); else await createBlog(form); navigate('/blogs') }
    catch (requestError) { setApiError(requestError.response?.data?.message || 'Unable to save blog.') }
    finally { setSaving(false) }
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

  return <AdminLayout title={editing ? 'Edit Blog' : 'Add Blog'}><div className="brand-page"><div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>{editing ? 'Edit Blog' : 'Add Blog'}</h2><span>Publish useful content for your ecommerce audience.</span></div></div>
    <form className="brand-form blog-form" onSubmit={submit}><section><h3>Blog information</h3>{apiError && <div className="brand-error">{apiError}</div>}
      <label>Title *<input name="title" value={form.title} onChange={change} placeholder="Best Electronics to Buy in 2026" />{errors.title && <small>{errors.title}</small>}</label>
      <label>Slug *<input name="slug" value={form.slug} onChange={change} placeholder="best-electronics-to-buy-2026" />{errors.slug && <small>{errors.slug}</small>}</label>
      <div className="blog-form-grid"><label>Category *<select name="categoryId" value={form.categoryId} onChange={change}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{errors.categoryId && <small>{errors.categoryId}</small>}</label><label>Tags<input name="tags" value={form.tags} onChange={change} placeholder="electronics, shopping, guide" /><em>Separate tags with commas.</em></label></div>
      <label>Description *<textarea name="description" value={form.description} onChange={change} rows="7" placeholder="A complete guide to choosing the best electronics." />{errors.description && <small>{errors.description}</small>}</label>
      <div className="form-field"><span>Blog Image *</span><div className="image-upload">{form.imagePreview ? <><img src={form.imagePreview} alt="Blog preview" /><button type="button" onClick={() => setForm((current) => ({ ...current, image: null, imagePreview: '' }))}><X size={14} /> Remove image</button></> : <><ImagePlus size={28} /><strong>Upload a blog cover image</strong><label className="upload-button"><Upload size={15} /> Choose file<input type="file" accept="image/*" onChange={chooseImage} /></label><small>PNG, JPG or WebP</small></>}</div>{errors.image && <small className="field-error">{errors.image}</small>}</div>
      <label className="blog-toggle"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} /><span><strong>Active blog</strong><small>Visible to customers when enabled.</small></span></label>
      <div className="brand-form-actions"><button type="button" onClick={() => navigate('/blogs')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Blog' : 'Save Blog'}</button></div>
    </section><aside><span>LIVE PREVIEW</span><div className="blog-preview-image">{form.imagePreview ? <img src={form.imagePreview} alt="Blog preview" /> : <ImagePlus size={38} />}</div><span className="blog-category">{categories.find((category) => String(category.id) === String(form.categoryId))?.name || 'CATEGORY'}</span><h3>{form.title || 'Your blog title'}</h3><p>{form.description || 'Your blog description will appear here.'}</p><div className="blog-tags">{form.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => <span key={tag}>{tag}</span>)}</div></aside></form>
  </div></AdminLayout>
}
