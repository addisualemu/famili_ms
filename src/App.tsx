import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ParentLogin } from './auth/ParentLogin.tsx'
import { ParentSession } from './auth/ParentSession.tsx'
import { useAuthUser } from './auth/useAuthUser.ts'
import { useFamily } from './family/useFamily.ts'

function AuthGate() {
  const { user, claims, error, ready } = useAuthUser()
  const parentName = user?.displayName || 'Parent'
  const family = useFamily(claims, parentName)

  if (!ready || (claims && !family.ready)) {
    return <main aria-busy="true" className="min-h-svh bg-cream" />
  }

  if (user) {
    return (
      <ParentSession
        claims={claims}
        members={family.members}
        sessionError={error || family.error}
        user={user}
      />
    )
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
