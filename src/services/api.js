import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

const findAccessToken = (value, depth = 0) => {
  if (!value || typeof value !== 'object' || depth > 3) return null
  for (const key of ['accessToken', 'access_token', 'token', 'jwt']) {
    if (typeof value[key] === 'string' && value[key]) return value[key]
  }
  return Object.values(value).map((item) => findAccessToken(item, depth + 1)).find(Boolean) ?? null
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminAccessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Live admin authentication endpoint: POST /auth/admin/login
export async function login(credentials) {
  const response = await api.post('/auth/admin/login', {
    email: credentials.email,
    password: credentials.password,
  })

  // Some APIs return a 200 response with success: false, so treat it as a login failure.
  if (response.data?.success === false) {
    throw new Error(response.data.message || 'Unable to sign in with these credentials.')
  }

  const responseData = response.data
  const token = findAccessToken(responseData)
  if (!token) {
    throw new Error('Login succeeded, but the API did not return an access token.')
  }
  localStorage.setItem('adminAccessToken', token)

  return responseData
}

export default api
