import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deletePurchase, getPurchases } from '../../services/purchaseService'
import '../brands/brands.css'

export default function PurchaseList() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')

  const loadPurchases = async () => {
    try {
      setError('')
      setItems(await getPurchases({ search }))
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load purchases.')
    }
  }

  useEffect(() => { loadPurchases() }, [search])

  const removePurchase = async (purchase) => {
    if (!window.confirm(`Delete purchase ${purchase.invoiceNumber || `#${purchase.id}`}? This cannot be undone.`)) return
    try {
      await deletePurchase(purchase.id)
      setNotice('Purchase deleted successfully.')
      loadPurchases()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete purchase.')
    }
  }

  return <AdminLayout title="Purchase List">
    <div className="brand-page">
      <div className="brand-heading">
        <div><p>INVENTORY & PURCHASE</p><h2>Purchase List</h2><span>Review, update, or remove stock purchases.</span></div>
        <Link className="brand-primary" to="/purchases/create"><Plus size={17} />Add Purchase</Link>
      </div>
      <section className="brand-card">
        <div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice number" /></label></div>
        {error && <div className="brand-error">{error}</div>}
        {notice && <div className="brand-success">{notice}</div>}
        <div className="brand-table"><table>
          <thead><tr><th>Invoice</th><th>Supplier</th><th>Warehouse</th><th>Purchase Date</th><th>Total</th><th>Paid</th><th>Due</th><th>Actions</th></tr></thead>
          <tbody>{items.length ? items.map((purchase) => {
            const total = Number(purchase.totalAmount ?? purchase.total ?? 0)
            const paid = Number(purchase.paidAmount ?? 0)
            return <tr key={purchase.id}>
              <td><strong>{purchase.invoiceNumber || `#${purchase.id}`}</strong></td>
              <td>{purchase.supplier?.name ?? purchase.supplierName ?? '-'}</td>
              <td>{purchase.warehouse?.name ?? purchase.warehouseName ?? '-'}</td>
              <td>{purchase.purchaseDate || '-'}</td><td>{total}</td><td>{paid}</td><td>{purchase.dueAmount ?? total - paid}</td>
              <td><div className="brand-actions"><Link aria-label="Edit purchase" title="Edit purchase" to={`/purchases/${purchase.id}/edit`}><Pencil size={15} /></Link><button type="button" aria-label="Delete purchase" title="Delete purchase" onClick={() => removePurchase(purchase)}><Trash2 size={15} /></button></div></td>
            </tr>
          }) : <tr><td colSpan="8" className="brand-empty">No purchases found.</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  </AdminLayout>
}
