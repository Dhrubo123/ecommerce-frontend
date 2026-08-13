import { CrudList } from './CrudUI'
import { bulkDeleteCategories, bulkUpdateStatus, deleteCategory, getCategories, updateCategoryStatus } from '../../services/categoryService'

export default function CategoryList() { return <CrudList kind="Category" getItems={getCategories} deleteItem={deleteCategory} updateStatus={updateCategoryStatus} bulkStatus={bulkUpdateStatus} bulkDelete={bulkDeleteCategories} /> }
