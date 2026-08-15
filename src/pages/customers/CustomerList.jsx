import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleUserRound, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteCustomer, getCustomers } from '../../services/customerService'
import '../brands/brands.css'

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try { setCustomers(await getCustomers()); setError('') }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load customers.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const visibleCustomers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return term ? customers.filter((customer) => [customer.firstName, customer.lastName, customer.phone, customer.email].some((value) => String(value || '').toLowerCase().includes(term))) : customers
  }, [customers, search])
  const remove = async (customer) => {
    const name = `${customer.firstName} ${customer.lastName}`.trim()
    if (!window.confirm(`Delete “${name}”?`)) return
    try { await deleteCustomer(customer.id); await load() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete customer.') }
  }

  return <AdminLayout title="Customers"><div className="brand-page"><div className="brand-heading"><div><p>PEOPLE & SUPPORT</p><h2>Customers</h2><span>Manage customer profiles and contact details.</span></div><Link className="brand-primary" to="/customers/create"><Plus size={17} /> Add Customer</Link></div><section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" /></label></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Customer</th><th>Phone</th><th>Email</th><th>Gender</th><th>Date of Birth</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    {loading ? <tr><td colSpan="7">Loading customers...</td></tr> : visibleCustomers.length === 0 ? <tr><td colSpan="7">No customers found.</td></tr> : visibleCustomers.map((customer) => <tr key={customer.id}><td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>{customer.image ? <img src={customer.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <span className="brand-logo-placeholder"><CircleUserRound size={17} /></span>}<strong>{`${customer.firstName} ${customer.lastName}`.trim()}</strong></div></td><td>{customer.phone}</td><td>{customer.email}</td><td>{customer.gender || '—'}</td><td>{customer.dateOfBirth || '—'}</td><td><span className={`brand-status ${customer.isActive ? 'active' : 'inactive'}`}>{customer.isActive ? 'Active' : 'Inactive'}</span></td><td><div className="brand-actions"><Link to={`/customers/${customer.id}/edit`} aria-label="Edit customer"><Pencil size={15} /></Link><button type="button" onClick={() => remove(customer)} aria-label="Delete customer"><Trash2 size={15} /></button></div></td></tr>)}
  </tbody></table></div></section></div></AdminLayout>
}
