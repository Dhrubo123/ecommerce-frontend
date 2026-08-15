import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteBanner, getBanners } from '../../services/bannerService'
import '../brands/brands.css'

export default function BannerList() {
  const [banners, setBanners] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setBanners(await getBanners())
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load banners.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filteredBanners = useMemo(() => {
    const term = search.trim().toLowerCase()
    return term ? banners.filter((banner) => banner.title?.toLowerCase().includes(term)) : banners
  }, [banners, search])

  const remove = async (banner) => {
    if (!window.confirm(`Delete “${banner.title}”?`)) return
    try {
      await deleteBanner(banner.id)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete banner.')
    }
  }

  return (
    <AdminLayout title="Banners">
      <div className="brand-page">
        <div className="brand-heading">
          <div><p>MARKETING & CONTENT</p><h2>Banners</h2><span>Manage promotional banners for your storefront.</span></div>
          <Link className="brand-primary" to="/banners/create"><Plus size={17} /> Add Banner</Link>
        </div>
        <section className="brand-card">
          <div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search banners" /></label></div>
          {error && <div className="brand-error">{error}</div>}
          <div className="brand-table"><table>
            <thead><tr><th>Image</th><th>Title</th><th>Placement</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6">Loading banners...</td></tr> : filteredBanners.length === 0 ? <tr><td colSpan="6">No banners found.</td></tr> : filteredBanners.map((banner) => <tr key={banner.id}>
                <td>{banner.image ? <img src={banner.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <span className="brand-logo-placeholder"><ImageIcon size={17} /></span>}</td>
                <td><strong>{banner.title}</strong></td>
                <td>{banner.isOwnShop ? 'Own Shop' : 'Marketplace'}</td>
                <td><span className={`brand-status ${banner.isActive ? 'active' : 'inactive'}`}>{banner.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>{banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : '—'}</td>
                <td><div className="brand-actions"><Link to={`/banners/${banner.id}/edit`} aria-label="Edit banner"><Pencil size={15} /></Link><button type="button" onClick={() => remove(banner)} aria-label="Delete banner"><Trash2 size={15} /></button></div></td>
              </tr>)}
            </tbody>
          </table></div>
        </section>
      </div>
    </AdminLayout>
  )
}
