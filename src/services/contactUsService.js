import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

// Contact Us API: GET/POST /admin/contact-us
export const getContactUs = async () => unwrap(await api.get('/admin/contact-us'))

export const saveContactUs = async (data) => unwrap(await api.post('/admin/contact-us', {
  phoneNumber: data.phoneNumber.trim(),
  whatsappNumber: data.whatsappNumber.trim(),
  messengerLink: data.messengerLink.trim(),
  email: data.email.trim(),
  address: data.address.trim(),
}))
