import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import CategoryList from './pages/categories/CategoryList'
import CategoryForm from './pages/categories/CategoryForm'
import CategoryView from './pages/categories/CategoryView'
import SubcategoryList from './pages/subcategories/SubcategoryList'
import SubcategoryForm from './pages/subcategories/SubcategoryForm'
import SubcategoryView from './pages/subcategories/SubcategoryView'
import ProductList from './pages/products/ProductList'
import ProductForm from './pages/products/ProductForm'
import ProductView from './pages/products/ProductView'
import BrandList from './pages/brands/BrandList'
import BrandForm from './pages/brands/BrandForm'
import BrandView from './pages/brands/BrandView'
import ColorList from './pages/colors/ColorList'
import SizeList from './pages/sizes/SizeList'
import UnitList from './pages/units/UnitList'
import SupplierList from './pages/suppliers/SupplierList'
import SupplierForm from './pages/suppliers/SupplierForm'
import WarehouseList from './pages/warehouses/WarehouseList'
import WarehouseForm from './pages/warehouses/WarehouseForm'
import PurchaseForm from './pages/purchases/PurchaseForm'
import PurchaseList from './pages/purchases/PurchaseList'
import PurchaseReturnForm from './pages/purchases/PurchaseReturnForm'
import CustomerList from './pages/customers/CustomerList'
import CustomerForm from './pages/customers/CustomerForm'
import WarehouseRequisitionForm from './pages/warehouses/WarehouseRequisitionForm'
import WarehouseRequisitionList from './pages/warehouses/WarehouseRequisitionList'
import StockAdjustmentForm from './pages/warehouses/StockAdjustmentForm'
import StockAdjustmentList from './pages/warehouses/StockAdjustmentList'
import PosSaleForm from './pages/pos/PosSaleForm'
import PosSaleList from './pages/pos/PosSaleList'
import EmployeeList from './pages/employees/EmployeeList'
import EmployeeForm from './pages/employees/EmployeeForm'
import StockReportList from './pages/warehouses/StockReportList'
import WarehouseTransferForm from './pages/warehouses/WarehouseTransferForm'
import WarehouseTransferList from './pages/warehouses/WarehouseTransferList'
import EcommerceOrderList from './pages/orders/EcommerceOrderList'
import EcommerceOrderForm from './pages/orders/EcommerceOrderForm'
import EcommerceOrderView from './pages/orders/EcommerceOrderView'
import ContactUs from './pages/contact/ContactUs'
import BlogList from './pages/blogs/BlogList'
import BlogForm from './pages/blogs/BlogForm'
import SalesReturnList from './pages/returns/SalesReturnList'
import SalesReturnForm from './pages/returns/SalesReturnForm'
import BannerList from './pages/banners/BannerList'
import BannerForm from './pages/banners/BannerForm'
import FlashSaleList from './pages/flash-sales/FlashSaleList'
import FlashSaleForm from './pages/flash-sales/FlashSaleForm'
import PromoCodeList from './pages/promo-codes/PromoCodeList'
import PromoCodeForm from './pages/promo-codes/PromoCodeForm'
import AdCampaignList from './pages/ad-campaigns/AdCampaignList'
import AdCampaignForm from './pages/ad-campaigns/AdCampaignForm'
import RoleList from './pages/roles/RoleList'
import RoleForm from './pages/roles/RoleForm'
import ChartOfAccounts from './pages/accounts/ChartOfAccounts'
import BankList from './pages/accounts/BankList'
import BankForm from './pages/accounts/BankForm'
import SupplierPaymentList from './pages/accounts/SupplierPaymentList'
import SupplierPaymentForm from './pages/accounts/SupplierPaymentForm'
import CustomerPaymentForm from './pages/accounts/CustomerPaymentForm'
import CreditVoucherForm from './pages/accounts/CreditVoucherForm'
import DebitVoucherForm from './pages/accounts/DebitVoucherForm'
import ContraVoucherForm from './pages/accounts/ContraVoucherForm'
import JournalVoucherForm from './pages/accounts/JournalVoucherForm'
import CashAdjustmentForm from './pages/accounts/CashAdjustmentForm'
import ThemeList from './pages/themes/ThemeList'
import ThemeForm from './pages/themes/ThemeForm'
import CmsPageList from './pages/cms/CmsPageList'
import CmsPageForm from './pages/cms/CmsPageForm'
import CmsMenuList from './pages/cms/CmsMenuList'
import CmsMenuForm from './pages/cms/CmsMenuForm'
import CmsFooterSettings from './pages/cms/CmsFooterSettings'
import CmsSectionManager from './pages/cms/CmsSectionManager'
import AdminLayout from './components/layout/AdminLayout'
import './App.css'
import './form-controls.css'

