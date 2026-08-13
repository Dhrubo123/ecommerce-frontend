import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { deleteEmployee, getEmployees } from '../../services/employeeService'
import '../brands/brands.css'

export default function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadEmployees = async () => {
    setLoading(true)
    try {
      setEmployees(await getEmployees({ search }))
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEmployees() }, [search])

  const remove = async (employee) => {
    if (!window.confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) return
    try {
      await deleteEmployee(employee.id)
      await loadEmployees()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete employee.')
    }
  }

  return <AdminLayout title="Employees"><div className="brand-page">
    <div className="brand-heading"><div><p>PEOPLE & SUPPORT</p><h2>Employees</h2><span>Manage employee accounts and access roles.</span></div><Link className="brand-primary" to="/employees/create"><Plus size={17} />Add Employee</Link></div>
    <section className="brand-card">
      <div className="brand-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees" /></label></div>
      {error && <div className="brand-error">{error}</div>}
      <div className="brand-table"><table><thead><tr><th>Employee</th><th>Role</th><th>Phone</th><th>Email</th><th>Gender</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="7">Loading employees…</td></tr> : employees.length === 0 ? <tr><td colSpan="7">No employees found.</td></tr> : employees.map((employee) => <tr key={employee.id}>
          <td><strong>{[employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.name}</strong></td><td>{employee.role || '—'}</td><td>{employee.phone || '—'}</td><td>{employee.email || '—'}</td><td>{employee.gender || '—'}</td><td><span className={`brand-status ${employee.isActive ? 'active' : 'inactive'}`}>{employee.isActive ? 'Active' : 'Inactive'}</span></td>
          <td><div className="brand-actions"><Link to={`/employees/${employee.id}/edit`} title="Edit employee"><Pencil size={16} /></Link><button type="button" title="Delete employee" onClick={() => remove(employee)}><Trash2 size={16} /></button></div></td>
        </tr>)}
      </tbody></table></div>
    </section>
  </div></AdminLayout>
}
