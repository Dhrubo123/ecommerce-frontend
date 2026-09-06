import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getCustomers } from '../../services/customerService'
import { getProducts } from '../../services/productService'
import { getReport } from '../../services/reportService'
import { getSuppliers } from '../../services/supplierService'
import { getWarehouses } from '../../services/warehouseService'
import '../brands/brands.css'

const reports = {
  stock: { title: 'Stock Report', description: 'Review stock movements and current quantities by product and warehouse.', filters: ['productId', 'warehouseId'] },
  sales: { title: 'Sales Report', description: 'Review completed POS sales during the selected period.', filters: ['customerId', 'productId'] },
  purchases: { title: 'Purchase Report', description: 'Review received purchase line items during the selected period.', filters: ['supplierId', 'productId'] },
  'supplier-ledger': { title: 'Supplier Ledger', description: 'Review supplier opening, movement, and running balances.', filters: ['supplierId'] },
  'customer-ledger': { title: 'Customer Ledger', description: 'Review customer opening, movement, and running balances.', filters: ['customerId'] },
}
const labels = { productId: 'Product', warehouseId: 'Warehouse', customerId: 'Customer', supplierId: 'Supplier' }
const dateToday = new Date().toLocaleDateString('en-CA')
const dateStart = `${new Date().getFullYear()}-01-01`
const rowsOf = (data) => {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  return Object.values(data).find(Array.isArray) || []
}
const display = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return value.name ?? value.productName ?? value.customerName ?? value.supplierName ?? '—'
  return String(value)
}
const titleOf = (value) => value.name || `${value.firstName ?? ''} ${value.lastName ?? ''}`.trim() || value.productName || value.supplierName || value.customerName || value.warehouseName || `#${value.id}`
const optionLabel = (key, value) => key === 'customerId' ? `${value.id}. ${titleOf(value)}` : titleOf(value)

export default function ReportsPage({ report }) {
  const config = reports[report]
  const requiredPartyKey = report === 'supplier-ledger' ? 'supplierId' : report === 'customer-ledger' ? 'customerId' : null
  const [filters, setFilters] = useState({ dateFrom: dateStart, dateTo: dateToday, productId: '', warehouseId: '', customerId: '', supplierId: '' })
  const [options, setOptions] = useState({ products: [], warehouses: [], customers: [], suppliers: [] })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const load = async () => {
    if (requiredPartyKey && !filters[requiredPartyKey]) { setData(null); setError(''); return }
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) return setError('The end date must be on or after the start date.')
    setLoading(true); setError('')
    try { setData(await getReport(report, filters)) }
    catch (requestError) { setData(null); setError(requestError.response?.data?.message || 'Unable to load this report.') }
    finally { setLoading(false) }
  }
  useEffect(() => {
    Promise.all([getProducts(), getWarehouses(), getCustomers(), getSuppliers()]).then(([products, warehouses, customers, suppliers]) => setOptions({ products, warehouses, customers, suppliers })).catch(() => {})
    load()
  }, [report])
  const rows = rowsOf(data)
  const visibleRows = useMemo(() => rows.filter((row) => Object.values(row).some((value) => display(value).toLowerCase().includes(search.toLowerCase()))), [rows, search])
  const columns = useMemo(() => [...new Set(rows.flatMap(Object.keys))].filter((key) => !['id', 'createdAt', 'updatedAt', 'password', 'token'].includes(key) && typeof rows.find((row) => row[key] !== undefined)?.[key] !== 'object'), [rows])
  const optionFor = (key) => ({ productId: options.products, warehouseId: options.warehouses, customerId: options.customers, supplierId: options.suppliers }[key] || [])
  return <AdminLayout title={config.title}><div className="brand-page"><div className="brand-heading"><div><p>REPORTS</p><h2>{config.title}</h2><span>{config.description}</span></div></div>
    <section className="brand-card"><div className="brand-toolbar report-filters">{config.filters.map((key) => <label key={key}>{labels[key]}<select value={filters[key]} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}><option value="">All {labels[key].toLowerCase()}s</option>{optionFor(key).map((option) => <option key={option.id} value={option.id}>{optionLabel(key, option)}</option>)}</select></label>)}<label>From<input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label><label>To<input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label><button className="brand-primary" type="button" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Apply filters'}</button></div></section>
    {error && <div className="brand-error">{error}</div>}
    {data?.summary && <div className="dashboard-stats">{Object.entries(data.summary).map(([key, value]) => <article className="dashboard-stat blue" key={key}><div><p>{key.replace(/([A-Z])/g, ' $1')}</p><strong>{display(value)}</strong></div></article>)}</div>}
    <section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search report" /></label></div><div className="brand-table"><table><thead><tr>{columns.map((key) => <th key={key}>{key.replace(/([A-Z])/g, ' $1').replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={columns.length || 1}>Loading report…</td></tr> : requiredPartyKey && !filters[requiredPartyKey] ? <tr><td colSpan={columns.length || 1}>Select a {requiredPartyKey === 'supplierId' ? 'supplier' : 'customer'} and apply filters to view the ledger.</td></tr> : !visibleRows.length ? <tr><td colSpan={columns.length || 1}>No records found.</td></tr> : visibleRows.map((row, index) => <tr key={row.id ?? index}>{columns.map((key) => <td key={key}>{display(row[key])}</td>)}</tr>)}</tbody></table></div></section>
  </div></AdminLayout>
}
