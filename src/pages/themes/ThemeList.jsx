import { useEffect, useState } from 'react'
import { CheckCircle2, Palette, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { activateTheme, deleteTheme, getThemes } from '../../services/themeService'
import './themes.css'

const presetBackgrounds = { grocery: 'linear-gradient(135deg, #15803d, #86efac)', tech: 'linear-gradient(135deg, #1d4ed8, #67e8f9)', fashion: 'linear-gradient(135deg, #be185d, #f9a8d4)' }

export default function ThemeList() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [workingId, setWorkingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setThemes(await getThemes()); setError('') } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load themes.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const activate = async (theme) => {
    if (theme.isActive || !window.confirm(`Activate “${theme.name}” for the storefront?`)) return
    setWorkingId(theme.id)
    try { await activateTheme(theme.id); setMessage(`${theme.name} is now the active storefront theme.`); await load() } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to activate this theme.') } finally { setWorkingId(null) }
  }
  const remove = async (theme) => {
    if (theme.isActive || !window.confirm(`Delete “${theme.name}”?`)) return
    setWorkingId(theme.id)
    try { await deleteTheme(theme.id); setMessage('Theme deleted.'); await load() } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete this theme.') } finally { setWorkingId(null) }
  }

  return <AdminLayout title="Theme Management"><div className="theme-page">
    <div className="theme-heading"><div><p>STOREFRONT SETTINGS</p><h2>Theme Management</h2><span>Select the design system customers see in your storefront.</span></div><Link to="/themes/create" className="theme-primary"><Plus size={17} /> Create Theme</Link></div>
    {error && <div className="theme-error">{error}</div>}{message && <div className="theme-success">{message}</div>}
    <div className="theme-notice"><Palette size={19} /><div><strong>One active theme</strong><span>Activating a theme changes the design for your storefront. Keep your product and order data unchanged.</span></div></div>
    {loading ? <div className="theme-empty">Loading themes...</div> : themes.length === 0 ? <div className="theme-empty">No themes created yet. <Link to="/themes/create">Create your first theme</Link>.</div> : <div className="theme-grid">{themes.map((theme) => <article className={`theme-card ${theme.isActive ? 'is-active' : ''}`} key={theme.id}>
      <div className="theme-preview" style={{ background: theme.thumbnail ? undefined : presetBackgrounds[theme.key] || 'linear-gradient(135deg, #2563eb, #a5b4fc)' }}>{theme.thumbnail ? <img src={theme.thumbnail} alt={`${theme.name} preview`} onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <><span className="theme-preview-store">Your Store</span><span className="theme-preview-search">Search products</span><div className="theme-preview-products"><i /><i /><i /></div></>}</div>
      <div className="theme-card-body"><div className="theme-card-title"><div><h3>{theme.name}</h3><code>{theme.key}</code></div>{theme.isActive && <span className="theme-active"><CheckCircle2 size={14} /> Active</span>}</div><p>{theme.description || 'A custom storefront design.'}</p><div className="theme-colors"><span style={{ background: theme.settings?.primaryColor || '#2563eb' }} /><span style={{ background: theme.settings?.secondaryColor || '#111827' }} /><small>{theme.settings?.fontFamily || 'Inter'}</small></div><div className="theme-actions"><Link to={`/themes/${theme.id}/edit`}><Pencil size={15} /> Customize</Link>{theme.isActive ? <button type="button" disabled className="active-button"><CheckCircle2 size={15} /> Currently active</button> : <button type="button" className="theme-primary" onClick={() => activate(theme)} disabled={workingId === theme.id}>{workingId === theme.id ? <RefreshCw className="spin" size={15} /> : <Palette size={15} />}{workingId === theme.id ? 'Activating...' : 'Activate'}</button>}<button type="button" className="delete-theme" onClick={() => remove(theme)} disabled={workingId === theme.id} aria-label={`Delete ${theme.name}`}><Trash2 size={16} /></button></div></div>
    </article>)}</div>}
  </div></AdminLayout>
}
