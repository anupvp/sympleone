import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './app/AdminRoute'
import { ProtectedRoute } from './app/ProtectedRoute'
import { EmployeesAdminPage } from './features/admin/pages/EmployeesAdminPage'
import { GroupsAdminPage } from './features/admin/pages/GroupsAdminPage'
import { RolesAdminPage } from './features/admin/pages/RolesAdminPage'
import { SellersAdminPage } from './features/admin/pages/SellersAdminPage'
import { LoginPage } from './features/auth/LoginPage'
import { SellerLoginPage } from './features/auth/SellerLoginPage'
import { AmazonOAuthHandoff } from './features/amazon/AmazonOAuthHandoff'
import { AmazonOAuthRouteFallback } from './features/amazon/AmazonOAuthRouteFallback'
import { AmazonOAuthCallbackPage } from './features/amazon/AmazonOAuthCallbackPage'
import { AmazonSellerConnectPage } from './features/amazon/AmazonSellerConnectPage'
import { ChangePasswordPage } from './features/account/ChangePasswordPage'
import { ProfilePage } from './features/account/ProfilePage'
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
        <Route path="/seller/login" element={<SellerLoginPage />} />
        <Route path="/seller" element={<Navigate to="/seller/login" replace />} />
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
          path="/account/password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
        <Route path="*" element={<AmazonOAuthRouteFallback />} />
      </Routes>
    </BrowserRouter>
  )
}
