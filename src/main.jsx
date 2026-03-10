import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Ledger from './components/Ledger'
import AuthPage from './components/AuthPage.jsx'
import './index.css'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="loading-screen"><span>LOADING LEDGER...</span></div>
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
