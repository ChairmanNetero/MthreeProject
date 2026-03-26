// src/services/adminService.js

import { getToken } from './authService'

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
    }
}

export async function getUsers() {
    const res = await fetch('/api/admin/users', { headers: authHeaders() })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to fetch users.')
    return body.users
}

export async function createUser({ username, email, password, role }) {
    const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ username, email, password, role }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to create user.')
    return body.user
}

export async function deleteUser(id) {
    const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to delete user.')
    return body
}
