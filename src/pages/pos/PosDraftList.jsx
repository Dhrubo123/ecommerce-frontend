import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Plus, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deletePosDraft, getPosDrafts } from '../../services/posSaleService'
import '../brands/brands.css'

export default function PosDraftList() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); getPosDrafts().then((data) => { setDrafts(data); setError('') }).catch((err) => setError(err.response?.data?.message || 'Unable to load POS drafts.')).finally(() => setLoading(false)) }
  useEffect(load, [])
  const remove = async (id) => { if (!window.confirm('Delete this POS draft?')) return; try { await deletePosDraft(id); load() } catch (err) { setError(err.response?.data?.message || 'Unable to delete POS draft.') } }
  return <AdminLayout title="POS Drafts"><div className="brand-page"><div className="brand-heading"><div><p>POINT OF SALE</p><h2>POS Drafts</h2><span>Park an unfinished customer sale and resume it later.</span></div><Link className="brand-primary" to="/pos-sales/create"><Plus size={17} />New POS Sale</Link></div><section className="brand-card">{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Draft</th><th>Customer</th><th>Warehouse</th><th>Items</th><th>Total</th><th>Updated</th><th>Action</th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Loading drafts…</td></tr> : drafts.length === 0 ? <tr><td colSpan="7">No POS drafts found.</td></tr> : drafts.map((draft) => <tr key={draft.id}><td>#{draft.id}</td><td>{draft.customer?.name || draft.customerName || 'Walk-in customer'}</td><td>{draft.warehouse?.name || draft.warehouseName || '—'}</td><td>{draft.items?.length ?? draft.itemCount ?? 0}</td><td>{draft.grandTotal ?? draft.totalAmount ?? 0}</td><td>{draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : '—'}</td><td><div className="brand-actions"><button type="button" title="Resume draft" onClick={() => navigate('/pos-sales/create', { state: { draft } })}><Play size={15} /></button><button type="button" title="Delete draft" onClick={() => remove(draft.id)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section></div></AdminLayout>
}
