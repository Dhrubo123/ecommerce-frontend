import { useEffect, useMemo, useState } from 'react'
import { FileDown, Plus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import '../brands/brands.css'

const titles = { debit: 'Debit Vouchers', credit: 'Credit Vouchers', contra: 'Contra Vouchers', journal: 'Journal Vouchers' }
const asList = (data) => Array.isArray(data) ? data : (data?.vouchers ?? data?.items ?? data?.data ?? [])
const text = (value) => value == null ? '—' : typeof value === 'object' ? (value.name ?? value.headName ?? '—') : String(value)
const amount = (row) => Number(row.amount ?? row.totalAmount ?? row.debit ?? row.credit ?? 0).toLocaleString()

export default function VoucherList({ type }) {
  const [rows, setRows] = useState([]); const [search, setSearch] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => { setLoading(true); api.get(`/admin/accounts/${type}-vouchers`).then((response) => setRows(asList(response.data?.data ?? response.data))).catch((requestError) => setError(requestError.response?.data?.message || `Unable to load ${titles[type].toLowerCase()}.`)).finally(() => setLoading(false)) }, [type])
  const visible = useMemo(() => rows.filter((row) => Object.values(row).some((value) => text(value).toLowerCase().includes(search.toLowerCase()))), [rows, search])
  return <AdminLayout title={titles[type]}><div className="brand-page voucher-list"><div className="brand-heading"><div><p>ACCOUNTS</p><h2>{titles[type]}</h2><span>Review saved vouchers and export the displayed list as a PDF.</span></div><div className="voucher-actions"><button type="button" className="voucher-export" onClick={() => window.print()}><FileDown size={16} />Export PDF</button><Link className="brand-primary" to={`/${type}-vouchers/create`}><Plus size={17} />Add Voucher</Link></div></div><section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vouchers" /></label></div>{error && <div className="brand-error">{error}</div>}<div className="brand-table"><table><thead><tr><th>Voucher No.</th><th>Date</th><th>Type</th><th>Account</th><th>Reverse Account</th><th>Amount</th><th>Comment</th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Loading vouchers…</td></tr> : !visible.length ? <tr><td colSpan="7">No vouchers found.</td></tr> : visible.map((row, index) => <tr key={row.id ?? index}><td>{text(row.voucherNumber ?? row.transactionNo ?? row.referenceNo ?? row.id)}</td><td>{text(row.date ?? row.transactionDate ?? row.createdAt).slice(0, 10)}</td><td>{text(row.subType ?? row.sub_type ?? type)}</td><td>{text(row.account?.name ?? row.accountName ?? row.account)}</td><td>{text(row.reverseAccount?.name ?? row.reverseAccountName ?? row.reverse_account)}</td><td><strong>{amount(row)}</strong></td><td>{text(row.ledgerComment ?? row.ledger_comment ?? row.remarks ?? row.description)}</td></tr>)}</tbody></table></div></section></div></AdminLayout>
}
