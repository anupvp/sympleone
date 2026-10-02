import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './app/AdminRoute'
import { ProtectedRoute } from './app/ProtectedRoute'
import { EmployeesAdminPage } from './features/admin/pages/EmployeesAdminPage'
import { GroupsAdminPage } from './features/admin/pages/GroupsAdminPage'
import { RolesAdminPage } from './features/admin/pages/RolesAdminPage'
import { SellersAdminPage } from './features/admin/pages/SellersAdminPage'
import { LoginPage } from './features/auth/LoginPage'
import { AmazonOAuthHandoff } from './features/amazon/AmazonOAuthHandoff'
import { AmazonOAuthCallbackPage } from './features/amazon/AmazonOAuthCallbackPage'
import { AmazonSellerConnectPage } from './features/amazon/AmazonSellerConnectPage'
import { DashboardPage } from './features/dashboard/DashboardPage'

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminRoute>{children}</AdminRoute>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AmazonOAuthHandoff />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/amazon/connect" element={<AmazonSellerConnectPage />} />
        <Route path="/amazon/callback" element={<AmazonOAuthCallbackPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <AdminLayout>
              <EmployeesAdminPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/sellers"
          element={
            <AdminLayout>
              <SellersAdminPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <AdminLayout>
              <GroupsAdminPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <AdminLayout>
              <RolesAdminPage />
            </AdminLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
