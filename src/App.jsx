import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminManagement from './pages/AdminManagement'
import RolePermissions from './pages/RolePermissions'
import Clients from './pages/Clients'
import Employees from './pages/Employees'
import Trainings from './pages/Trainings'
import Certificates from './pages/Certificates'
import Campaigns from './pages/Campaigns'
import Tasks from './pages/Tasks'
import TaskVerification from './pages/TaskVerification'
import Wallet from './pages/Wallet'
import Withdrawals from './pages/Withdrawals'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import ActivityLogs from './pages/ActivityLogs'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="admin-management" element={<AdminManagement />} />
          <Route path="roles" element={<RolePermissions />} />
          <Route path="clients" element={<Clients />} />
          <Route path="employees" element={<Employees />} />
          <Route path="trainings" element={<Trainings />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="task-verification" element={<TaskVerification />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
