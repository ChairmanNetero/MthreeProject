// src/services/authService.js
// ─────────────────────────────────────────────────────────────
// Auth API calls.  Replace BASE_URL and endpoint paths once
// your backend is ready.
// ─────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3000' // TODO: set your real API base URL

/**
 * Log in an existing user.
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login({ username, password }) {
    // TODO: replace '/api/auth/login' with your real endpoint
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Login failed.')
    }

    return res.json() // expected: { token, user }
}

/**
 * Register a new user.
 * @param {{ username: string, email: string, password: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function signup({ username, email, password }) {
    // TODO: replace '/api/auth/signup' with your real endpoint
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    })

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Sign-up failed.')
    }

    return res.json() // expected: { token, user }
}