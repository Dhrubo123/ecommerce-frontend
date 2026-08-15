import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// The Blog API accepts multipart/form-data. Axios supplies the boundary.
const blogPayload = (blog) => {
  const payload = new FormData()
  const tags = Array.isArray(blog.tags)
    ? blog.tags
    : blog.tags.split(',').map((tag) => tag.trim()).filter(Boolean)

  payload.append('title', blog.title.trim())
  payload.append('slug', blog.slug.trim())
  payload.append('category_id', String(Number(blog.categoryId)))
  payload.append('tags', JSON.stringify(tags))
  payload.append('description', blog.description.trim())
  payload.append('isActive', String(Boolean(blog.isActive)))
  if (blog.image instanceof File) payload.append('image', blog.image)

  return payload
}

// Blog API: GET/POST /admin/blogs and GET/PATCH/DELETE /admin/blogs/:id
export const getBlogs = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
  const data = unwrap(await api.get('/admin/blogs', { params: cleanParams }))
  return Array.isArray(data) ? data : (data.blogs ?? data.items ?? [])
}

export const getBlog = async (id) => unwrap(await api.get(`/admin/blogs/${id}`))
export const createBlog = async (blog) => unwrap(await api.post('/admin/blogs', blogPayload(blog)))
export const updateBlog = async (id, blog) => unwrap(await api.patch(`/admin/blogs/${id}`, blogPayload(blog)))
export const deleteBlog = async (id) => unwrap(await api.delete(`/admin/blogs/${id}`))
