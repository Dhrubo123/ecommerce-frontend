import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { createProduct, getProduct, updateProduct } from '../../services/productService'
import { getBrands } from '../../services/brandService'
import { getCategories } from '../../services/categoryService'
import { getColors } from '../../services/colorService'
import { getSizes } from '../../services/sizeService'
import { getUnits } from '../../services/unitService'
import { getSubcategories } from '../../services/subcategoryService'
import './products.css'
import './product-select.css'

const blank = { name: '', slug: '', shortDescription: '', description: '', categoryId: '', subcategoryIds: [], brandId: '', colorIds: [], unitId: '', sizes: [], sku: '', weightKg: '', buyingPrice: '', sellingPrice: '', discountType: 'percent', discount: '', stockQuantity: '', metaTitle: '', metaDescription: '', metaKeywords: '', isActive: true, thumbnailImages: [], additionalImages: [] }
const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const imageItems = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.flatMap(imageItems)
  if (typeof value === 'string') { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.flatMap(imageItems) : [value] } catch { return [value] } }
  return [value]
}
const imageUrl = (image) => {
  if (image instanceof File) return ''
  const value = typeof image === 'string' ? image : image?.url ?? image?.path ?? image?.imageUrl ?? image?.location ?? image?.filename
  if (!value) return ''
  return /^(https?:|data:|blob:)/i.test(value) ? value : `${apiBase}/${String(value).replace(/^\//, '')}`
}
function ImageGallery({ images, preview = false }) {
  const urls = images.map(imageUrl).filter(Boolean)
  if (!urls.length) return null
  return <div className={`existing-images ${preview ? 'is-preview' : ''}`}><span>Current images</span><div>{urls.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Product image ${index + 1}`} onError={(event) => { event.currentTarget.style.display = 'none' }} />)}</div></div>
}

export default function ProductForm() {
  const { id } = useParams(); const nav = useNavigate(); const edit = Boolean(id)
  const [form, setForm] = useState(blank); const [options, setOptions] = useState({ categories: [], subcategories: [], brands: [], colors: [], sizes: [], units: [] }); const [error, setError] = useState(''); const [slugEdited, setSlugEdited] = useState(false)
  useEffect(() => {
    Promise.all([getCategories(), getSubcategories(), getBrands(), getColors(), getSizes(), getUnits()]).then(([categories, subcategories, brands, colors, sizes, units]) => setOptions({ categories, subcategories, brands, colors, sizes, units })).catch(() => setError('Unable to load product attributes.'))
    if (edit) getProduct(id).then((product) => setForm({ ...blank, ...product, subcategoryIds: (product.subcategoryIds ?? product.subcategories ?? []).map((item) => Number(item?.id ?? item)), colorIds: (product.colorIds ?? product.colors ?? []).map((item) => Number(item?.id ?? item)), sizes: (product.sizes ?? product.sizeIds ?? []).map((item) => Number(item?.id ?? item)), isActive: product.status === 'active' })).catch(() => setError('Unable to load product.'))
  }, [id, edit])
  const change = (event) => { const { name, value, type, checked, files } = event.target; if (name === 'slug') setSlugEdited(true); setForm((current) => ({ ...current, [name]: files ? Array.from(files) : type === 'checkbox' ? checked : value, ...(name === 'name' && !slugEdited ? { slug: slugify(value) } : {}), ...(name === 'categoryId' ? { subcategoryIds: [] } : {}) })); setError('') }
  const toggle = (name, value) => setForm((current) => ({ ...current, [name]: current[name].includes(value) ? current[name].filter((item) => item !== value) : [...current[name], value] }))
  const save = async (event) => { event.preventDefault(); if (!form.name || !form.slug || !form.categoryId || !form.sku) return setError('Name, slug, category, and SKU are required.'); try { await (edit ? updateProduct(id, form) : createProduct(form)); nav('/products') } catch (requestError) { const body = requestError.response?.data; setError(body?.errors?.map?.((item) => item.message || item.msg || JSON.stringify(item)).join(' ') || body?.message || 'Unable to save product.') } }
  const categorySubcategories = options.subcategories.filter((item) => form.categoryId && String(item.categoryId ?? item.category?.id) === String(form.categoryId))
  const images = [...imageItems(form.thumbnailImages), ...imageItems(form.thumbnailImage), ...imageItems(form.image), ...imageItems(form.additionalImages)]
  return <AdminLayout title={edit ? 'Edit Product' : 'Add Product'}><div className="product-page"><div className="product-crumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/products">Products</Link> / {edit ? 'Edit Product' : 'Add Product'}</div><div className="product-heading"><div><h2>{edit ? 'Edit Product' : 'Add Product'}</h2><span>Create a complete physical product and its catalog metadata.</span></div></div><form className="product-form" onSubmit={save}><main>{error && <div className="brand-error">{error}</div>}
    <section><h3>Basic information</h3><Field label="Product Name"><input name="name" value={form.name} onChange={change} /></Field><div className="two"><Field label="Slug"><input name="slug" value={form.slug} onChange={change} /></Field><Field label="SKU"><input name="sku" value={form.sku} onChange={change} /></Field></div><Field label="Short Description"><input name="shortDescription" value={form.shortDescription} onChange={change} /></Field><Field label="Description"><textarea name="description" value={form.description} onChange={change} rows="4" /></Field><div className="three"><Select label="Category" name="categoryId" value={form.categoryId} onChange={change} items={options.categories} /><Select label="Brand" name="brandId" value={form.brandId} onChange={change} items={options.brands} /><Select label="Unit" name="unitId" value={form.unitId} onChange={change} items={options.units} /></div><Multi label="Subcategories" items={categorySubcategories} values={form.subcategoryIds} toggle={(value) => toggle('subcategoryIds', value)} /></section>
    <section><h3>Pricing & inventory</h3><div className="three"><Field label="Buying Price"><input type="number" name="buyingPrice" value={form.buyingPrice} onChange={change} /></Field><Field label="Selling Price"><input type="number" name="sellingPrice" value={form.sellingPrice} onChange={change} /></Field><Field label="Stock Quantity"><input type="number" name="stockQuantity" value={form.stockQuantity} onChange={change} /></Field></div><div className="three"><Field label="Weight (KG)"><input type="number" step="0.001" name="weightKg" value={form.weightKg} onChange={change} /></Field><Field label="Discount Type"><select name="discountType" value={form.discountType} onChange={change}><option value="percent">Percent</option><option value="flat">Flat</option></select></Field><Field label="Discount"><input type="number" name="discount" value={form.discount} onChange={change} /></Field></div></section>
    <section><h3>Variants & images</h3><Multi label="Colors" items={options.colors} values={form.colorIds} toggle={(value) => toggle('colorIds', value)} /><Multi label="Sizes" items={options.sizes} values={form.sizes} toggle={(value) => toggle('sizes', value)} /><div className="two"><Field label="Thumbnail Images"><input type="file" name="thumbnailImages" accept="image/*" multiple onChange={change} /></Field><Field label="Additional Images"><input type="file" name="additionalImages" accept="image/*" multiple onChange={change} /></Field></div><ImageGallery images={images} /></section>
    <section><h3>SEO & publishing</h3><Field label="Meta Title"><input name="metaTitle" value={form.metaTitle} onChange={change} /></Field><Field label="Meta Description"><textarea name="metaDescription" value={form.metaDescription} onChange={change} rows="3" /></Field><Field label="Meta Keywords"><input name="metaKeywords" value={form.metaKeywords} onChange={change} placeholder="iphone, apple, smartphone" /></Field><label className="modal-status"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} />Active product</label></section><div className="product-form-actions"><button type="button" onClick={() => nav('/products')}>Cancel</button><button className="product-primary">{edit ? 'Update Product' : 'Save Product'}</button></div>
  </main><aside><span>PRODUCT PREVIEW</span><ImageGallery images={images.slice(0, 1)} preview /><h3>{form.name || 'Product name'}</h3><p>{form.shortDescription || 'Product description'}</p><b>${form.sellingPrice || '0.00'}</b><small>{form.stockQuantity || 0} in stock</small></aside></form></div></AdminLayout>
}
function Field({ label, children }) { return <label className="p-field"><span>{label}</span>{children}</label> }
function Select({ label, name, value, onChange, items }) { return <Field label={label}><select name={name} value={value} onChange={onChange}><option value="">Select {label}</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field> }
function Multi({ label, items, values, toggle }) {
  const update = (event) => { const selected = Array.from(event.target.selectedOptions, (option) => Number(option.value)); items.forEach((item) => { const id = Number(item.id); if (values.includes(id) !== selected.includes(id)) toggle(id) }) }
  if (label === 'Colors') return <Field label="Select Color"><details className="color-choice"><summary>{values.length ? `${values.length} color${values.length > 1 ? 's' : ''} selected` : 'Select Color'}</summary><div>{items.map((item) => <label key={item.id}><input type="checkbox" checked={values.includes(Number(item.id))} onChange={() => toggle(Number(item.id))} /><i style={{ background: item.hex ?? item.code }} />{item.name}</label>)}</div></details></Field>
  if (label === 'Subcategories') return <Field label="Subcategory"><select value={values[0] ?? ''} onChange={(event) => { const selected = Number(event.target.value); values.forEach((id) => toggle(Number(id))); if (selected) toggle(selected) }} disabled={!items.length}><option value="">{items.length ? 'Select Subcategory' : 'Select a category first'}</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
  return <Field label={`Select ${label}`}><select className="size-choice" multiple value={values.map(String)} onChange={update} size={Math.min(Math.max(items.length, 2), 5)}>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
}
