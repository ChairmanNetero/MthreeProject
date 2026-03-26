import { useState, useMemo, useEffect, useCallback } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService'
import './DashboardPage.css'

// ── Helpers ────────────────────────────────────────────────────────────────

/** Parse "1h30", "1.5", "90m", plain numbers, etc. → decimal hours */
function parseHours(raw) {
    if (!raw || !String(raw).trim()) return null
    const s = String(raw).trim().toLowerCase()
    const hm = s.match(/^(\d+(?:\.\d+)?)h(\d+)m?$/)
    if (hm) return parseFloat(hm[1]) + parseInt(hm[2], 10) / 60
    const m = s.match(/^(\d+(?:\.\d+)?)m$/)
    if (m) return parseFloat(m[1]) / 60
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

const CATEGORIES = [
    '1-1 Tutoring',
    'Academy & Wider Org Calls',
    'Cohort Meetings',
    'Holiday',
    'PTO',
    'Technical Interview',
    'Technical Screening',
]

const EMPTY_FORM = { title: '', date: todayISO(), hoursRaw: '', notes: '', category: CATEGORIES[0] }

// ── Component ──────────────────────────────────────────────────────────────

export default function DashboardPage({ username = 'User', onLogout }) {
    const [tasks, setTasks] = useState([])
    const [form, setForm] = useState(EMPTY_FORM)
    const [editingId, setEditingId] = useState(null)
    const [formError, setFormError] = useState('')
    const [filterMonth, setFilterMonth] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    // ── fetch tasks ────────────────────────────────────────────────────────

    const loadTasks = useCallback(async () => {
        setLoading(true)
        setApiError('')
        try {
            const data = await getTasks(filterMonth)
            // normalize backend field names to frontend names
            setTasks(data.map(t => ({
                id: t.id,
                title: t.task_name,
                date: t.task_date,
                hours: t.hours != null ? parseFloat(t.hours) : null,
                notes: t.description || '',
                category: t.category || '',
            })))
        } catch (err) {
            setApiError(err.message)
        } finally {
            setLoading(false)
        }
    }, [filterMonth])

    useEffect(() => { loadTasks() }, [loadTasks])

    // ── derived ──────────────────────────────────────────────────────────────

    const totalHours = useMemo(
        () => tasks.reduce((s, t) => s + (t.hours ?? 0), 0),
        [tasks]
    )

    const months = useMemo(() => {
        const set = new Set(tasks.map(t => String(t.date).slice(0, 7)))
        return Array.from(set).sort().reverse()
    }, [tasks])

    const categoryStats = useMemo(() => {
        const map = {}
        for (const t of tasks) {
            const cat = t.category || 'Uncategorized'
            if (!map[cat]) map[cat] = { count: 0, hours: 0 }
            map[cat].count += 1
            map[cat].hours += t.hours ?? 0
        }
        return Object.entries(map).sort((a, b) => b[1].hours - a[1].hours)
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
            category: task.category || CATEGORIES[0],
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim()) { setFormError('Title is required.'); return }
        if (!form.date) { setFormError('Date is required.'); return }

        const hours = form.hoursRaw ? parseHours(form.hoursRaw) : null
        if (form.hoursRaw && hours === null) {
            setFormError('Invalid duration. Try "1h30", "1.5", or "90m".')
            return
        }
        if (hours === null || hours <= 0) {
            setFormError('Duration is required and must be greater than 0.')
            return
        }

        const payload = {
            title: form.title.trim(),
            date: form.date,
            hours,
            notes: form.notes.trim(),
            category: form.category.trim(),
        }

        try {
            if (editingId !== null) {
                await updateTask(editingId, payload)
            } else {
                await createTask(payload)
            }
            setShowForm(false)
            setEditingId(null)
            await loadTasks()
        } catch (err) {
            setFormError(err.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task?')) return
        try {
            await deleteTask(id)
            await loadTasks()
        } catch (err) {
            setApiError(err.message)
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

                {apiError && <p className="form-error" style={{ margin: '0 0 1rem' }}>{apiError}</p>}

                {/* ── Stats strip ── */}
                <div className="stats-strip">
                    <div className="stat-card">
                        <span className="stat-value">{tasks.length}</span>
                        <span className="stat-label">tasks {filterMonth ? 'this month' : 'total'}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{formatHours(totalHours)}</span>
                        <span className="stat-label">hours logged</span>
                    </div>
                </div>

                {/* ── Category summary ── */}
                {categoryStats.length > 0 && (
                    <table className="task-table" style={{ marginBottom: '1.5rem' }}>
                        <thead>
                        <tr>
                            <th>Category</th>
                            <th>Tasks</th>
                            <th>Total Hours</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categoryStats.map(([cat, { count, hours }]) => (
                            <tr key={cat}>
                                <td className="cell-title">{cat}</td>
                                <td className="cell-hours">{count}</td>
                                <td className="cell-hours">{formatHours(hours)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

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
                                    <label>Duration *</label>
                                    <input name="hoursRaw" value={form.hoursRaw} onChange={handleChange}
                                           placeholder="1h30 / 1.5 / 90m" />
                                </div>
                                <div className="field field--sm">
                                    <label>Category</label>
                                    <select name="category" value={form.category} onChange={handleChange}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
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
                {loading ? (
                    <div className="empty-state"><p>Loading…</p></div>
                ) : tasks.length === 0 ? (
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
                            <th>Category</th>
                            <th>Notes</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {tasks
                            .slice()
                            .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                            .map(task => (
                                <tr key={task.id} className={editingId === task.id ? 'row--editing' : ''}>
                                    <td className="cell-title">{task.title}</td>
                                    <td className="cell-date">{String(task.date).slice(0, 10)}</td>
                                    <td className="cell-hours">{formatHours(task.hours)}</td>
                                    <td className="cell-notes">{task.category || '—'}</td>
                                    <td className="cell-notes">{task.notes || '—'}</td>
                                    <td className="cell-actions">
                                        <button className="icon-btn" title="Edit" onClick={() => openEdit(task)}>✎</button>
                                        <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => handleDelete(task.id)}>✕</button>
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
