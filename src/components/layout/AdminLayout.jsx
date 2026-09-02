import { createContext, useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar, { MobileMenuButton } from './Sidebar'
import './AdminLayout.css'

const AdminLayoutContext = createContext(false)

function AdminLayout({ children, title = 'Dashboard' }) {
  const isNestedLayout = useContext(AdminLayoutContext)
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (isNestedLayout || location.pathname === '/login') return children

  return <AdminLayoutContext.Provider value={true}><div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)} />
    <div className="admin-content"><header className="admin-topbar"><MobileMenuButton onClick={() => setIsSidebarOpen(true)} /><div><p className="topbar-eyebrow">Ecommerce Admin</p><h1>{title}</h1></div><button className="topbar-notification" type="button" aria-label="Notifications"><span /></button></header><main className="admin-page-content">{children}</main></div>
  </div></AdminLayoutContext.Provider>
}

export default AdminLayout
