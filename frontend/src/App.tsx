import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import AddTool from './components/AddTool'
import BorrowTool from './components/BorrowTool'
import MyTools from './components/MyTools'
import MyRequests from './components/MyRequests'
import IncomingRequests from './components/IncomingRequests'
import Layout from './components/Layout'
import MyBorrowedTools from './components/MyBorrowedTools';
import LentTools from './components/LentTools';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/add-tool" element={
                <ProtectedRoute>
                  <Layout><AddTool /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/borrow-tool/:toolId" element={
                <ProtectedRoute>
                  <Layout><BorrowTool /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/my-tools" element={
                <ProtectedRoute>
                  <Layout><MyTools /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/my-requests" element={
                <ProtectedRoute>
                  <Layout><MyRequests /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/incoming-requests" element={
                <ProtectedRoute>
                  <Layout><IncomingRequests /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/my-borrowed-tools" element={
               <ProtectedRoute>
                <Layout><MyBorrowedTools /></Layout>
              </ProtectedRoute>
              } />

              <Route path="/lent-tools" element={
              <ProtectedRoute>
              <Layout><LentTools /></Layout>
                 </ProtectedRoute>
              } />



            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App