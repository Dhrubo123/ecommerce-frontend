import { useEffect, useState } from 'react'
import { AlertTriangle, Boxes, Search } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getStockReports } from '../../services/stockReportService'
import '../brands/brands.css'

const firstValue = (source, keys, fallback = '—') => {
  for (const key of keys) if (source?.[key] !== undefined && source?.[key] !== null) return source[key]
  return fallback
}

export default function StockReportList() {
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getStockReports().then((data) => { setReports(data); setError('') }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load stock reports.')).finally(() => setLoading(false))
  }, [])

  const visibleReports = reports.filter((item) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    return [item.product?.name, item.productName, item.name, item.product?.sku, item.sku, item.warehouse?.name, item.warehouseName]
      .some((value) => String(value || '').toLowerCase().includes(query))
  })

  const lowStockCount = reports.filter((item) => {
    const current = Number(firstValue(item, ['stock', 'stockQuantity', 'availableQuantity', 'quantity'], 0))
    const minimum = Number(firstValue(item, ['minimumStock', 'minStock', 'reorderLevel'], 0))
    return minimum > 0 && current <= minimum
  }).length

  return <AdminLayout title="Stock Report"><div className="brand-page">
    <div className="brand-heading"><div><p>INVENTORY & PURCHASE</p><h2>Stock Report</h2><span>Monitor stock quantities across your products and warehouses.</span></div></div>
    <div className="dashboard-stats stock-report-summary"><article className="dashboard-stat blue"><div className="dashboard-stat-icon"><Boxes size={21} /></div><div><p>Stock Records</p><strong>{loading ? '—' : reports.length}</strong><span>Available inventory lines</span></div></article><article className="dashboard-stat amber"><div className="dashboard-stat-icon"><AlertTriangle size={21} /></div><div><p>Low Stock</p><strong>{loading ? '—' : lowStockCount}</strong><span>Items at reorder level</span></div></article></div>
    <section className="brand-card"><div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product, SKU, or warehouse" /></label></div>{error && <div className="brand-error">{error}</div>}
      <div className="brand-table"><table><thead><tr><th>Product</th><th>SKU</th><th>Warehouse</th><th>Available Stock</th><th>Reserved</th><th>Reorder Level</th><th>Status</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading stock report…</td></tr> : visibleReports.length === 0 ? <tr><td colSpan="7">No stock records found.</td></tr> : visibleReports.map((item, index) => { const stock = firstValue(item, ['stock', 'stockQuantity', 'availableQuantity', 'quantity'], 0); const minimum = firstValue(item, ['minimumStock', 'minStock', 'reorderLevel'], 0); const isLow = Number(minimum) > 0 && Number(stock) <= Number(minimum); return <tr key={item.id || `${item.productId}-${item.warehouseId}-${index}`}><td><strong>{item.product?.name || item.productName || item.name || 'Product'}</strong></td><td>{item.product?.sku || item.sku || '—'}</td><td>{item.warehouse?.name || item.warehouseName || '—'}</td><td>{stock}</td><td>{firstValue(item, ['reservedQuantity', 'reservedStock', 'reserved'], 0)}</td><td>{minimum}</td><td><span className={`brand-status ${isLow ? 'inactive' : 'active'}`}>{isLow ? 'Low stock' : 'In stock'}</span></td></tr> })}
      </tbody></table></div>
    </section>
  </div></AdminLayout>
}
