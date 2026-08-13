import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

const blogPayload = (blog) => ({
  title: blog.title.trim(),
  slug: blog.slug.trim(),
  category: blog.category.trim(),
  tags: Array.isArray(blog.tags) ? blog.tags : blog.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
  description: blog.description.trim(),
  image: blog.image.trim(),
  isActive: Boolean(blog.isActive),
})

// Blog API: GET/POST /admin/blogs and GET/PATCH/DELETE /admin/blogs/:id
export const getBlogs = async (params = {}) => {
  const data = unwrap(await api.get('/admin/blogs', { params }))
  return Array.isArray(data) ? data : (data.blogs ?? data.items ?? [])
}

export const getBlog = async (id) => unwrap(await api.get(`/admin/blogs/${id}`))
export const createBlog = async (blog) => unwrap(await api.post('/admin/blogs', blogPayload(blog)))
export const updateBlog = async (id, blog) => unwrap(await api.patch(`/admin/blogs/${id}`, blogPayload(blog)))
export const deleteBlog = async (id) => unwrap(await api.delete(`/admin/blogs/${id}`))
