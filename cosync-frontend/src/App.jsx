import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import { logout, updateUser } from './store/authSlice'
import api from './lib/api'

import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import ProjectsFeedPage from './pages/public/ProjectsFeedPage'

import DashboardPage from './pages/auth/DashboardPage'
import MyProjectsPage from './pages/auth/MyProjectsPage'
import ApplicationsPage from './pages/auth/ApplicationsPage'
import NotificationsPage from './pages/auth/NotificationsPage'
import ProfilePage from './pages/auth/ProfilePage'

import CreateProjectPage from './pages/projects/CreateProjectPage'
import ProjectDetailPage from './pages/projects/ProjectDetailPage'

import WorkspacePage from './pages/workspace/WorkspacePage'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('cosync_token')
      if (token) {
        try {
          const res = await api.get('/users/profile')
          dispatch(updateUser(res.data.data))
        } catch (err) {
          if (err.response?.status === 401) {
            dispatch(logout())
            window.location.href = '/login'
          }
        }
      }
    }
    validateToken()
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/feed" element={<ProjectsFeedPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* ── Project routes (public — no auth needed to view) ── */}
        <Route path="/projects/:id" element={<ProjectDetailPage />} />

        {/* ── Protected routes ── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/my-projects" element={<ProtectedRoute><MyProjectsPage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/projects/create" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
        <Route path="/workspace/:id" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App