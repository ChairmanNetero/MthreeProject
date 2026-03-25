import { useState } from 'react'
import './LoginPage.css'

export default function LoginPage({ onAuthSuccess }) {
    const [mode, setMode] = useState('login') // 'login' | 'signup'
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (mode === 'signup' && form.password !== form.confirm) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        try {
            if (mode === 'login') {
                await login({ username: form.username, password: form.password })
            } else {
                await signup({ username: form.username, email: form.email, password: form.password })
            }
            onAuthSuccess?.()
        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login')
        setForm({ username: '', email: '', password: '', confirm: '' })
        setError('')
    }

    return (
        <div className="login-page">
            <header className="site-header">
                <h1>Welcome to TaskTimer</h1>
            </header>

            <main className="login-main">
                <div className="login-card">
                    <div className="tab-row">
                        <button
                            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                            onClick={() => mode !== 'login' && switchMode()}
                            type="button"
                        >
                            Log In
                        </button>
                        <button
                            className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
                            onClick={() => mode !== 'signup' && switchMode()}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <div className="field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={form.username}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                                placeholder="your_username"
                            />
                        </div>

                        {mode === 'signup' && (
                            <div className="field">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                />
                            </div>
                        )}

                        <div className="field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                placeholder="••••••••"
                            />
                        </div>

                        {mode === 'signup' && (
                            <div className="field">
                                <label htmlFor="confirm">Confirm Password</label>
                                <input
                                    id="confirm"
                                    name="confirm"
                                    type="password"
                                    value={form.confirm}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        {error && <p className="form-error">{error}</p>}

                        <button className="submit-btn" type="submit" disabled={loading}>
                            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
                        </button>
                    </form>

                    <p className="switch-text">
                        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button className="link-btn" onClick={switchMode} type="button">
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </main>
        </div>
    )
}