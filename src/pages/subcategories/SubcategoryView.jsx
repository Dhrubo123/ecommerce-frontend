import { CrudView } from '../categories/CrudUI'
import { deleteSubcategory, getSubcategory } from '../../services/subcategoryService'

export default function SubcategoryView() { return <CrudView kind="Subcategory" getItem={getSubcategory} deleteItem={deleteSubcategory} /> }
