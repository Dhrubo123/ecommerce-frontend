import { useEffect, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { getCategories } from '../../services/categoryService'
import { createSubcategory, getSubcategory, updateSubcategory } from '../../services/subcategoryService'
import { Badge, Toast, slugify } from '../categories/CrudUI'
import '../categories/categories.css'

const initial = {
  categoryId: '',
  name: '',
  slug: '',
  image: null,
  imagePreview: '',
  description: '',
  status: 'active',
}

export default function SubcategoryForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getCategories({ status: 'active' })
      .then(setCategories)
      .catch(() => setErrors((current) => ({ ...current, categories: 'Unable to load parent categories.' })))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    getSubcategory(id)
      .then((item) => setForm({
        ...initial,
        ...item,
        categoryId: item.categoryId ?? item.categoryIds?.[0] ?? '',
        image: null,
        imagePreview: item.image || '',
      }))
      .catch((error) => setErrors({ api: error.response?.data?.message || 'Unable to load subcategory.' }))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const change = (event) => {
    const { name, value } = event.target
    if (name === 'slug') setSlugEdited(true)
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && !slugEdited ? { slug: slugify(value) } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
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

  const apiMessage = (error) => {
    const body = error.response?.data
    const details = body?.errors
      ?.map((item) => item.message || item.msg || `${item.path?.join?.('.') || item.field || 'Field'} is invalid`)
      .filter(Boolean)
      .join(' ')
    return details || body?.message || 'Unable to save subcategory.'
  }

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.categoryId) next.categoryId = 'Parent category is required.'
    if (!form.name.trim()) next.name = 'Subcategory name is required.'
    if (!form.slug.trim()) next.slug = 'Slug is required.'
    // The API accepts a new file on update when the image is being changed.
    // An existing preview is already stored by the backend and does not need re-uploading.
    if (!isEdit && !form.image) next.image = 'Subcategory image is required.'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    setSaving(true)
    setErrors({})
    try {
      const payload = { ...form, categoryIds: [Number(form.categoryId)] }
      await (isEdit ? updateSubcategory(id, payload) : createSubcategory(payload))
      setToast(`Subcategory ${isEdit ? 'updated' : 'created'} successfully`)
      window.setTimeout(() => navigate('/subcategories'), 650)
    } catch (error) {
      setErrors({ api: apiMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AdminLayout title={`${isEdit ? 'Edit' : 'Add'} Subcategory`}><div className="state-panel"><span className="loader" />Loading subcategory...</div></AdminLayout>
  }

  return (
    <AdminLayout title={`${isEdit ? 'Edit' : 'Add'} Subcategory`}>
      <div className="crud-page">
        <Toast message={toast} />
        <div className="breadcrumbs">
          <Link to="/dashboard">Dashboard</Link><span>/</span>
          <Link to="/subcategories">Subcategories</Link><span>/</span>
          <strong>{isEdit ? 'Edit Subcategory' : 'Add Subcategory'}</strong>
        </div>
        <div className="page-heading"><div>
          <h2>{isEdit ? 'Edit Subcategory' : 'Add Subcategory'}</h2>
          <p>Create and manage a storefront subcategory.</p>
        </div></div>

        <form className="form-layout" onSubmit={submit}>
          <section className="form-card">
            <h3>Subcategory information</h3>
            {errors.api && <div className="api-error">{errors.api}</div>}

            <label className="form-field">
              <span>Parent Category *</span>
              <select name="categoryId" value={form.categoryId} onChange={change}>
                <option value="">Select parent category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              {(errors.categoryId || errors.categories) && <small className="field-error">{errors.categoryId || errors.categories}</small>}
            </label>

            <div className="form-row">
              <label className="form-field">
                <span>Subcategory Name *</span>
                <input name="name" value={form.name} onChange={change} placeholder="Mobile Phones" />
                {errors.name && <small className="field-error">{errors.name}</small>}
              </label>
              <label className="form-field">
                <span>Slug *</span>
                <input name="slug" value={form.slug} onChange={change} placeholder="mobile-phones" />
                {errors.slug && <small className="field-error">{errors.slug}</small>}
              </label>
            </div>

            <div className="form-field">
              <span>Subcategory Image *</span>
              <div className="image-upload">
                {form.imagePreview ? (
                  <>
                    <img src={form.imagePreview} alt="Subcategory preview" />
                    <label className="upload-button">
                      <Upload size={15} /> Replace image
                      <input type="file" accept="image/*" onChange={chooseImage} />
                    </label>
                    <button type="button" onClick={() => setForm((current) => ({ ...current, image: null, imagePreview: '' }))}>
                      <X size={14} /> Remove image
                    </button>
                  </>
                ) : (
                  <>
                    <ImagePlus size={28} />
                    <strong>Upload a subcategory image</strong>
                    <label className="upload-button">
                      <Upload size={15} /> Choose file
                      <input type="file" accept="image/*" onChange={chooseImage} />
                    </label>
                    <small>PNG, JPG or WebP</small>
                  </>
                )}
              </div>
              {errors.image && <small className="field-error">{errors.image}</small>}
            </div>

            <label className="form-field">
              <span>Description</span>
              <textarea name="description" rows="4" value={form.description} onChange={change} placeholder="Smartphones and mobile accessories." />
            </label>
            <div className="form-field">
              <span>Status</span>
              <div className="toggle-row">
                <button type="button" className={form.status === 'active' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'active' }))}>Active</button>
                <button type="button" className={form.status === 'inactive' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'inactive' }))}>Inactive</button>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => navigate('/subcategories')}>Cancel</button>
              <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Subcategory' : 'Save Subcategory'}</button>
            </div>
          </section>

          <aside className="preview-card">
            <span className="preview-label">LIVE PREVIEW</span>
            <div className="preview-image">{form.imagePreview ? <img src={form.imagePreview} alt="Subcategory" /> : <ImagePlus size={28} />}</div>
            <h3>{form.name || 'Subcategory name'}</h3>
            <code>{form.slug || 'subcategory-slug'}</code>
            <p>{categories.find((category) => String(category.id) === String(form.categoryId))?.name || 'Parent category'}</p>
            <p>{form.description || 'Subcategory description will appear here.'}</p>
            <Badge status={form.status} />
          </aside>
        </form>
      </div>
    </AdminLayout>
  )
}
