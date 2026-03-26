// src/services/authService.js

export function getToken() {
    return localStorage.getItem('access_token')
}

export function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
}

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ access_token: string, user: object }>}
 */
export async function login({ email, password }) {
    const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Login failed.')

    localStorage.setItem('access_token', body.access_token)
    localStorage.setItem('user', JSON.stringify(body.user))
    return body
}

/**
 * Register a new user.
 * @param {{ username: string, email: string, password: string }} data
 * @returns {Promise<{ user: object }>}
 */
export async function signup({ username, email, password }) {
    const res = await fetch(`/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Sign-up failed.')
    return body
}
