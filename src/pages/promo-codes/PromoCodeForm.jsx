import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createPromoCode, getPromoCode, updatePromoCode } from '../../services/promoCodeService'
import '../brands/brands.css'
import '../blogs/blogs.css'

const initialForm = { code: '', discountType: 'percent', discount: 0, minimumOrderAmount: 0, singleUserLimit: 1, maximumDiscountAmount: 0, startDate: '', startTime: '', endDate: '', endTime: '', isActive: true }

export default function PromoCodeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) return
    getPromoCode(id).then((code) => setForm({ ...initialForm, ...code }))
      .catch((error) => setErrors({ api: error.response?.data?.message || 'Unable to load promo code.' }))
  }, [editing, id])

  const change = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '', api: '' }))
  }
  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.code.trim()) next.code = 'Promo code is required.'
    for (const field of ['discount', 'minimumOrderAmount', 'singleUserLimit', 'maximumDiscountAmount']) if (Number(form[field]) < 0) next[field] = 'Enter a valid amount.'
    for (const field of ['startDate', 'startTime', 'endDate', 'endTime']) if (!form[field]) next[field] = 'This field is required.'
    if (Object.keys(next).length) return setErrors(next)
    setSaving(true)
    try { await (editing ? updatePromoCode(id, form) : createPromoCode(form)); navigate('/promo-codes') }
    catch (error) { setErrors({ api: error.response?.data?.message || 'Unable to save promo code.' }) }
    finally { setSaving(false) }
  }
  const fieldError = (name) => errors[name] && <small>{errors[name]}</small>

  return <AdminLayout title={editing ? 'Edit Promo Code' : 'Add Promo Code'}><div className="brand-page">
    <div className="brand-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/promo-codes">Promo Codes</Link> / {editing ? 'Edit Promo Code' : 'Add Promo Code'}</div>
    <div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>{editing ? 'Edit Promo Code' : 'Add Promo Code'}</h2><span>Create a discount code with limits and a schedule.</span></div></div>
    <form className="brand-form" onSubmit={submit}><section><h3>Promo code information</h3>{errors.api && <div className="brand-error">{errors.api}</div>}
      <div className="blog-form-grid"><label>Promo Code *<input name="code" value={form.code} onChange={change} placeholder="EID20" />{fieldError('code')}</label><label>Discount Type *<select name="discountType" value={form.discountType} onChange={change}><option value="percent">Percent</option><option value="fixed">Fixed amount</option></select></label></div>
      <div className="blog-form-grid"><label>Discount *<input type="number" min="0" name="discount" value={form.discount} onChange={change} />{fieldError('discount')}</label><label>Minimum Order Amount *<input type="number" min="0" name="minimumOrderAmount" value={form.minimumOrderAmount} onChange={change} />{fieldError('minimumOrderAmount')}</label></div>
      <div className="blog-form-grid"><label>Single User Limit *<input type="number" min="0" name="singleUserLimit" value={form.singleUserLimit} onChange={change} />{fieldError('singleUserLimit')}</label><label>Maximum Discount Amount *<input type="number" min="0" name="maximumDiscountAmount" value={form.maximumDiscountAmount} onChange={change} />{fieldError('maximumDiscountAmount')}</label></div>
      <div className="blog-form-grid"><label>Start Date *<input type="date" name="startDate" value={form.startDate} onChange={change} />{fieldError('startDate')}</label><label>Start Time *<input type="time" name="startTime" value={form.startTime} onChange={change} />{fieldError('startTime')}</label></div>
      <div className="blog-form-grid"><label>End Date *<input type="date" name="endDate" value={form.endDate} onChange={change} />{fieldError('endDate')}</label><label>End Time *<input type="time" name="endTime" value={form.endTime} onChange={change} />{fieldError('endTime')}</label></div>
      <label className="blog-toggle"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} /><span><strong>Active promo code</strong><small>Customers can use this code while enabled.</small></span></label>
      <div className="brand-form-actions"><button type="button" onClick={() => navigate('/promo-codes')}>Cancel</button><button className="brand-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Promo Code' : 'Save Promo Code'}</button></div>
    </section><aside><span>LIVE PREVIEW</span><div className="brand-preview-logo">{form.code?.slice(0, 2).toUpperCase() || '%'}</div><h3>{form.code || 'PROMO'}</h3><p>{form.discountType === 'percent' ? `${form.discount || 0}% off` : `${form.discount || 0} off`}</p><p>Minimum order: {form.minimumOrderAmount || 0}</p><p>{form.isActive ? 'Active' : 'Inactive'}</p></aside></form>
  </div></AdminLayout>
}
