import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getSalesReturns } from '../../services/salesReturnService'
import '../brands/brands.css'

const sourceLabel = (value) => value === 'pos_sale' ? 'POS Sale' : value === 'ecommerce_order' ? 'Ecommerce Order' : value || '—'

export default function SalesReturnList() {
  const [returns, setReturns] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getSalesReturns({ search }).then((data) => { setReturns(data); setError('') }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load sales returns.')).finally(() => setLoading(false))
  }, [search])

  return <AdminLayout title="Sales Returns"><div className="brand-page">
    <div className="brand-heading"><div><p>ORDER MANAGEMENT</p><h2>Sales Returns</h2><span>Track returned products from POS and ecommerce orders.</span></div><Link className="brand-primary" to="/sales-returns/create"><Plus size={17} />Add Sales Return</Link></div>
    <section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search return, source, or reason" /></label></div>{error && <div className="brand-error">{error}</div>}
      <div className="brand-table"><table><thead><tr><th>Return</th><th>Source Type</th><th>Source ID</th><th>Return Date</th><th>Reason</th><th>Items</th><th>Status</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading sales returns…</td></tr> : returns.length === 0 ? <tr><td colSpan="7">No sales returns found.</td></tr> : returns.map((item, index) => <tr key={item.id || index}><td><strong>#{item.id || index + 1}</strong></td><td>{sourceLabel(item.sourceType)}</td><td>#{item.sourceId}</td><td>{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '—'}</td><td>{item.reason || '—'}</td><td>{item.items?.length ?? item.itemCount ?? '—'}</td><td><span className={`brand-status ${item.status === 'rejected' ? 'inactive' : 'active'}`}>{item.status || 'Completed'}</span></td></tr>)}
      </tbody></table></div>
    </section>
  </div></AdminLayout>
}
