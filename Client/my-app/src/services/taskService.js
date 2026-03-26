// src/services/taskService.js

import { getToken } from './authService'

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
    }
}

/**
 * Fetch tasks, optionally filtered by month (YYYY-MM).
 */
export async function getTasks(month = '') {
    const url = month
        ? `/api/tasks?month=${month}`
        : `/api/tasks`

    const res = await fetch(url, { headers: authHeaders() })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to fetch tasks.')
    return body.tasks // array
}

/**
 * Create a new task.
 * @param {{ title, date, hoursRaw, notes, category }} data
 */
export async function createTask({ title, date, hours, notes, category }) {
    const res = await fetch(`/api/tasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            task_name: title,
            task_date: date,
            hours,
            description: notes,
            category: category || 'Uncategorized',
        }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to create task.')
    return body.task
}

/**
 * Update an existing task.
 * @param {number} id
 * @param {{ title, date, hours, notes, category }} data
 */
export async function updateTask(id, { title, date, hours, notes, category }) {
    const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
            task_name: title,
            task_date: date,
            hours,
            description: notes,
            category: category || 'Uncategorized',
        }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to update task.')
    return body.task
}

/**
 * Delete a task by id.
 */
export async function deleteTask(id) {
    const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to delete task.')
    return body
}
