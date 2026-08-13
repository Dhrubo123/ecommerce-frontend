import { useEffect, useState } from 'react'
import { ArrowUpRight, Boxes, CircleDollarSign, Package, ShoppingBag, Users } from 'lucide-react'
import AdminLayout from '../components/layout/AdminLayout'
import { getDashboard } from '../services/dashboardService'
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

function Dashboard() {
  const [data, setData] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then((response) => { setData(response); setError('') }).catch((requestError) => setError(requestError.response?.data?.message || 'Dashboard data could not be loaded.')).finally(() => setLoading(false))
  }, [])

  const summary = data.summary || data.stats || data
  const cards = [
    { label: 'Total Revenue', value: money(firstValue(summary, ['totalRevenue', 'revenue', 'totalSales', 'sales'])), icon: CircleDollarSign, tone: 'blue' },
    { label: 'Total Orders', value: number(firstValue(summary, ['totalOrders', 'orders', 'orderCount'])), icon: ShoppingBag, tone: 'violet' },
    { label: 'Customers', value: number(firstValue(summary, ['totalCustomers', 'customers', 'customerCount'])), icon: Users, tone: 'amber' },
    { label: 'Products', value: number(firstValue(summary, ['totalProducts', 'products', 'productCount'])), icon: Package, tone: 'green' },
  ]
  const recentOrders = data.recentOrders || data.orders || []
  const lowStock = data.lowStockProducts || data.lowStock || data.lowStockItems || []

  return <AdminLayout title="Dashboard"><div className="admin-dashboard">
    <section className="dashboard-welcome"><div><p>OVERVIEW</p><h2>Welcome back, Super Admin</h2><span>Here is what is happening across your store today.</span></div><div className="dashboard-date">Live store overview <span /></div></section>
    {error && <div className="dashboard-error">{error}</div>}
    <section className="dashboard-stats" aria-busy={loading}>{cards.map((card) => { const Icon = card.icon; return <article className={`dashboard-stat ${card.tone}`} key={card.label}><div className="dashboard-stat-icon"><Icon size={21} /></div><div><p>{card.label}</p><strong>{loading ? '—' : card.value}</strong><span><ArrowUpRight size={14} />Store performance</span></div></article> })}</section>
    <section className="dashboard-content-grid">
      <article className="dashboard-panel dashboard-revenue-panel"><div className="dashboard-panel-header"><div><p>SALES PERFORMANCE</p><h3>Revenue overview</h3></div><button type="button">This month</button></div><div className="dashboard-chart" aria-label="Revenue chart placeholder"><div className="chart-line" /><div className="chart-labels"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div></div></article>
      <article className="dashboard-panel dashboard-stock-panel"><div className="dashboard-panel-header"><div><p>INVENTORY</p><h3>Low stock alerts</h3></div><Boxes size={20} /></div><div className="dashboard-list">{loading ? <p className="dashboard-empty">Loading inventory…</p> : lowStock.length ? lowStock.slice(0, 4).map((item, index) => <div className="dashboard-list-row" key={item.id || index}><span className="item-dot">{item.name?.[0] || 'P'}</span><div><strong>{item.name || item.productName || 'Product'}</strong><small>{number(firstValue(item, ['stock', 'stockQuantity', 'quantity']))} items remaining</small></div><b>Low</b></div>) : <p className="dashboard-empty">No low-stock products reported.</p>}</div></article>
    </section>
    <section className="dashboard-panel dashboard-orders-panel"><div className="dashboard-panel-header"><div><p>RECENT ACTIVITY</p><h3>Latest orders</h3></div><button type="button">View all</button></div><div className="dashboard-orders-table"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>{loading ? <tr><td colSpan="4">Loading orders…</td></tr> : recentOrders.length ? recentOrders.slice(0, 5).map((order, index) => <tr key={order.id || index}><td>#{order.orderNumber || order.id || index + 1}</td><td>{order.customer?.name || order.customerName || 'Walk-in customer'}</td><td><span className="dashboard-order-status">{order.status || 'New'}</span></td><td>{money(firstValue(order, ['totalAmount', 'total', 'amount']))}</td></tr>) : <tr><td colSpan="4">No recent orders reported.</td></tr>}</tbody></table></div></section>
  </div></AdminLayout>
}

export default Dashboard
