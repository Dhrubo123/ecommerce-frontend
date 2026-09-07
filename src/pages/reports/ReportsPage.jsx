import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, Printer, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { getCustomers } from '../../services/customerService'
import { getProducts } from '../../services/productService'
import { getReport } from '../../services/reportService'
import { getSuppliers } from '../../services/supplierService'
import { getWarehouses } from '../../services/warehouseService'
import '../brands/brands.css'

const reports = {
  stock: { title: 'Stock Report', description: 'Review stock movements and current quantities by product and warehouse.', filters: ['productId', 'warehouseId'] },
  sales: { title: 'Sales Report', description: 'Review completed POS sales during the selected period.', filters: ['customerId', 'productId', 'warehouseId'] },
  purchases: { title: 'Purchase Report', description: 'Review received purchase line items during the selected period.', filters: ['supplierId', 'productId'] },
  'supplier-ledger': { title: 'Supplier Ledger', description: 'Review supplier opening, movement, and running balances.', filters: ['supplierId'] },
  'customer-ledger': { title: 'Customer Ledger', description: 'Review customer opening, movement, and running balances.', filters: ['customerId'] },
}
const labels = { productId: 'Product', warehouseId: 'Warehouse', customerId: 'Customer', supplierId: 'Supplier' }
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
const formatDate = (value) => { if (!value || typeof value !== 'string') return null; const parsed = new Date(value); return Number.isNaN(parsed.valueOf()) ? null : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(parsed) }
const amountOf = (value) => Number(String(value ?? 0).replaceAll(',', '')) || 0
const escapeHtml = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')

