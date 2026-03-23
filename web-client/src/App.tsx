import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ServiceStatus } from './components/ServiceStatus'
import { HomePage } from './pages/HomePage'
import { LobbyPage } from './pages/LobbyPage'
import './App.css'

function AppShell() {
  return (
    <div className="app">
      <ServiceStatus />
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
