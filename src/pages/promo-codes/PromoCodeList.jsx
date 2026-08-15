import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search, Ticket, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deletePromoCode, getPromoCodes } from '../../services/promoCodeService'
import '../brands/brands.css'

export default function PromoCodeList() {
  const [codes, setCodes] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try { setCodes(await getPromoCodes()); setError('') }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load promo codes.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const filteredCodes = useMemo(() => {
    const term = search.trim().toLowerCase()
    return term ? codes.filter((item) => item.code?.toLowerCase().includes(term)) : codes
  }, [codes, search])
  const remove = async (item) => {
    if (!window.confirm(`Delete promo code “${item.code}”?`)) return
    try { await deletePromoCode(item.id); await load() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete promo code.') }
  }

  return <AdminLayout title="Promo Codes"><div className="brand-page">
    <div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>Promo Codes</h2><span>Create discount codes for your customers.</span></div><Link className="brand-primary" to="/promo-codes/create"><Plus size={17} /> Add Promo Code</Link></div>
    <section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search promo codes" /></label></div>{error && <div className="brand-error">{error}</div>}
      <div className="brand-table"><table><thead><tr><th>Code</th><th>Discount</th><th>Minimum Order</th><th>Usage Limit</th><th>Schedule</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading promo codes...</td></tr> : filteredCodes.length === 0 ? <tr><td colSpan="7">No promo codes found.</td></tr> : filteredCodes.map((item) => <tr key={item.id}><td><strong><Ticket size={14} /> {item.code}</strong></td><td>{item.discountType === 'percent' ? `${item.discount}%` : item.discount}</td><td>{item.minimumOrderAmount}</td><td>{item.singleUserLimit} / user</td><td>{item.startDate} — {item.endDate}</td><td><span className={`brand-status ${item.isActive ? 'active' : 'inactive'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td><td><div className="brand-actions"><Link to={`/promo-codes/${item.id}/edit`} aria-label="Edit promo code"><Pencil size={15} /></Link><button type="button" onClick={() => remove(item)} aria-label="Delete promo code"><Trash2 size={15} /></button></div></td></tr>)}
      </tbody></table></div>
    </section>
  </div></AdminLayout>
}
