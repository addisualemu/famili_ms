import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './shell/AppShell.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  )
}
