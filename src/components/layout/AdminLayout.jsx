import { useState } from 'react'
import Sidebar, { MobileMenuButton } from './Sidebar'
import './AdminLayout.css'

function AdminLayout({ children, title = 'Dashboard' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)} />
    <div className="admin-content"><header className="admin-topbar"><MobileMenuButton onClick={() => setIsSidebarOpen(true)} /><div><p className="topbar-eyebrow">Ecommerce Admin</p><h1>{title}</h1></div><button className="topbar-notification" type="button" aria-label="Notifications"><span /></button></header><main className="admin-page-content">{children}</main></div>
  </div>
}

export default AdminLayout
