import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { logout } from './services/authService'

function App() {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')

  const [page, setPage] = useState(storedUser ? 'dashboard' : 'login')
  const [username, setUsername] = useState(storedUser?.username || '')
  const [role, setRole] = useState(storedUser?.role || '')

  const handleLogout = () => {
    logout()
    setUsername('')
    setRole('')
    setPage('login')
  }

  if (page === 'dashboard') {
    if (role === 'admin') {
      return <AdminDashboard username={username} onLogout={handleLogout} />
    }
    return <DashboardPage username={username} onLogout={handleLogout} />
  }

  return (
      <LoginPage
          onLoginSuccess={(name, userRole) => {
            setUsername(name)
            setRole(userRole)
            setPage('dashboard')
          }}
      />
  )
}

export default App
