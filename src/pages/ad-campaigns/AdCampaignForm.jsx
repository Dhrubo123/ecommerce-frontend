import { useEffect, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createAdCampaign, getAdCampaign, updateAdCampaign } from '../../services/adCampaignService'
import '../brands/brands.css'
import '../blogs/blogs.css'
import '../categories/categories.css'

const initialForm = { title: '', image: null, imagePreview: '', isActive: true }

export default function AdCampaignForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (editing) getAdCampaign(id).then((campaign) => setForm({ ...initialForm, ...campaign, image: null, imagePreview: campaign.image || '' })).catch((error) => setErrors({ api: error.response?.data?.message || 'Unable to load ad campaign.' })) }, [editing, id])
  const change = (event) => { const { name, value, type, checked } = event.target; setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })); setErrors((current) => ({ ...current, [name]: '', api: '' })) }
  const chooseImage = (event) => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) return setErrors((current) => ({ ...current, image: 'Choose a valid image file.' })); setForm((current) => ({ ...current, image: file, imagePreview: URL.createObjectURL(file) })); setErrors((current) => ({ ...current, image: '' })) }
  const submit = async (event) => { event.preventDefault(); const next = {}; if (!form.title.trim()) next.title = 'Campaign title is required.'; if (!editing && !form.image) next.image = 'Campaign image is required.'; if (Object.keys(next).length) return setErrors(next); setSaving(true); try { await (editing ? updateAdCampaign(id, form) : createAdCampaign(form)); navigate('/ad-campaigns') } catch (error) { setErrors({ api: error.response?.data?.message || 'Unable to save ad campaign.' }) } finally { setSaving(false) } }

  return <AdminLayout title={editing ? 'Edit Ad Campaign' : 'Add Ad Campaign'}><div className="brand-page"><div className="brand-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/ad-campaigns">Ad Campaigns</Link> / {editing ? 'Edit Ad Campaign' : 'Add Ad Campaign'}</div><div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>{editing ? 'Edit Ad Campaign' : 'Add Ad Campaign'}</h2><span>Create a visual campaign for your storefront.</span></div></div>
    <form className="brand-form" onSubmit={submit}><section><h3>Campaign information</h3>{errors.api && <div className="brand-error">{errors.api}</div>}<label>Campaign Title *<input name="title" value={form.title} onChange={change} placeholder="Summer Fashion Sale" />{errors.title && <small>{errors.title}</small>}</label><div className="form-field"><span>Campaign Image *</span><div className="image-upload">{form.imagePreview ? <><img src={form.imagePreview} alt="Campaign preview" /><button type="button" onClick={() => setForm((current) => ({ ...current, image: null, imagePreview: '' }))}><X size={14} /> Remove image</button></> : <><ImagePlus size={28} /><strong>Upload campaign image</strong><label className="upload-button"><Upload size={15} /> Choose file<input type="file" accept="image/*" onChange={chooseImage} /></label><small>PNG, JPG or WebP</small></>}</div>{errors.image && <small className="field-error">{errors.image}</small>}</div><label className="blog-toggle"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} /><span><strong>Active campaign</strong><small>Visible to customers when enabled.</small></span></label><div className="brand-form-actions"><button type="button" onClick={() => navigate('/ad-campaigns')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Campaign' : 'Save Campaign'}</button></div></section><aside><span>LIVE PREVIEW</span><div className="preview-image">{form.imagePreview ? <img src={form.imagePreview} alt="Campaign" /> : <ImagePlus size={34} />}</div><h3>{form.title || 'Campaign title'}</h3><p>{form.isActive ? 'Visible to customers' : 'Hidden from customers'}</p></aside></form>
  </div></AdminLayout>
}
