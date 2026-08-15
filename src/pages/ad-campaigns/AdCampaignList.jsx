import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, Megaphone, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteAdCampaign, getAdCampaigns } from '../../services/adCampaignService'
import '../brands/brands.css'

export default function AdCampaignList() {
  const [campaigns, setCampaigns] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = async () => { setLoading(true); try { setCampaigns(await getAdCampaigns()); setError('') } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load ad campaigns.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const visibleCampaigns = useMemo(() => { const term = search.trim().toLowerCase(); return term ? campaigns.filter((campaign) => campaign.title?.toLowerCase().includes(term)) : campaigns }, [campaigns, search])
  const remove = async (campaign) => { if (!window.confirm(`Delete “${campaign.title}”?`)) return; try { await deleteAdCampaign(campaign.id); await load() } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete ad campaign.') } }

  return <AdminLayout title="Ad Campaigns"><div className="brand-page"><div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>Ad Campaigns</h2><span>Manage promotional advertising campaigns.</span></div><Link className="brand-primary" to="/ad-campaigns/create"><Plus size={17} /> Add Campaign</Link></div>
    <section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search campaigns" /></label></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Image</th><th>Title</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>
      {loading ? <tr><td colSpan="5">Loading ad campaigns...</td></tr> : visibleCampaigns.length === 0 ? <tr><td colSpan="5">No campaigns found.</td></tr> : visibleCampaigns.map((campaign) => <tr key={campaign.id}><td>{campaign.image ? <img src={campaign.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <span className="brand-logo-placeholder"><ImageIcon size={17} /></span>}</td><td><strong><Megaphone size={14} /> {campaign.title}</strong></td><td><span className={`brand-status ${campaign.isActive ? 'active' : 'inactive'}`}>{campaign.isActive ? 'Active' : 'Inactive'}</span></td><td>{campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '—'}</td><td><div className="brand-actions"><Link to={`/ad-campaigns/${campaign.id}/edit`} aria-label="Edit campaign"><Pencil size={15} /></Link><button type="button" onClick={() => remove(campaign)} aria-label="Delete campaign"><Trash2 size={15} /></button></div></td></tr>)}
    </tbody></table></div></section>
  </div></AdminLayout>
}
