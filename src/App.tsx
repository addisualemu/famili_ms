import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ParentLogin } from './auth/ParentLogin.tsx'
import { ParentSession } from './auth/ParentSession.tsx'
import { useAuthUser } from './auth/useAuthUser.ts'

function AuthGate() {
  const { user, claims, error, ready } = useAuthUser()

  if (!ready) {
    return <main aria-busy="true" className="min-h-svh bg-cream" />
  }

  if (user) {
    return <ParentSession claims={claims} sessionError={error} user={user} />
  }

  return <ParentLogin />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthGate />} />
        <Route path="/login" element={<AuthGate />} />
      </Routes>
    </BrowserRouter>
  )
}