function App() {
  return (
    <BrowserRouter>
      <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/categories/create" element={<CategoryForm />} />
        <Route path="/categories/:id" element={<CategoryView />} />
        <Route path="/categories/:id/edit" element={<CategoryForm />} />
        <Route path="/subcategories" element={<SubcategoryList />} />
        <Route path="/subcategories/create" element={<SubcategoryForm />} />
        <Route path="/subcategories/:id" element={<SubcategoryView />} />
        <Route path="/subcategories/:id/edit" element={<SubcategoryForm />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/create" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductView />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="/brands" element={<BrandList />} />
        <Route path="/brands/create" element={<BrandForm />} />
        <Route path="/brands/:id" element={<BrandView />} />
        <Route path="/brands/:id/edit" element={<BrandForm />} />
        <Route path="/colors" element={<ColorList />} />
        <Route path="/sizes" element={<SizeList />} />
        <Route path="/units" element={<UnitList />} />
        <Route path="/suppliers" element={<SupplierList />} />
        <Route path="/suppliers/create" element={<SupplierForm />} />
        <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
        <Route path="/warehouses" element={<WarehouseList />} />
        <Route path="/warehouses/create" element={<WarehouseForm />} />
        <Route path="/warehouses/:id/edit" element={<WarehouseForm />} />
        <Route path="/purchases/create" element={<PurchaseForm />} />
        <Route path="/purchases/:id/edit" element={<PurchaseForm />} />
        <Route path="/purchases" element={<PurchaseList />} />
        <Route path="/purchase-returns/create" element={<PurchaseReturnForm />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/create" element={<CustomerForm />} />
        <Route path="/customers/:id/edit" element={<CustomerForm />} />
        <Route path="/warehouse-requisitions/create" element={<WarehouseRequisitionForm />} />
        <Route path="/warehouse-requisitions" element={<WarehouseRequisitionList />} />
        <Route path="/stock-adjustments/create" element={<StockAdjustmentForm />} />
        <Route path="/stock-adjustments" element={<StockAdjustmentList />} />
        <Route path="/pos-sales/create" element={<PosSaleForm />} />
        <Route path="/pos-sales" element={<PosSaleList />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/create" element={<EmployeeForm />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/stock-reports" element={<StockReportList />} />
        <Route path="/warehouse-transfers" element={<WarehouseTransferList />} />
        <Route path="/warehouse-transfers/create" element={<WarehouseTransferForm />} />
        <Route path="/orders" element={<EcommerceOrderList />} />
        <Route path="/orders/create" element={<EcommerceOrderForm />} />
        <Route path="/orders/:id" element={<EcommerceOrderView />} />
        <Route path="/ecommerce-orders" element={<EcommerceOrderList />} />
        <Route path="/ecommerce-orders/create" element={<EcommerceOrderForm />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blogs/create" element={<BlogForm />} />
        <Route path="/blogs/:id/edit" element={<BlogForm />} />
        <Route path="/sales-returns" element={<SalesReturnList />} />
        <Route path="/sales-returns/create" element={<SalesReturnForm />} />
        <Route path="/banners" element={<BannerList />} />
        <Route path="/banners/create" element={<BannerForm />} />
        <Route path="/banners/:id/edit" element={<BannerForm />} />
        <Route path="/flash-sales" element={<FlashSaleList />} />
        <Route path="/flash-sales/create" element={<FlashSaleForm />} />
        <Route path="/flash-sales/:id/edit" element={<FlashSaleForm />} />
        <Route path="/promo-codes" element={<PromoCodeList />} />
        <Route path="/promo-codes/create" element={<PromoCodeForm />} />
        <Route path="/promo-codes/:id/edit" element={<PromoCodeForm />} />
        <Route path="/ad-campaigns" element={<AdCampaignList />} />
        <Route path="/ad-campaigns/create" element={<AdCampaignForm />} />
        <Route path="/ad-campaigns/:id/edit" element={<AdCampaignForm />} />
        <Route path="/roles" element={<RoleList />} />
        <Route path="/roles/create" element={<RoleForm />} />
        <Route path="/roles/:id/edit" element={<RoleForm />} />
        <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
        <Route path="/banks" element={<BankList />} />
        <Route path="/banks/create" element={<BankForm />} />
        <Route path="/banks/:id/edit" element={<BankForm />} />
        <Route path="/supplier-payments" element={<SupplierPaymentList />} />
        <Route path="/supplier-payments/create" element={<SupplierPaymentForm />} />
        <Route path="/customer-payments/create" element={<CustomerPaymentForm />} />
        <Route path="/credit-vouchers/create" element={<CreditVoucherForm />} />
        <Route path="/debit-vouchers/create" element={<DebitVoucherForm />} />
        <Route path="/contra-vouchers/create" element={<ContraVoucherForm />} />
        <Route path="/journal-vouchers/create" element={<JournalVoucherForm />} />
        <Route path="/cash-adjustments/create" element={<CashAdjustmentForm />} />
        <Route path="/themes" element={<ThemeList />} />
        <Route path="/themes/create" element={<ThemeForm />} />
        <Route path="/themes/:id/edit" element={<ThemeForm />} />
        <Route path="/cms-pages" element={<CmsPageList />} />
        <Route path="/cms-pages/create" element={<CmsPageForm />} />
        <Route path="/cms-pages/:id/edit" element={<CmsPageForm />} />
        <Route path="/cms-menus" element={<CmsMenuList />} />
        <Route path="/cms-menus/create" element={<CmsMenuForm />} />
        <Route path="/cms-menus/:id/edit" element={<CmsMenuForm />} />
        <Route path="/cms-footer" element={<CmsFooterSettings />} />
        <Route path="/cms-sections" element={<CmsSectionManager />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </AdminLayout>
    </BrowserRouter>
  )
}

export default App
