import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AppContext'
import { useState } from 'react'

export function RegisterPage() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const { register: registerUser } = useAuth()
    const navigate = useNavigate()
    const [apiError, setApiError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const password = watch('password')

    async function onSubmit(data) {
        setApiError(null)
        setIsLoading(true)
        try {
            if (data.password !== data.confirmPassword) {
                setApiError('Passwords do not match.')
                setIsLoading(false)
                return
            }
            await registerUser(data.email, data.password, data.confirmPassword)
            navigate('/')
        } catch (err) {
            console.log(err);
            console.log(err.response);
            console.log(err.response?.data);

            setApiError(err?.response?.data?.detail || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                <h1>Create an account</h1>

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
                    {...register('password', {
                        required: 'Password is required.',
                        minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                    })}
                />
                {errors.password ? <p className="status-message error">{errors.password.message}</p> : null}

                <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    className="text-input"
                    {...register('confirmPassword', {
                        required: 'Please confirm your password.',
                        validate: (value) => value === password || 'Passwords do not match.',
                    })}
                />
                {errors.confirmPassword ? <p className="status-message error">{errors.confirmPassword.message}</p> : null}

                {apiError ? <p className="status-message error">{apiError}</p> : null}

                <button type="submit" className="primary-button" disabled={isLoading}>
                    {isLoading ? 'Creating account…' : 'Sign up'}
                </button>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    )
}