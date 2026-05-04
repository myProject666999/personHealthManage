import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import HealthRecords from './pages/HealthRecords'
import HealthEvaluation from './pages/HealthEvaluation'
import SportKnowledge from './pages/SportKnowledge'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="health/records" element={<HealthRecords />} />
          <Route path="health/evaluation" element={<HealthEvaluation />} />
          <Route path="sport" element={<SportKnowledge />} />
          <Route path="profile" element={<Profile />} />
          <Route path="password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
