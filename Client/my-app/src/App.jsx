import { useState } from 'react'
import LoginPage from './pages/LoginPage'

function App() {
  const [authenticated, setAuthenticated] = useState(false)

  if (!authenticated) {
    return <LoginPage onAuthSuccess={() => setAuthenticated(true)} />
  }

  // TODO: replace with your main app content / router
  return <div>You are logged in! (main app goes here)</div>
}

export default App