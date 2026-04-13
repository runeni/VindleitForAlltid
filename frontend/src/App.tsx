import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { OverviewPage } from './pages/OverviewPage'
import { SpotDetailPage } from './pages/SpotDetailPage'
import { AdminSpotsPage } from './pages/AdminSpotsPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight text-white">
            Vindleit for alltid
          </span>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-medium' : 'text-gray-400 hover:text-gray-200'
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/admin/spots"
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-medium' : 'text-gray-400 hover:text-gray-200'
            }
          >
            Admin
          </NavLink>
        </nav>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/spots/:id" element={<SpotDetailPage />} />
            <Route path="/admin/spots" element={<AdminSpotsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
