import { useState, useEffect, useCallback } from 'react'
import { getUsers, createUser, deleteUser } from '../services/adminService'
import './DashboardPage.css'

const EMPTY_FORM = { username: '', email: '', password: '', role: 'user' }

export default function AdminDashboard({ username, onLogout }) {
    const [users, setUsers] = useState([])
    const [form, setForm] = useState(EMPTY_FORM)
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [apiError, setApiError] = useState('')

    const loadUsers = useCallback(async () => {
        setLoading(true)
        setApiError('')
        try {
            setUsers(await getUsers())
        } catch (err) {
            setApiError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadUsers() }, [loadUsers])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setFormError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
            setFormError('All fields are required.')
            return
        }
        try {
            await createUser(form)
            setForm(EMPTY_FORM)
            setShowForm(false)
            await loadUsers()
        } catch (err) {
            setFormError(err.message)
        }
    }

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete user "${name}"? This also removes all their tasks.`)) return
        try {
            await deleteUser(id)
            await loadUsers()
        } catch (err) {
            setApiError(err.message)
        }
    }

    return (
        <div className="dash-root">
            <aside className="dash-sidebar">
                <div className="sidebar-logo">TaskTimer</div>
                <nav className="sidebar-nav">
                    <span className="nav-item active">Users</span>
                </nav>
                <div className="sidebar-footer">
                    <span className="sidebar-user">{username} (admin)</span>
                    <button className="logout-btn" onClick={onLogout}>Log out</button>
                </div>
            </aside>

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h2 className="page-title">User Management</h2>
                    </div>
                    <div className="topbar-right">
                        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setFormError('') }}>
                            {showForm ? 'Cancel' : '+ Add User'}
                        </button>
                    </div>
                </header>

                {apiError && <p className="form-error" style={{ marginBottom: '1rem' }}>{apiError}</p>}

                <div className="stats-strip">
                    <div className="stat-card">
                        <span className="stat-value">{users.length}</span>
                        <span className="stat-label">total users</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
                        <span className="stat-label">admins</span>
                    </div>
                </div>

                {showForm && (
                    <div className="form-panel">
                        <h3 className="form-title">New User</h3>
                        <form className="task-form" onSubmit={handleSubmit} noValidate>
                            <div className="form-row">
                                <div className="field">
                                    <label>Username *</label>
                                    <input name="username" value={form.username} onChange={handleChange}
                                           placeholder="john_doe" autoFocus />
                                </div>
                                <div className="field">
                                    <label>Email *</label>
                                    <input name="email" type="email" value={form.email} onChange={handleChange}
                                           placeholder="john@example.com" />
                                </div>
                                <div className="field field--sm">
                                    <label>Password *</label>
                                    <input name="password" type="password" value={form.password} onChange={handleChange}
                                           placeholder="••••••••" />
                                </div>
                                <div className="field field--sm">
                                    <label>Role</label>
                                    <select name="role" value={form.role} onChange={handleChange}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            {formError && <p className="form-error">{formError}</p>}
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Create User</button>
                                <button type="button" className="btn-ghost" onClick={() => { setShowForm(false); setFormError('') }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="empty-state"><p>Loading…</p></div>
                ) : users.length === 0 ? (
                    <div className="empty-state"><p>No users yet.</p></div>
                ) : (
                    <table className="task-table">
                        <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="cell-title">{u.username}</td>
                                <td className="cell-notes">{u.email}</td>
                                <td className="cell-hours">{u.role}</td>
                                <td className="cell-date">{String(u.created_at).slice(0, 10)}</td>
                                <td className="cell-actions">
                                    {u.username !== username && (
                                        <button
                                            className="icon-btn icon-btn--danger"
                                            title="Delete user"
                                            onClick={() => handleDelete(u.id, u.username)}
                                        >✕</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </main>
        </div>
    )
}
