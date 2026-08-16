import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteBank, getBanks } from '../../services/bankService'
import '../brands/brands.css'

export default function BankList() {
  const [banks, setBanks] = useState([]); const [search, setSearch] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); getBanks({ search }).then(setBanks).catch((e) => setError(e.response?.data?.message || 'Unable to load banks.')).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [search])
  const remove = async (id) => { if (!window.confirm('Delete this bank account?')) return; try { await deleteBank(id); load() } catch (e) { setError(e.response?.data?.message || 'Unable to delete bank.') } }
  return <AdminLayout title="Banks"><div className="brand-page"><div className="brand-heading"><div><p>ACCOUNTS</p><h2>Bank Accounts</h2><span>Manage company bank account details and routing information.</span></div><Link className="brand-primary" to="/banks/create"><Plus size={17} />Add Bank</Link></div><section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search bank or account number" /></label></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Bank</th><th>Account Name</th><th>Account Number</th><th>Branch</th><th>Routing Number</th><th>Status</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Loading banks…</td></tr> : banks.length === 0 ? <tr><td colSpan="7">No bank accounts found.</td></tr> : banks.map((bank) => <tr key={bank.id}><td><strong>{bank.name}</strong></td><td>{bank.accountName}</td><td>{bank.accountNumber}</td><td>{bank.branch || '—'}</td><td>{bank.routingNumber || '—'}</td><td><span className={`brand-status ${bank.isActive ? 'active' : 'inactive'}`}>{bank.isActive ? 'Active' : 'Inactive'}</span></td><td><div className="brand-actions"><Link to={`/banks/${bank.id}/edit`} title="Edit bank"><Pencil size={16} /></Link><button onClick={() => remove(bank.id)} title="Delete bank"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></section></div></AdminLayout>
}
