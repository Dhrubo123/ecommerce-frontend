import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

export const defaultFooterSettings = {
  copyrightText: '© 2026 Ready Ecommerce. All rights reserved.',
  phone: '',
  email: '',
  columns: [
    { title: 'Company', links: [{ label: 'About Us', url: '/pages/about-us' }, { label: 'Contact Us', url: '/contact-us' }] },
    { title: 'Policies', links: [{ label: 'Privacy Policy', url: '/pages/privacy-policy' }, { label: 'Return Policy', url: '/pages/return-policy' }] },
  ],
}

const normalise = (value = {}) => ({
  copyrightText: value.copyrightText ?? defaultFooterSettings.copyrightText,
  phone: value.phone ?? '',
  email: value.email ?? '',
  columns: Array.isArray(value.columns) && value.columns.length ? value.columns.map((column) => ({ title: column.title ?? '', links: Array.isArray(column.links) ? column.links.map((link) => ({ label: link.label ?? '', url: link.url ?? '' })) : [] })) : defaultFooterSettings.columns,
})

// CMS footer API: GET, POST and PATCH /admin/cms/footer
export async function getCmsFooter() { return normalise(unwrap(await api.get('/admin/cms/footer'))) }
export async function createCmsFooter(data) { return normalise(unwrap(await api.post('/admin/cms/footer', data))) }
export async function updateCmsFooter(data) { return normalise(unwrap(await api.patch('/admin/cms/footer', data))) }
