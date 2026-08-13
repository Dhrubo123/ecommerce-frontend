import { CrudList } from '../categories/CrudUI'
import { bulkDeleteSubcategories, bulkUpdateStatus, deleteSubcategory, getSubcategories, updateSubcategoryStatus } from '../../services/subcategoryService'

export default function SubcategoryList() { return <CrudList kind="Subcategory" getItems={getSubcategories} deleteItem={deleteSubcategory} updateStatus={updateSubcategoryStatus} bulkStatus={bulkUpdateStatus} bulkDelete={bulkDeleteSubcategories} /> }
