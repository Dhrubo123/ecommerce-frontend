import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteSupplier, getSuppliers } from '../../services/supplierService'
import '../brands/brands.css'
import './suppliers.css'

export default function SupplierList() {
  const [items, setItems] = useState([]); const [search, setSearch] = useState(''); const [error, setError] = useState('')
  const load = () => getSuppliers({ search }).then(setItems).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load suppliers.'))
  useEffect(() => { load() }, [search])
  return <AdminLayout title="Suppliers"><div className="brand-page"><div className="brand-heading"><div><p>INVENTORY & PURCHASE</p><h2>Suppliers</h2><span>Manage supplier contacts for purchasing and inventory.</span></div><Link className="brand-primary" to="/suppliers/create"><Plus size={17} />Add Supplier</Link></div><section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search suppliers" /></label></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Supplier</th><th>Phone</th><th>Email</th><th>Address</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map((supplier) => <tr key={supplier.id}><td><strong>{supplier.name}</strong></td><td>{supplier.phone}</td><td>{supplier.email}</td><td>{supplier.address}</td><td><span className={`brand-status ${supplier.isActive ? 'active' : 'inactive'}`}>{supplier.isActive ? 'active' : 'inactive'}</span></td><td><div className="brand-actions"><Link to={`/suppliers/${supplier.id}/edit`}><Pencil size={16} /></Link><button type="button" onClick={async () => { if (confirm('Delete this supplier?')) { await deleteSupplier(supplier.id); load() } }}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></section></div></AdminLayout>
}
