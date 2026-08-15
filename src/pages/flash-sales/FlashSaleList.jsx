import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, Pencil, Plus, Search, Trash2, Zap } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteFlashSale, getFlashSales } from '../../services/flashSaleService'
import '../brands/brands.css'

export default function FlashSaleList() {
  const [sales, setSales] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try { setSales(await getFlashSales()); setError('') }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load flash sales.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  const visibleSales = useMemo(() => {
    const term = search.trim().toLowerCase()
    return term ? sales.filter((sale) => sale.name?.toLowerCase().includes(term)) : sales
  }, [sales, search])

  const remove = async (sale) => {
    if (!window.confirm(`Delete “${sale.name}”?`)) return
    try { await deleteFlashSale(sale.id); await load() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete flash sale.') }
  }

  return <AdminLayout title="Flash Sales"><div className="brand-page">
    <div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>Flash Sales</h2><span>Create time-limited promotions for your storefront.</span></div><Link className="brand-primary" to="/flash-sales/create"><Plus size={17} /> Add Flash Sale</Link></div>
    <section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search flash sales" /></label></div>{error && <div className="brand-error">{error}</div>}
      <div className="brand-table"><table><thead><tr><th>Image</th><th>Sale</th><th>Discount</th><th>Schedule</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="6">Loading flash sales...</td></tr> : visibleSales.length === 0 ? <tr><td colSpan="6">No flash sales found.</td></tr> : visibleSales.map((sale) => <tr key={sale.id}><td>{sale.image ? <img src={sale.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <span className="brand-logo-placeholder"><ImageIcon size={17} /></span>}</td><td><strong>{sale.name}</strong><small className="blog-slug"><Zap size={11} /> Limited time offer</small></td><td>{sale.minimumDiscount}% minimum</td><td>{sale.startDate} {sale.startTime} — {sale.endDate} {sale.endTime}</td><td><span className={`brand-status ${sale.isActive ? 'active' : 'inactive'}`}>{sale.isActive ? 'Active' : 'Inactive'}</span></td><td><div className="brand-actions"><Link to={`/flash-sales/${sale.id}/edit`} aria-label="Edit flash sale"><Pencil size={15} /></Link><button type="button" onClick={() => remove(sale)} aria-label="Delete flash sale"><Trash2 size={15} /></button></div></td></tr>)}
      </tbody></table></div>
    </section>
  </div></AdminLayout>
}
