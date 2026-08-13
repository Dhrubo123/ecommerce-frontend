import { useEffect, useState } from 'react'
import { CrudForm } from '../categories/CrudUI'
import { getCategories } from '../../services/categoryService'
import { createSubcategory, getSubcategory, updateSubcategory } from '../../services/subcategoryService'

export default function SubcategoryForm() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getCategories({ status: 'active' }).then(setCategories).catch(() => setCategories([]))
  }, [])

  return <CrudForm kind="Subcategory" categories={categories} getItem={getSubcategory} saveItem={(id, data) => id ? updateSubcategory(id, data) : createSubcategory(data)} />
}
