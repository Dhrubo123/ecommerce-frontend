import { useEffect, useState } from 'react'
import { Edit3, Palette, Plus, Search, X } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { createColor, getColors, updateColor } from '../../services/colorService'
import './colors.css'

const empty = { name: '', hex: '#2563eb', isActive: true }

export default function ColorList() {
  const [colors, setColors] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const load = () => getColors().then(setColors).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load colors.'))
  useEffect(() => { load() }, [])
  const shown = colors.filter((color) => color.name.toLowerCase().includes(search.toLowerCase()))
  const openCreate = () => { setEditing(false); setForm(empty); setError('') }
  const openEdit = (color) => { setEditing(color); setForm({ ...color }); setError('') }
  const save = async (event) => { event.preventDefault(); if (!form.name.trim()) return setError('Color name is required.'); try { await (editing ? updateColor(editing.id, form) : createColor(form)); setEditing(null); load() } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save color.') } }
  const toggle = async (color) => { try { await updateColor(color.id, { isActive: !color.isActive }); load() } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to update color status.') } }
  return <AdminLayout title="Colors"><div className="color-page"><div className="color-heading"><div><p>PRODUCT ATTRIBUTES</p><h2>Color List</h2><span>Manage the color options available for product variants.</span></div><button onClick={openCreate}><Plus size={17} />Add Color</button></div><section className="color-card"><div className="color-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search colors" /></label><span>{shown.length} colors</span></div>{error && editing === null && <div className="brand-error">{error}</div>}<table><thead><tr><th>SL</th><th>Name</th><th>Color</th><th>Hex code</th><th>Status</th><th>Action</th></tr></thead><tbody>{shown.map((color, index) => <tr key={color.id}><td>{index + 1}</td><td><strong>{color.name}</strong></td><td><span className="color-swatch" style={{ background: color.hex }} /></td><td><code>{color.hex}</code></td><td><button className={`color-toggle ${color.isActive ? 'on' : ''}`} onClick={() => toggle(color)} aria-label={`Set ${color.name} ${color.isActive ? 'inactive' : 'active'}`}><span /></button></td><td><button className="color-edit" onClick={() => openEdit(color)} aria-label={`Edit ${color.name}`}><Edit3 size={17} /></button></td></tr>)}</tbody></table></section>{editing !== null && <div className="color-modal-backdrop"><form className="color-modal" onSubmit={save}><button className="modal-close" type="button" onClick={() => setEditing(null)}><X size={18} /></button><div className="modal-icon"><Palette size={20} /></div><h3>{editing ? 'Edit Color' : 'Add Color'}</h3><p>Create a consistent product variant option.</p>{error && <div className="brand-error">{error}</div>}<label>Color Name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Purple" autoFocus /></label><label>Color Value<div className="color-input"><input type="color" value={form.hex} onChange={(event) => setForm((current) => ({ ...current, hex: event.target.value }))} /><input value={form.hex} onChange={(event) => setForm((current) => ({ ...current, hex: event.target.value }))} /></div></label><label className="modal-status"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />Active color</label><div className="modal-actions"><button type="button" onClick={() => setEditing(null)}>Cancel</button><button>{editing ? 'Update Color' : 'Save Color'}</button></div></form></div>}</div></AdminLayout>
}
