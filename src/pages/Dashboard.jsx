import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Boxes, CircleDollarSign, Package, ShoppingBag, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import { getDashboard } from '../services/dashboardService'
import { getEcommerceOrders } from '../services/ecommerceOrderService'
import { getCustomers } from '../services/customerService'
import { getProducts } from '../services/productService'
import './Dashboard.css'

const firstValue = (source, keys, fallback = 0) => {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null) return value
  }
  return fallback
}

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0)
const number = (value) => new Intl.NumberFormat('en-US').format(Number(value) || 0)
const asList = (value) => Array.isArray(value) ? value : (value?.data || value?.items || [])

function salesPoints(data, orders) {
  const reported = asList(data.salesChart || data.revenueChart || data.monthlySales || data.salesOverview || data.chart)
  if (reported.length) return reported.map((point, index) => ({ label: point.label || point.month || point.date || `Period ${index + 1}`, value: Number(firstValue(point, ['revenue', 'total', 'sales', 'amount', 'value'])) || 0 }))
  const grouped = orders.reduce((result, order) => {
    const rawDate = order.createdAt || order.created_at || order.saleDate || order.orderDate
    const parsed = rawDate ? new Date(rawDate) : null
    const label = parsed && !Number.isNaN(parsed.valueOf()) ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'
    result[label] = (result[label] || 0) + Number(firstValue(order, ['totalAmount', 'grandTotal', 'total', 'amount']))
    return result
  }, {})
  return Object.entries(grouped).slice(-7).map(([label, value]) => ({ label, value }))
}

function SalesChart({ points, loading }) {
  if (loading) return <div className="dashboard-chart-empty">Loading sales data…</div>
  if (!points.length || !points.some((point) => point.value > 0)) return <div className="dashboard-chart-empty">No sales data has been reported yet.</div>
  const width = 680; const height = 190; const maximum = Math.max(...points.map((point) => point.value), 1)
  const coordinates = points.map((point, index) => ({ x: points.length === 1 ? width / 2 : (index * width) / (points.length - 1), y: height - ((point.value / maximum) * (height - 24)) - 12 }))
  const line = coordinates.map(({ x, y }) => `${x},${y}`).join(' ')
  return <div className="dashboard-chart"><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label="Sales revenue graph"><polygon points={`0,${height} ${line} ${width},${height}`} className="chart-area" /><polyline points={line} className="chart-line" />{coordinates.map(({ x, y }, index) => <circle key={index} cx={x} cy={y} r="4" className="chart-point"><title>{`${points[index].label}: ${money(points[index].value)}`}</title></circle>)}</svg><div className="chart-labels">{points.map((point, index) => <span key={`${point.label}-${index}`}>{point.label}</span>)}</div></div>
}

