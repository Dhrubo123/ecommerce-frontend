import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight, BadgeDollarSign, BadgePercent, BarChart3, Bell, Boxes,
  CalendarClock, Car, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound,
  ClipboardList, Factory, FileText, Headphones, Landmark,
  Languages, LayoutDashboard, LogOut, Mail, MapPin, Megaphone, Menu, Monitor,
  Package, Palette, Plug, Receipt, RefreshCcw, RotateCcw, Settings, ShieldCheck,
  ShoppingCart, SlidersHorizontal, Store, Tags, TrendingUp, Truck,
  Undo2, UserCog, Users, Wallet, X,
} from 'lucide-react'
import './Sidebar.css'

const menuSections = [
  { label: 'Main', items: [{ label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Order Management', items: [
    { label: 'Orders', icon: ShoppingCart, children: ['Order List', 'Create Order'] }, { label: 'Courier Tracking', icon: Truck },
    // { label: 'Pre-Orders', icon: CalendarClock, children: ['Overview / Analytics', 'Pre-Order List', 'Pre-Order Products', 'Commission', 'Profit Report', 'Pre-Order Settings'] },
    { label: 'Refunds', icon: RotateCcw, badge: 3, children: ['Sales Return List', 'Add Sales Return'] }, { label: 'POS', icon: Monitor, children: ['New POS Sale', 'POS Sales History', 'POS Drafts'] }, { label: 'Conversations', icon: Mail, badge: 5 },
  ] },
  { label: 'Catalog', items: [
    { label: 'Products', icon: Package, children: ['All Products', 'Add Product', 'Digital Products', { label: 'Pending Product Approval', badge: 8 }, 'Product Update Requests'] },
    { label: 'Categories', icon: Tags, children: ['All Categories', 'Add Category', 'All Subcategories', 'Add Subcategory'] },
    { label: 'Product Attributes', icon: SlidersHorizontal, children: ['Brands', 'Colors', 'Sizes', 'Units'] },
  ] },
  { label: 'Inventory & Purchase', items: [
    { label: 'Stock Report', icon: Boxes, badge: 7 }, { label: 'Stock Adjustment', icon: SlidersHorizontal, children: ['Stock Adjustment List', 'Add Stock Adjustment'] }, { label: 'Purchases', icon: ClipboardList, children: ['Purchase List', 'Add New Purchase', 'Purchase Invoices', 'Purchase Summary'] },
    { label: 'Purchase Returns', icon: Undo2 }, { label: 'Suppliers', icon: Factory }, { label: 'Warehouses', icon: Boxes, children: ['All Warehouses', 'Add Warehouse', 'Warehouse Requisition List', 'Warehouse Requisitions', 'Warehouse Transfer List', 'New Warehouse Transfer'] },
  ] },
  { label: 'Accounts', items: [
    { label: 'Accounts', icon: Landmark, children: ['Chart of Account', 'Banks', 'Sub Account List', 'Predefined Accounts', 'Financial Year', 'Opening Balance', 'Debit Voucher', 'Credit Voucher', 'Contra Voucher', 'Journal Voucher', 'Bank Reconciliation', 'Add Payment Method', 'Payment Method List', 'Supplier Payment', 'Customer Receive', 'Service Payment', 'Cash Adjustment', 'Voucher Approval'] },
  ] },
  { label: 'Marketplace', items: [
    { label: 'Shops / Vendors', icon: Store, children: ['All Shops', 'Add Shop', 'Shop Approval'] }, { label: 'Commission', icon: BadgePercent },
    { label: 'Payouts', icon: Wallet }, { label: 'Withdrawals', icon: Landmark }, { label: 'Subscriptions', icon: RefreshCcw },
  ] },
  { label: 'Marketing & Content', items: [
    { label: 'Promotions', icon: Megaphone, children: ['Flash Deals', 'Banners', 'Ad Campaigns', 'Coupons'] },
    { label: 'Push Notifications', icon: Bell }, { label: 'Blog', icon: FileText, children: ['All Blogs', 'Add Blog'] }, { label: 'CMS Pages', icon: FileText, children: ['All CMS Pages', 'Add CMS Page', 'CMS Menus', 'Add Menu Item', 'Footer Settings', 'Home Page Sections'] },
  ] },
  { label: 'People & Support', items: [
    { label: 'Customers', icon: Users }, { label: 'Employees', icon: UserCog }, { label: 'Drivers', icon: Car }, { label: 'Support Tickets', icon: Headphones }, { label: 'Contact Us', icon: Mail },
  ] },
  { label: 'Reports', items: [
    { label: 'Analytics', icon: BarChart3 }, { label: 'Sales Report', icon: TrendingUp }, { label: 'Order Report', icon: Receipt }, { label: 'Profit Report', icon: BadgeDollarSign },
    { label: 'Stock Report', icon: Boxes }, { label: 'Purchase Report', icon: ClipboardList }, { label: 'Refund Report', icon: RotateCcw }, { label: 'Commission Report', icon: BadgePercent },
  ] },
  { label: 'System Settings', items: [
    { label: 'Roles & Permissions', icon: ShieldCheck }, { label: 'Languages', icon: Languages }, { label: 'Address Management', icon: MapPin },
    { label: 'Business Settings', icon: Settings }, { label: 'Themes', icon: Palette, children: ['Theme Management', 'Create Theme'] }, { label: 'Third-Party Integrations', icon: Plug }, { label: 'Import / Export', icon: ArrowLeftRight }, { label: 'Add-ons', icon: Boxes },
  ] },
]

const getItemLabel = (item) => typeof item === 'string' ? item : item.label
const routes = { Dashboard: '/dashboard', 'Order List': '/orders', 'Create Order': '/orders/create', 'Sales Return List': '/sales-returns', 'Add Sales Return': '/sales-returns/create', 'New POS Sale': '/pos-sales/create', 'POS Sales History': '/pos-sales', 'All Products': '/products', 'Add Product': '/products/create', Brands: '/brands', Colors: '/colors', Sizes: '/sizes', Units: '/units', Suppliers: '/suppliers', Warehouses: '/warehouses', 'All Warehouses': '/warehouses', 'Add Warehouse': '/warehouses/create', 'Warehouse Requisition List': '/warehouse-requisitions', 'Warehouse Requisitions': '/warehouse-requisitions/create', 'Warehouse Transfer List': '/warehouse-transfers', 'New Warehouse Transfer': '/warehouse-transfers/create', 'Stock Report': '/stock-reports', 'Stock Adjustment List': '/stock-adjustments', 'Add Stock Adjustment': '/stock-adjustments/create', Customers: '/customers', Employees: '/employees', 'Contact Us': '/contact-us', 'Flash Deals': '/flash-sales', Banners: '/banners', 'Ad Campaigns': '/ad-campaigns', Coupons: '/promo-codes', 'All Blogs': '/blogs', 'Add Blog': '/blogs/create', 'Purchase List': '/purchases', 'Add New Purchase': '/purchases/create', 'Purchase Returns': '/purchase-returns/create', 'All Categories': '/categories', 'Add Category': '/categories/create', 'All Subcategories': '/subcategories', 'Add Subcategory': '/subcategories/create' }

routes['Roles & Permissions'] = '/roles'
routes['Chart of Account'] = '/chart-of-accounts'
routes.Banks = '/banks'
routes['Supplier Payment'] = '/supplier-payments/create'
routes['Customer Receive'] = '/customer-payments/create'
routes['Credit Voucher'] = '/credit-vouchers/create'
routes['Debit Voucher'] = '/debit-vouchers/create'
routes['Contra Voucher'] = '/contra-vouchers/create'
routes['Journal Voucher'] = '/journal-vouchers/create'
routes['Cash Adjustment'] = '/cash-adjustments/create'
routes['Theme Management'] = '/themes'
routes['Create Theme'] = '/themes/create'
routes['All CMS Pages'] = '/cms-pages'
routes['Add CMS Page'] = '/cms-pages/create'
routes['Footer Settings'] = '/cms-footer'
routes['Home Page Sections'] = '/cms-sections'
routes['CMS Menus'] = '/cms-menus'
routes['Add Menu Item'] = '/cms-menus/create'

function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [openMenus, setOpenMenus] = useState({})
  const [activeItem, setActiveItem] = useState('Dashboard')
  const toggleMenu = (label) => setOpenMenus((current) => ({ ...current, [label]: !current[label] }))
  const selectItem = (label) => { setActiveItem(label); if (routes[label]) navigate(routes[label]); onClose?.() }
  const logout = () => {
    localStorage.removeItem('adminAccessToken')
    onClose?.()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <button className={`sidebar-overlay ${isOpen ? 'is-visible' : ''}`} type="button" aria-label="Close navigation menu" onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'is-open' : ''} ${isCollapsed ? 'is-collapsed' : ''}`} aria-label="Admin navigation">
        <div className="sidebar-top">
          <div className="sidebar-brand"><span className="sidebar-logo"><Store size={19} /></span><span className="brand-name">Ecommerce Admin</span><button className="mobile-close" type="button" aria-label="Close navigation" onClick={onClose}><X size={19} /></button></div>
          <button className="collapse-button" type="button" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggleCollapse}>{isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
        </div>
        <nav className="sidebar-nav">
          {menuSections.map((section) => <div className="nav-section" key={section.label}>
            <p className="section-label">{section.label}</p>
            <div className="nav-items">{section.items.map((item) => {
              const Icon = item.icon
              const isOpenMenu = openMenus[item.label]
              const isActive = item.label === 'Categories' ? location.pathname.startsWith('/categories') || location.pathname.startsWith('/subcategories') : item.label === 'Orders' ? location.pathname.startsWith('/orders') : item.label === 'Refunds' ? location.pathname.startsWith('/sales-returns') : item.label === 'Blog' ? location.pathname.startsWith('/blogs') : item.label === 'Promotions' ? location.pathname.startsWith('/flash-sales') || location.pathname.startsWith('/banners') || location.pathname.startsWith('/ad-campaigns') || location.pathname.startsWith('/promo-codes') : item.label === 'Products' ? location.pathname.startsWith('/products') : item.label === 'Product Attributes' ? location.pathname.startsWith('/brands') || location.pathname.startsWith('/colors') || location.pathname.startsWith('/sizes') || location.pathname.startsWith('/units') : item.label === 'Warehouses' ? location.pathname.startsWith('/warehouses') || location.pathname.startsWith('/warehouse-requisitions') || location.pathname.startsWith('/warehouse-transfers') : item.label === 'Accounts' ? location.pathname.startsWith('/chart-of-accounts') || location.pathname.startsWith('/banks') || location.pathname.startsWith('/supplier-payments') || location.pathname.startsWith('/customer-payments') || location.pathname.startsWith('/debit-vouchers') || location.pathname.startsWith('/credit-vouchers') || location.pathname.startsWith('/contra-vouchers') || location.pathname.startsWith('/journal-vouchers') || location.pathname.startsWith('/cash-adjustments') : item.label === 'Themes' ? location.pathname.startsWith('/themes') : (routes[item.label] ? location.pathname === routes[item.label] : activeItem === item.label)
              return <div className="nav-item-group" key={item.label}>
                {item.children ? (
                  <button className={`nav-item ${isActive ? 'is-active' : ''}`} type="button" title={isCollapsed ? item.label : undefined} aria-expanded={isOpenMenu} onClick={() => toggleMenu(item.label)}>
                    <Icon className="nav-icon" size={18} strokeWidth={1.9} /><span className="nav-label">{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}<ChevronDown className={`submenu-chevron ${isOpenMenu ? 'is-open' : ''}`} size={16} />
                  </button>
                ) : routes[item.label] ? (
                  <Link className={`nav-item ${isActive ? 'is-active' : ''}`} to={routes[item.label]} title={isCollapsed ? item.label : undefined} style={{ textDecoration: 'none' }} onClick={() => { setActiveItem(item.label); onClose?.() }}>
                    <Icon className="nav-icon" size={18} strokeWidth={1.9} /><span className="nav-label">{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}
                  </Link>
                ) : (
                  <button className={`nav-item ${isActive ? 'is-active' : ''}`} type="button" title={isCollapsed ? item.label : undefined} onClick={() => selectItem(item.label)}>
                    <Icon className="nav-icon" size={18} strokeWidth={1.9} /><span className="nav-label">{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}
                  </button>
                )}
                {item.children && <div className={`submenu ${isOpenMenu ? 'is-open' : ''}`}>
                  <div className="submenu-inner">{item.children.map((child) => { const label = getItemLabel(child); const childActive = routes[label] ? (label.includes('Categories') ? location.pathname.startsWith('/categories') : label.includes('Subcategories') ? location.pathname.startsWith('/subcategories') : location.pathname === routes[label]) : activeItem === label; return routes[label] ? <Link className={`submenu-item ${childActive ? 'is-active' : ''}`} key={label} to={routes[label]} style={{ textDecoration: 'none' }} onClick={() => { setActiveItem(label); onClose?.() }}><span>{label}</span>{typeof child === 'object' && child.badge && <span className="nav-badge">{child.badge}</span>}</Link> : <button className={`submenu-item ${childActive ? 'is-active' : ''}`} type="button" key={label} onClick={() => selectItem(label)}><span>{label}</span>{typeof child === 'object' && child.badge && <span className="nav-badge">{child.badge}</span>}</button> })}</div>
                </div>}
              </div>
            })}</div>
          </div>)}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-profile"><span className="profile-avatar">SA</span><div className="profile-info"><strong>Super Admin</strong><span>Platform owner</span></div><button type="button" className="profile-menu" aria-label="My Profile" title="My Profile"><CircleUserRound size={18} /></button></div>
          <div className="profile-actions"><button type="button"><CircleUserRound size={16} /><span>My Profile</span></button><button type="button" className="logout-button" onClick={logout}><LogOut size={16} /><span>Logout</span></button></div>
        </div>
      </aside>
    </>
  )
}

export function MobileMenuButton({ onClick }) { return <button className="mobile-menu-button" type="button" onClick={onClick} aria-label="Open navigation menu"><Menu size={21} /></button> }
export default Sidebar
