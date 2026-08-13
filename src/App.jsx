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
import ContactUs from './pages/contact/ContactUs'
import BlogList from './pages/blogs/BlogList'
import BlogForm from './pages/blogs/BlogForm'
import SalesReturnList from './pages/returns/SalesReturnList'
import SalesReturnForm from './pages/returns/SalesReturnForm'
import './App.css'

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/purchases" element={<PurchaseList />} />
        <Route path="/purchase-returns/create" element={<PurchaseReturnForm />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/create" element={<CustomerForm />} />
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
        <Route path="/ecommerce-orders" element={<EcommerceOrderList />} />
        <Route path="/ecommerce-orders/create" element={<EcommerceOrderForm />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blogs/create" element={<BlogForm />} />
        <Route path="/blogs/:id/edit" element={<BlogForm />} />
        <Route path="/sales-returns" element={<SalesReturnList />} />
        <Route path="/sales-returns/create" element={<SalesReturnForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
