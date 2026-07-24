import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AppContext'
import { useState } from 'react'

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(data) {
    setApiError(null)
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch (err) {
      setApiError(err?.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <h1>Log in</h1>

        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="text-input"
          {...register('email', { required: 'Email is required.' })}
        />
        {errors.email ? <p className="status-message error">{errors.email.message}</p> : null}

        <label className="field-label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="text-input"
          {...register('password', { required: 'Password is required.' })}
        />
        {errors.password ? <p className="status-message error">{errors.password.message}</p> : null}

        {apiError ? <p className="status-message error">{apiError}</p> : null}

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  )
}