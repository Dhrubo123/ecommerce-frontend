import { CrudView } from './CrudUI'
import { deleteCategory, getCategory } from '../../services/categoryService'
import mockSubcategories from '../../data/mockSubcategories'

export default function CategoryView() { return <CrudView kind="Category" getItem={getCategory} deleteItem={deleteCategory} subcategories={mockSubcategories} /> }
