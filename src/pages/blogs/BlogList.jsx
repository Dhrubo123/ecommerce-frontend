import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteBlog, getBlogs } from '../../services/blogService'
import '../brands/brands.css'
import './blogs.css'

export default function BlogList() {
  const [blogs, setBlogs] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setBlogs(await getBlogs({ search })); setError('') }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load blogs.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  const remove = async (blog) => {
    if (!window.confirm(`Delete “${blog.title}”?`)) return
    try { await deleteBlog(blog.id); await load() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete blog.') }
  }

  return <AdminLayout title="Blogs"><div className="brand-page">
    <div className="brand-heading"><div><p>MARKETING & CONTENT</p><h2>Blogs</h2><span>Create and manage helpful content for your customers.</span></div><Link className="brand-primary" to="/blogs/create"><Plus size={17} />Add Blog</Link></div>
    <section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, category, or tag" /></label></div>{error && <div className="brand-error">{error}</div>}
      <div className="brand-table"><table><thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Tags</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading blogs…</td></tr> : blogs.length === 0 ? <tr><td colSpan="7">No blogs found.</td></tr> : blogs.map((blog) => <tr key={blog.id}><td>{blog.image ? <img src={blog.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <span className="brand-logo-placeholder">B</span>}</td><td><strong>{blog.title}</strong><small className="blog-slug">/{blog.slug}</small></td><td>{blog.category || '—'}</td><td><div className="blog-tags">{(blog.tags || []).slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div></td><td><span className={`brand-status ${blog.isActive ? 'active' : 'inactive'}`}>{blog.isActive ? 'Active' : 'Inactive'}</span></td><td>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '—'}</td><td><div className="brand-actions"><Link to={`/blogs/${blog.id}/edit`} aria-label="Edit blog"><Pencil size={15} /></Link><button type="button" onClick={() => remove(blog)} aria-label="Delete blog"><Trash2 size={15} /></button></div></td></tr>)}
      </tbody></table></div>
    </section>
  </div></AdminLayout>
}
