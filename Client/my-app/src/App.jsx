import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage.jsx'

function App() {
  // 'login' | 'dashboard'
  const [page, setPage] = useState('login')
  const [username, setUsername] = useState('')

  if (page === 'dashboard') {
    return (
        <DashboardPage
            username={username}
            onLogout={() => { setUsername(''); setPage('login') }}
        />
    )
  }

  return (
      <LoginPage
          onLoginSuccess={(user = 'User') => { setUsername(user); setPage('dashboard') }}
      />
  )
}

export default App