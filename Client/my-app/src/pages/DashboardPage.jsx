import { useState, useMemo } from 'react'
import './DashboardPage.css'

// ── Helpers ────────────────────────────────────────────────────────────────

/** Parse "1h30", "1.5", "90m", plain numbers, etc. → decimal hours */
function parseHours(raw) {
    if (!raw || !String(raw).trim()) return null
    const s = String(raw).trim().toLowerCase()
    // e.g. 1h30 or 1h30m
    const hm = s.match(/^(\d+(?:\.\d+)?)h(\d+)m?$/)
    if (hm) return parseFloat(hm[1]) + parseInt(hm[2], 10) / 60
    // e.g. 90m
    const m = s.match(/^(\d+(?:\.\d+)?)m$/)
    if (m) return parseFloat(m[1]) / 60
    // plain decimal or integer
    const n = parseFloat(s)
    return isNaN(n) ? null : n
}

function formatHours(h) {
    if (h == null) return '—'
    const hrs = Math.floor(h)
    const mins = Math.round((h - hrs) * 60)
    if (hrs === 0) return `${mins}m`
    if (mins === 0) return `${hrs}h`
    return `${hrs}h ${mins}m`
}

function todayISO() {
    return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM = { title: '', date: todayISO(), hoursRaw: '', notes: '' }

let nextId = 1

// ── Component ──────────────────────────────────────────────────────────────

export default function DashboardPage({ username = 'User', onLogout }) {
    const [tasks, setTasks] = useState([])
    const [form, setForm] = useState(EMPTY_FORM)
    const [editingId, setEditingId] = useState(null)
    const [formError, setFormError] = useState('')
    const [filterMonth, setFilterMonth] = useState('') // 'YYYY-MM' or ''
    const [showForm, setShowForm] = useState(false)

    // ── derived ──────────────────────────────────────────────────────────────

    const filtered = useMemo(() => {
        if (!filterMonth) return tasks
        return tasks.filter(t => t.date.startsWith(filterMonth))
    }, [tasks, filterMonth])

    const totalHours = useMemo(
        () => filtered.reduce((s, t) => s + (t.hours ?? 0), 0),
        [filtered]
    )

    const months = useMemo(() => {
        const set = new Set(tasks.map(t => t.date.slice(0, 7)))
        return Array.from(set).sort().reverse()
    }, [tasks])

    // ── form helpers ─────────────────────────────────────────────────────────

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setFormError('')
    }

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setEditingId(null)
        setFormError('')
        setShowForm(true)
    }

    const openEdit = (task) => {
        setForm({
            title: task.title,
            date: task.date,
            hoursRaw: task.hours != null ? String(task.hours) : '',
            notes: task.notes || '',
        })
        setEditingId(task.id)
        setFormError('')
        setShowForm(true)
    }

    const cancelForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormError('')
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.title.trim()) { setFormError('Title is required.'); return }
        if (!form.date) { setFormError('Date is required.'); return }

        const hours = form.hoursRaw ? parseHours(form.hoursRaw) : null
        if (form.hoursRaw && hours === null) {
            setFormError('Invalid duration. Try "1h30", "1.5", or "90m".')
            return
        }

        if (editingId !== null) {
            setTasks(tasks.map(t =>
                t.id === editingId
                    ? { ...t, title: form.title.trim(), date: form.date, hours, notes: form.notes.trim() }
                    : t
            ))
        } else {
            setTasks([...tasks, {
                id: nextId++,
                title: form.title.trim(),
                date: form.date,
                hours,
                notes: form.notes.trim(),
                createdAt: new Date().toISOString(),
            }])
        }
        setShowForm(false)
        setEditingId(null)
    }

    const deleteTask = (id) => {
        if (window.confirm('Delete this task?')) {
            setTasks(tasks.filter(t => t.id !== id))
        }
    }

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="dash-root">
            {/* ── Sidebar ── */}
            <aside className="dash-sidebar">
                <div className="sidebar-logo">TaskTimer</div>
                <nav className="sidebar-nav">
                    <span className="nav-item active">Dashboard</span>
                </nav>
                <div className="sidebar-footer">
                    <span className="sidebar-user">{username}</span>
                    <button className="logout-btn" onClick={onLogout}>Log out</button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="dash-main">
                {/* ── Top bar ── */}
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h2 className="page-title">My Tasks</h2>
                        {filterMonth && (
                            <span className="filter-badge">
                {filterMonth}
                                <button className="badge-clear" onClick={() => setFilterMonth('')}>×</button>
              </span>
                        )}
                    </div>
                    <div className="topbar-right">
                        {months.length > 0 && (
                            <select
                                className="month-select"
                                value={filterMonth}
                                onChange={e => setFilterMonth(e.target.value)}
                            >
                                <option value="">All months</option>
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        )}
                        <button className="btn-primary" onClick={openCreate}>+ New Task</button>
                    </div>
                </header>

                {/* ── Stats strip ── */}
                <div className="stats-strip">
                    <div className="stat-card">
                        <span className="stat-value">{filtered.length}</span>
                        <span className="stat-label">tasks {filterMonth ? 'this month' : 'total'}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{formatHours(totalHours)}</span>
                        <span className="stat-label">hours logged</span>
                    </div>
                </div>

                {/* ── Task form (inline panel) ── */}
                {showForm && (
                    <div className="form-panel">
                        <h3 className="form-title">{editingId !== null ? 'Edit Task' : 'New Task'}</h3>
                        <form className="task-form" onSubmit={handleSubmit} noValidate>
                            <div className="form-row">
                                <div className="field">
                                    <label>Title *</label>
                                    <input name="title" value={form.title} onChange={handleChange}
                                           placeholder="e.g. Write project report" autoFocus />
                                </div>
                                <div className="field field--sm">
                                    <label>Date *</label>
                                    <input name="date" type="date" value={form.date} onChange={handleChange} />
                                </div>
                                <div className="field field--sm">
                                    <label>Duration</label>
                                    <input name="hoursRaw" value={form.hoursRaw} onChange={handleChange}
                                           placeholder="1h30 / 1.5 / 90m" />
                                </div>
                            </div>
                            <div className="field">
                                <label>Notes</label>
                                <textarea name="notes" value={form.notes} onChange={handleChange}
                                          rows={2} placeholder="Optional notes…" />
                            </div>
                            {formError && <p className="form-error">{formError}</p>}
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {editingId !== null ? 'Save Changes' : 'Add Task'}
                                </button>
                                <button type="button" className="btn-ghost" onClick={cancelForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Task list ── */}
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <p>{filterMonth ? 'No tasks for this month.' : 'No tasks yet — create one!'}</p>
                    </div>
                ) : (
                    <table className="task-table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Duration</th>
                            <th>Notes</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered
                            .slice()
                            .sort((a, b) => b.date.localeCompare(a.date))
                            .map(task => (
                                <tr key={task.id} className={editingId === task.id ? 'row--editing' : ''}>
                                    <td className="cell-title">{task.title}</td>
                                    <td className="cell-date">{task.date}</td>
                                    <td className="cell-hours">{formatHours(task.hours)}</td>
                                    <td className="cell-notes">{task.notes || '—'}</td>
                                    <td className="cell-actions">
                                        <button className="icon-btn" title="Edit" onClick={() => openEdit(task)}>✎</button>
                                        <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => deleteTask(task.id)}>✕</button>
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