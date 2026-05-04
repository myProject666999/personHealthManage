import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import RoleManagement from './pages/RoleManagement'
import SportKnowledgeManagement from './pages/SportKnowledgeManagement'
import HealthRecordManagement from './pages/HealthRecordManagement'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token')
  return token ? children : <Navigate to="/login" />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="sport" element={<SportKnowledgeManagement />} />
          <Route path="health" element={<HealthRecordManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
