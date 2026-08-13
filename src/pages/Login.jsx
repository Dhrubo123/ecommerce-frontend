import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'

const initialForm = { email: '', password: '', remember: false }

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const updateField = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setApiError('')
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Email address is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.password) nextErrors.password = 'Password is required.'
    else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setApiError('')
    try {
      await login({ email: form.email, password: form.password })
      navigate('/dashboard')
    } catch (error) {
      setApiError(error.response?.data?.message || error.message || 'We could not sign you in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-label="Administrator sign in">
        <Link className="brand" to="/login" aria-label="Storefront Admin home">
          <span className="brand-mark"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h16l-1 11H5L4 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M8 9V7a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
          W3 E-commerce Admin
        </Link>
        <h1 className="login-heading">Welcome back</h1>
        <p className="login-subtitle">Sign in to manage your store and keep things moving.</p>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {apiError && <div className="api-error" role="alert">{apiError}</div>}
          <div className="field-group">
            <label className="field-label" htmlFor="email">Email address</label>
            <input className={`text-input ${errors.email ? 'input-error' : ''}`} id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={updateField} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
            <span className="field-error" id="email-error">{errors.email}</span>
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <input className={`text-input password-input ${errors.password ? 'input-error' : ''}`} id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={updateField} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            <span className="field-error" id="password-error">{errors.password}</span>
          </div>
          <div className="form-options">
            <label className="checkbox-label"><input name="remember" type="checkbox" checked={form.remember} onChange={updateField} />Remember me</label>
            <a className="forgot-link" href="#forgot-password">Forgot password?</a>
          </div>
          <button className="submit-button" type="submit" disabled={isLoading}>{isLoading ? <span className="loading-content"><span className="spinner" />Signing in...</span> : 'Sign in'}</button>
        </form>
        <p className="privacy-text">Protected by enterprise-grade security.</p>
      </section>
      <aside className="showcase-panel">
        <div className="showcase-content"><div className="showcase-badge"><span />YOUR STORE, IN CONTROL</div><h2>Run your business with confidence.</h2><p>Everything you need to manage orders, products, customers, and growth — all in one focused workspace.</p><div className="stats-card"><div className="stat"><strong>24/7</strong><span>Store insights</span></div><div className="stat"><strong>99.9%</strong><span>Platform uptime</span></div><div className="stat"><strong>1 place</strong><span>For your business</span></div></div></div>
      </aside>
    </main>
  )
}

export default Login