function Dashboard() {
  const [data, setData] = useState({ dashboard: {}, liveOrders: null, customers: null, products: null })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getDashboard(), getEcommerceOrders(), getCustomers(), getProducts()])
      .then(([dashboard, orders, customers, products]) => {
        const liveDataAvailable = [orders, customers, products].some((result) => result.status === 'fulfilled')
        setData({
          dashboard: dashboard.status === 'fulfilled' ? dashboard.value : {},
          liveOrders: orders.status === 'fulfilled' ? orders.value : null,
          customers: customers.status === 'fulfilled' ? customers.value : null,
          products: products.status === 'fulfilled' ? products.value : null,
        })
        setError(liveDataAvailable ? '' : (dashboard.reason?.response?.data?.message || 'Dashboard data could not be loaded.'))
      }).finally(() => setLoading(false))
  }, [])

  const dashboard = data.dashboard || {}
  const summary = dashboard.summary || dashboard.stats || dashboard
  const liveOrders = Array.isArray(data.liveOrders) ? data.liveOrders : null
  const liveRevenue = liveOrders?.reduce((sum, order) => sum + Number(firstValue(order, ['totalAmount', 'grandTotal', 'total', 'amount'])), 0)
  const cards = [
    { label: 'Total Revenue', value: money(liveRevenue ?? firstValue(summary, ['totalRevenue', 'revenue', 'totalSales', 'sales'])), icon: CircleDollarSign, tone: 'blue' },
    { label: 'Total Orders', value: number(liveOrders?.length ?? firstValue(summary, ['totalOrders', 'orders', 'orderCount'])), icon: ShoppingBag, tone: 'violet' },
    { label: 'Customers', value: number(Array.isArray(data.customers) ? data.customers.length : firstValue(summary, ['totalCustomers', 'customers', 'customerCount'])), icon: Users, tone: 'amber' },
    { label: 'Products', value: number(Array.isArray(data.products) ? data.products.length : firstValue(summary, ['totalProducts', 'products', 'productCount'])), icon: Package, tone: 'green' },
  ]
  const recentOrders = liveOrders ?? (dashboard.recentOrders || dashboard.orders || [])
  const lowStock = dashboard.lowStockProducts || dashboard.lowStock || dashboard.lowStockItems || []
  const points = useMemo(() => salesPoints(dashboard, recentOrders), [dashboard, recentOrders])

  return <AdminLayout title="Dashboard"><div className="admin-dashboard">
    <section className="dashboard-welcome"><div><p>OVERVIEW</p><h2>Welcome back, Super Admin</h2><span>Here is what is happening across your store today.</span></div><div className="dashboard-date">Live store overview <span /></div></section>
    {error && <div className="dashboard-error">{error}</div>}
    <section className="dashboard-stats" aria-busy={loading}>{cards.map((card) => { const Icon = card.icon; return <article className={`dashboard-stat ${card.tone}`} key={card.label}><div className="dashboard-stat-icon"><Icon size={21} /></div><div><p>{card.label}</p><strong>{loading ? '—' : card.value}</strong><span><ArrowUpRight size={14} />Store performance</span></div></article> })}</section>
    <section className="dashboard-content-grid">
      <article className="dashboard-panel dashboard-revenue-panel"><div className="dashboard-panel-header"><div><p>SALES PERFORMANCE</p><h3>Revenue overview</h3></div><Link to="/reports/sales">Sales report</Link></div><SalesChart points={points} loading={loading} /></article>
      <article className="dashboard-panel dashboard-stock-panel"><div className="dashboard-panel-header"><div><p>INVENTORY</p><h3>Low stock alerts</h3></div><Boxes size={20} /></div><div className="dashboard-list">{loading ? <p className="dashboard-empty">Loading inventory…</p> : lowStock.length ? lowStock.slice(0, 4).map((item, index) => <div className="dashboard-list-row" key={item.id || index}><span className="item-dot">{item.name?.[0] || 'P'}</span><div><strong>{item.name || item.productName || 'Product'}</strong><small>{number(firstValue(item, ['stock', 'stockQuantity', 'quantity']))} items remaining</small></div><b>Low</b></div>) : <p className="dashboard-empty">No low-stock products reported.</p>}</div></article>
    </section>
    <section className="dashboard-panel dashboard-orders-panel"><div className="dashboard-panel-header"><div><p>RECENT ACTIVITY</p><h3>Latest orders</h3></div><Link to="/orders">View all</Link></div><div className="dashboard-orders-table"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>{loading ? <tr><td colSpan="4">Loading orders…</td></tr> : recentOrders.length ? recentOrders.slice(0, 5).map((order, index) => <tr key={order.id || index}><td>#{order.orderNumber || order.invoiceNumber || order.id || index + 1}</td><td>{order.customer?.name || order.customerName || [order.customerFirstName, order.customerLastName].filter(Boolean).join(' ') || 'Walk-in customer'}</td><td><span className="dashboard-order-status">{order.status || 'New'}</span></td><td>{money(firstValue(order, ['totalAmount', 'grandTotal', 'total', 'amount']))}</td></tr>) : <tr><td colSpan="4">No recent orders reported.</td></tr>}</tbody></table></div></section>
  </div></AdminLayout>
}

export default Dashboard
