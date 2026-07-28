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
    <div className="flex h-full w-full overflow-y-auto items-center justify-center bg-tc-bg px-4 py-6 text-tc-text sm:px-6 lg:px-8">
      <form className="flex w-full max-w-md flex-col gap-3 rounded-3xl border border-tc-border bg-tc-surface/80 p-6 shadow-[0_28px_90px_-40px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-3xl font-semibold tracking-tight text-tc-text">Log in</h1>

        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tc-muted-2" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="w-full rounded-2xl border border-tc-border bg-tc-surface-2 px-4 py-3 text-tc-text outline-none transition focus:border-tc-accent/60 focus-visible:ring-2 focus-visible:ring-tc-accent/40 placeholder:text-tc-muted-2"
          {...register('email', { required: 'Email is required.' })}
        />
        {errors.email ? <p className="rounded-xl border border-tc-error/30 bg-tc-error/10 px-3.5 py-2.5 text-sm text-tc-error">{errors.email.message}</p> : null}

        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tc-muted-2" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="w-full rounded-2xl border border-tc-border bg-tc-surface-2 px-4 py-3 text-tc-text outline-none transition focus:border-tc-accent/60 focus-visible:ring-2 focus-visible:ring-tc-accent/40 placeholder:text-tc-muted-2"
          {...register('password', { required: 'Password is required.' })}
        />
        {errors.password ? <p className="rounded-xl border border-tc-error/30 bg-tc-error/10 px-3.5 py-2.5 text-sm text-tc-error">{errors.password.message}</p> : null}

        {apiError ? <p className="rounded-xl border border-tc-error/30 bg-tc-error/10 px-3.5 py-2.5 text-sm text-tc-error">{apiError}</p> : null}

        <button type="submit" className="mt-2 inline-flex items-center justify-center rounded-2xl bg-tc-accent px-4 py-3 font-semibold text-[#1a0f05] shadow-[0_16px_34px_-16px_rgba(239,138,59,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-tc-surface-2 disabled:text-tc-muted-2" disabled={isLoading}>
          {isLoading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="pt-2 text-center text-sm text-tc-muted">
          Don't have an account? <Link to="/register" className="font-medium text-tc-accent hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  )
}