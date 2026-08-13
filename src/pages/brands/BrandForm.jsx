import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createBrand, getBrand, updateBrand } from '../../services/brandService'
import './brands.css'

const blank = { name: '', slug: '', logoUrl: '', description: '', status: 'active' }
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function BrandForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [brand, setBrand] = useState(blank)
  const [errors, setErrors] = useState({})
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => { if (isEdit) getBrand(id).then((data) => { setBrand(data); setSlugEdited(true) }).catch(() => setErrors({ api: 'Unable to load brand.' })) }, [id, isEdit])

  const change = (event) => {
    const { name, value } = event.target
    if (name === 'slug') setSlugEdited(true)
    setBrand((current) => ({ ...current, [name]: value, ...(name === 'name' && !slugEdited ? { slug: slugify(value) } : {}) }))
    setErrors((current) => ({ ...current, [name]: '', api: '' }))
  }
  const save = async (event) => {
    event.preventDefault()
    const next = {}
    if (!brand.name.trim()) next.name = 'Brand name is required.'
    if (!brand.slug.trim()) next.slug = 'Slug is required.'
    if (Object.keys(next).length) return setErrors(next)
    try { await (isEdit ? updateBrand(id, brand) : createBrand(brand)); navigate('/brands') } catch (error) { setErrors({ api: error.response?.data?.message || 'Unable to save brand.' }) }
  }

  return <AdminLayout title={isEdit ? 'Edit Brand' : 'Add Brand'}><div className="brand-page"><div className="brand-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/brands">Brands</Link> / {isEdit ? 'Edit Brand' : 'Add Brand'}</div><div className="brand-heading"><div><h2>{isEdit ? 'Edit Brand' : 'Add Brand'}</h2><span>Set the brand identity used in your product catalog.</span></div></div><form className="brand-form" onSubmit={save}><section><h3>Brand information</h3>{errors.api && <div className="brand-error">{errors.api}</div>}<label>Brand Name<input name="name" value={brand.name} onChange={change} placeholder="Apple" />{errors.name && <small>{errors.name}</small>}</label><label>Slug<input name="slug" value={brand.slug} onChange={change} placeholder="apple" />{errors.slug && <small>{errors.slug}</small>}</label><label>Logo URL<input name="logoUrl" value={brand.logoUrl} onChange={change} placeholder="https://example.com/logos/apple.png" /></label><label>Description<textarea name="description" value={brand.description} onChange={change} rows="4" placeholder="Premium electronics and accessories" /></label><label>Status<select name="status" value={brand.status} onChange={change}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><div className="brand-form-actions"><button type="button" onClick={() => navigate('/brands')}>Cancel</button><button className="brand-primary">{isEdit ? 'Update Brand' : 'Save Brand'}</button></div></section><aside><span>BRAND PREVIEW</span>{brand.logoUrl ? <img src={brand.logoUrl} alt="" /> : <div className="brand-preview-logo">{brand.name?.[0] || 'B'}</div>}<h3>{brand.name || 'Brand name'}</h3><code>{brand.slug || 'brand-slug'}</code><p>{brand.description || 'Brand description'}</p></aside></form></div></AdminLayout>
}
