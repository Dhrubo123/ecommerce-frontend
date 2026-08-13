import { useEffect, useState } from 'react'
import { Mail, MapPin, MessageCircle, Phone, Save } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getContactUs, saveContactUs } from '../../services/contactUsService'
import './contact-us.css'

const initialForm = { phoneNumber: '', whatsappNumber: '', messengerLink: '', email: '', address: '' }

const errorMessage = (requestError, fallback) => {
  const body = requestError.response?.data
  if (Array.isArray(body?.errors)) return body.errors.map((item) => item.message || item.msg || (typeof item === 'string' ? item : JSON.stringify(item))).join(' ')
  return body?.message || body?.error || fallback
}

export default function ContactUs() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getContactUs().then((data) => {
      const contact = Array.isArray(data) ? data[0] : (data?.contactUs ?? data?.contact ?? data)
      if (contact && typeof contact === 'object') setForm((current) => ({ ...current, ...Object.fromEntries(Object.keys(current).map((key) => [key, contact[key] ?? ''])) }))
    }).catch((requestError) => {
      if (requestError.response?.status !== 404) setApiError(errorMessage(requestError, 'Unable to load contact information.'))
    }).finally(() => setLoading(false))
  }, [])

  const change = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSuccess('')
  }

  const validate = () => {
    const next = {}
    if (!form.phoneNumber.trim()) next.phoneNumber = 'Phone number is required.'
    if (!form.whatsappNumber.trim()) next.whatsappNumber = 'WhatsApp number is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.messengerLink && !/^https?:\/\//i.test(form.messengerLink)) next.messengerLink = 'Messenger link must start with http:// or https://.'
    if (!form.address.trim()) next.address = 'Address is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setSaving(true); setApiError(''); setSuccess('')
    try {
      const saved = await saveContactUs(form)
      const contact = saved?.contactUs ?? saved?.contact ?? saved
      if (contact && typeof contact === 'object') setForm((current) => ({ ...current, ...Object.fromEntries(Object.keys(current).map((key) => [key, contact[key] ?? current[key]])) }))
      setSuccess('Contact information saved successfully.')
    } catch (requestError) {
      setApiError(errorMessage(requestError, 'Unable to save contact information.'))
    } finally { setSaving(false) }
  }

  return <AdminLayout title="Contact Us"><div className="contact-page">
    <div className="contact-heading"><div><p>PEOPLE & SUPPORT</p><h2>Contact Us</h2><span>Manage the support details displayed to your customers.</span></div></div>
    <form className="contact-layout" onSubmit={submit}>
      <section className="contact-card"><div className="contact-card-title"><div><h3>Contact information</h3><p>Keep your customer support channels accurate and up to date.</p></div></div>
        {apiError && <div className="contact-alert error">{apiError}</div>}{success && <div className="contact-alert success">{success}</div>}
        {loading ? <div className="contact-loading">Loading contact information…</div> : <>
          <div className="contact-grid"><label>Phone Number *<div className="contact-input"><Phone size={17} /><input name="phoneNumber" value={form.phoneNumber} onChange={change} placeholder="+8801712345678" /></div>{errors.phoneNumber && <small>{errors.phoneNumber}</small>}</label><label>WhatsApp Number *<div className="contact-input"><MessageCircle size={17} /><input name="whatsappNumber" value={form.whatsappNumber} onChange={change} placeholder="+8801712345678" /></div>{errors.whatsappNumber && <small>{errors.whatsappNumber}</small>}</label></div>
          <label>Email Address *<div className="contact-input"><Mail size={17} /><input type="email" name="email" value={form.email} onChange={change} placeholder="support@example.com" /></div>{errors.email && <small>{errors.email}</small>}</label>
          <label>Messenger Link<div className="contact-input"><MessageCircle size={17} /><input type="url" name="messengerLink" value={form.messengerLink} onChange={change} placeholder="https://m.me/your-page" /></div>{errors.messengerLink && <small>{errors.messengerLink}</small>}</label>
          <label>Business Address *<div className="contact-input textarea"><MapPin size={17} /><textarea name="address" value={form.address} onChange={change} placeholder="Dhaka, Bangladesh" /></div>{errors.address && <small>{errors.address}</small>}</label>
          <div className="contact-actions"><button className="contact-save" disabled={saving}><Save size={17} />{saving ? 'Saving…' : 'Save Contact Information'}</button></div>
        </>}
      </section>
      <aside className="contact-preview"><span>LIVE PREVIEW</span><h3>Need help?</h3><p>Our support team is ready to assist you.</p><div className="preview-contact"><Phone size={17} /><div><small>Call us</small><strong>{form.phoneNumber || 'Your phone number'}</strong></div></div><div className="preview-contact"><MessageCircle size={17} /><div><small>WhatsApp</small><strong>{form.whatsappNumber || 'Your WhatsApp number'}</strong></div></div><div className="preview-contact"><Mail size={17} /><div><small>Email</small><strong>{form.email || 'support@example.com'}</strong></div></div><div className="preview-contact"><MapPin size={17} /><div><small>Address</small><strong>{form.address || 'Your business address'}</strong></div></div></aside>
    </form>
  </div></AdminLayout>
}