export default function ReportsPage({ report }) {
  const config = reports[report]
  const requiredPartyKey = report === 'supplier-ledger' ? 'supplierId' : report === 'customer-ledger' ? 'customerId' : null
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', productId: '', warehouseId: '', customerId: '', supplierId: '' })
  const [options, setOptions] = useState({ products: [], warehouses: [], customers: [], suppliers: [] })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const exportExcel = () => {
    const heading = report === 'sales' ? [...columns, 'Invoice'] : columns
    const cells = (values, tag = 'td') => `<tr>${values.map((value) => `<${tag}>${escapeHtml(value)}</${tag}>`).join('')}</tr>`
    const totals = report === 'sales'
      ? `<tr><td colspan="${heading.length}"><strong>Total sales: ${salesSummary.netSales}</strong></td></tr>`
      : Object.entries(data?.summary ?? {}).map(([key, value]) => `<tr><td colspan="${heading.length}"><strong>${escapeHtml(key.replace(/([A-Z])/g, ' $1'))}: ${escapeHtml(display(value))}</strong></td></tr>`).join('')
    const workbook = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><table>${cells(heading, 'th')}${visibleRows.map((row) => cells([...columns.map((key) => display(row[key])), ...(report === 'sales' ? [row.saleId ?? row.posSaleId ?? row.id ?? ''] : [])])).join('')}${totals}</table></body></html>`
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }))
    link.download = `${report}-report-${new Date().toISOString().slice(0, 10)}.xls`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  const load = async () => {
    if (requiredPartyKey && !filters[requiredPartyKey]) { setData(null); setError(''); return }
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) return setError('The end date must be on or after the start date.')
    setLoading(true); setError('')
    try {
      // The deployed stock summary endpoint currently returns HTTP 500 when
      // dateFrom/dateTo are supplied. It reports current stock, so omit those
      // unsupported query parameters while retaining product/warehouse filters.
      setData(await getReport(report, filters))
    }
    catch (requestError) { setData(null); setError(requestError.response?.data?.message || 'Unable to load this report.') }
    finally { setLoading(false) }
  }
  useEffect(() => {
    Promise.all([getProducts(), getWarehouses(), getCustomers(), getSuppliers()]).then(([products, warehouses, customers, suppliers]) => setOptions({ products, warehouses, customers, suppliers })).catch(() => {})
    load()
  }, [report])
  const rows = rowsOf(data)
  const visibleRows = useMemo(() => rows.filter((row) => Object.values(row).some((value) => display(value).toLowerCase().includes(search.toLowerCase()))), [rows, search])
  const columns = useMemo(() => [...new Set(rows.flatMap(Object.keys))].filter((key) => !(key === 'id' || key.endsWith('Id') || key.endsWith('_id') || /password|token/i.test(key)) && !['createdAt', 'updatedAt'].includes(key) && typeof rows.find((row) => row[key] !== undefined)?.[key] !== 'object'), [rows])
  const salesSummary = useMemo(() => {
    const summary = data?.summary ?? {}
    const saleIds = new Set(rows.map((row) => row.saleId ?? row.posSaleId ?? row.saleNumber ?? row.id).filter(Boolean))
    const quantity = rows.reduce((total, row) => total + amountOf(row.quantity), 0)
    const netSales = rows.reduce((total, row) => total + amountOf(row.lineTotal ?? row.netSales ?? row.total ?? row.amount), 0)
    return {
      sales: summary.sales ?? summary.totalSales ?? saleIds.size,
      quantity: summary.quantity ?? summary.totalQuantity ?? quantity,
      netSales: summary.netSales ?? summary.totalNetSales ?? summary.totalAmount ?? netSales,
    }
  }, [data, rows])
  const exportPdf = () => {
    const heading = report === 'sales' ? [...columns, 'Invoice'] : columns
    const summary = report === 'sales'
      ? `<section><h2>Total Sales Summary</h2><p><strong>Sales:</strong> ${escapeHtml(salesSummary.sales)} &nbsp;&nbsp; <strong>Quantity:</strong> ${escapeHtml(salesSummary.quantity)} &nbsp;&nbsp; <strong>Net sales:</strong> ${escapeHtml(salesSummary.netSales)}</p></section>`
      : data?.summary ? `<section><h2>Report Summary</h2><p>${Object.entries(data.summary).map(([key, value]) => `<strong>${escapeHtml(key.replace(/([A-Z])/g, ' $1'))}:</strong> ${escapeHtml(display(value))}`).join(' &nbsp;&nbsp; ')}</p></section>` : ''
    const body = visibleRows.map((row) => `<tr>${[...columns.map((key) => /date|created|updated|time/i.test(key) ? (formatDate(row[key]) || display(row[key])) : display(row[key])), ...(report === 'sales' ? [row.saleId ?? row.posSaleId ?? row.id ?? ''] : [])].map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('')
    const popup = window.open('', '_blank')
    if (!popup) return setError('Allow pop-ups to export this report as a PDF.')
    popup.opener = null
    popup.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(config.title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#14213d}h1{margin:0 0 6px}p{color:#52637a}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #d9e0ea;padding:7px;text-align:left}th{background:#f4f7fb}section{margin:20px 0}@media print{body{padding:0}}</style></head><body><h1>${escapeHtml(config.title)}</h1><p>Generated ${escapeHtml(new Date().toLocaleString())}</p>${summary}<h2>Individual Sales</h2><table><thead><tr>${heading.map((key) => `<th>${escapeHtml(key.replace(/([A-Z])/g, ' $1').replaceAll('_', ' '))}</th>`).join('')}</tr></thead><tbody>${body || `<tr><td colspan="${heading.length}">No records found.</td></tr>`}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`)
    popup.document.close()
  }
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize))
  const pagedRows = visibleRows.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => { setPage(1) }, [search, data, report])
  const optionFor = (key) => ({ productId: options.products, warehouseId: options.warehouses, customerId: options.customers, supplierId: options.suppliers }[key] || [])
  return <AdminLayout title={config.title}><div className="brand-page"><div className="brand-heading"><div><p>REPORTS</p><h2>{config.title}</h2><span>{config.description}</span></div></div>
    <section className="brand-card"><div className="brand-toolbar report-filters">{config.filters.map((key) => <label key={key}>{labels[key]}<select value={filters[key]} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}><option value="">All {labels[key].toLowerCase()}s</option>{optionFor(key).map((option) => <option key={option.id} value={option.id}>{optionLabel(key, option)}</option>)}</select></label>)}<label>From<input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label><label>To<input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label><button className="brand-primary" type="button" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Apply filters'}</button></div></section>
    {error && <div className="brand-error">{error}</div>}
    {report === 'sales' ? <div className="dashboard-stats"><article className="dashboard-stat blue"><div><p>Total sales</p><strong>{display(salesSummary.sales)}</strong></div></article><article className="dashboard-stat blue"><div><p>Total quantity</p><strong>{display(salesSummary.quantity)}</strong></div></article><article className="dashboard-stat blue"><div><p>Net sales</p><strong>{display(salesSummary.netSales)}</strong></div></article></div> : data?.summary && <div className="dashboard-stats">{Object.entries(data.summary).map(([key, value]) => <article className="dashboard-stat blue" key={key}><div><p>{key.replace(/([A-Z])/g, ' $1')}</p><strong>{display(value)}</strong></div></article>)}</div>}
    <section className="brand-card"><div className="brand-toolbar report-results-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search report" /></label><div className="report-export-actions"><button type="button" disabled={!visibleRows.length} onClick={exportPdf}><Printer size={16} /> Export PDF</button><button className="brand-primary" type="button" disabled={!visibleRows.length} onClick={exportExcel}><Download size={16} /> Export Excel</button></div></div>{report === 'sales' && <div className="report-table-heading"><h3>Individual Sales</h3><span>{visibleRows.length} line{visibleRows.length === 1 ? '' : 's'} shown</span></div>}<div className="brand-table"><table><thead><tr>{columns.map((key) => <th key={key}>{key.replace(/([A-Z])/g, ' $1').replaceAll('_', ' ')}</th>)}{report === 'sales' && <th>Invoice</th>}</tr></thead><tbody>{loading ? <tr><td colSpan={columns.length + 1 || 1}>Loading report…</td></tr> : requiredPartyKey && !filters[requiredPartyKey] ? <tr><td colSpan={columns.length + 1 || 1}>Select a {requiredPartyKey === 'supplierId' ? 'supplier' : 'customer'} and apply filters to view the ledger.</td></tr> : !visibleRows.length ? <tr><td colSpan={columns.length + 1 || 1}>No records found.</td></tr> : pagedRows.map((row, index) => <tr key={row.id ?? index}>{columns.map((key) => <td key={key}>{/date|created|updated|time/i.test(key) ? (formatDate(row[key]) || display(row[key])) : display(row[key])}</td>)}{report === 'sales' && <td>{row.saleId ?? row.posSaleId ?? row.id ? <Link className="table-icon-link" title="View POS invoice" to={`/pos-sales/${row.saleId ?? row.posSaleId ?? row.id}/invoice`}><FileText size={16} /></Link> : '—'}</td>}</tr>)}</tbody></table></div>{visibleRows.length > pageSize && <div className="pos-pagination"><span>Page {page} of {totalPages}</span><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Next</button></div>}</section>
  </div></AdminLayout>
}
