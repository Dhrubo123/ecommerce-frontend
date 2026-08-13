import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createBlog, getBlog, updateBlog } from '../../services/blogService'
import '../brands/brands.css'
import './blogs.css'

const initialForm = { title: '', slug: '', category: '', tags: '', description: '', image: '', isActive: true }
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

  useEffect(() => {
    if (!editing) return
    getBlog(id).then((blog) => { setForm({ ...initialForm, ...blog, tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '' }); slugEdited.current = true }).catch((requestError) => setApiError(requestError.response?.data?.message || 'Unable to load blog.'))
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
    if (!form.category.trim()) nextErrors.category = 'Category is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true); setApiError('')
    try { if (editing) await updateBlog(id, form); else await createBlog(form); navigate('/blogs') }
    catch (requestError) { setApiError(requestError.response?.data?.message || 'Unable to save blog.') }
    finally { setSaving(false) }
  }

  return <AdminLayout title={editing ? 'Edit Blog' : 'Add Blog'}><div className="brand-page"><div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>{editing ? 'Edit Blog' : 'Add Blog'}</h2><span>Publish useful content for your ecommerce audience.</span></div></div>
    <form className="brand-form blog-form" onSubmit={submit}><section><h3>Blog information</h3>{apiError && <div className="brand-error">{apiError}</div>}
      <label>Title *<input name="title" value={form.title} onChange={change} placeholder="Best Electronics to Buy in 2026" />{errors.title && <small>{errors.title}</small>}</label>
      <label>Slug *<input name="slug" value={form.slug} onChange={change} placeholder="best-electronics-to-buy-2026" />{errors.slug && <small>{errors.slug}</small>}</label>
      <div className="blog-form-grid"><label>Category *<input name="category" value={form.category} onChange={change} placeholder="Technology" />{errors.category && <small>{errors.category}</small>}</label><label>Tags<input name="tags" value={form.tags} onChange={change} placeholder="electronics, shopping, guide" /><em>Separate tags with commas.</em></label></div>
      <label>Description *<textarea name="description" value={form.description} onChange={change} rows="7" placeholder="A complete guide to choosing the best electronics." />{errors.description && <small>{errors.description}</small>}</label>
      <label>Image<input name="image" value={form.image} onChange={change} placeholder="blog-cover.jpg or https://example.com/blog-cover.jpg" /><em>Enter the uploaded filename or a public image URL.</em></label>
      <label className="blog-toggle"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} /><span><strong>Active blog</strong><small>Visible to customers when enabled.</small></span></label>
      <div className="brand-form-actions"><button type="button" onClick={() => navigate('/blogs')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Blog' : 'Save Blog'}</button></div>
    </section><aside><span>LIVE PREVIEW</span><div className="blog-preview-image">{form.image ? <img src={form.image} alt="Blog preview" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <ImagePlus size={38} />}{form.image && <button type="button" onClick={() => setForm((current) => ({ ...current, image: '' }))} aria-label="Remove image"><X size={15} /></button>}</div><span className="blog-category">{form.category || 'CATEGORY'}</span><h3>{form.title || 'Your blog title'}</h3><p>{form.description || 'Your blog description will appear here.'}</p><div className="blog-tags">{form.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => <span key={tag}>{tag}</span>)}</div></aside></form>
  </div></AdminLayout>
}
