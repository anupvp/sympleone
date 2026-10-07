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
import { AccountHealthReportPage } from './features/dashboard/AccountHealthReportPage'
import { PlaceholderSectionPage } from './features/app/PlaceholderSectionPage'
import { DashboardPage } from './features/dashboard/DashboardPage'

function AppSection({ title }: { title: string }) {
  return (
    <PlaceholderSectionPage
      title={title}
      description={`Manage ${title.toLowerCase()} from this workspace.`}
    />
  )
}

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
          path="/dashboard/account-health/report"
          element={
            <ProtectedRoute>
              <AccountHealthReportPage />
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
        <Route path="/app/orders" element={<ProtectedRoute><AppSection title="Orders" /></ProtectedRoute>} />
        <Route path="/app/products" element={<ProtectedRoute><AppSection title="Products" /></ProtectedRoute>} />
        <Route path="/app/inventory" element={<ProtectedRoute><AppSection title="Inventory" /></ProtectedRoute>} />
        <Route path="/app/marketplaces" element={<ProtectedRoute><AppSection title="Marketplaces" /></ProtectedRoute>} />
        <Route path="/app/advertising" element={<ProtectedRoute><AppSection title="Advertising" /></ProtectedRoute>} />
        <Route path="/app/finance" element={<ProtectedRoute><AppSection title="Finance" /></ProtectedRoute>} />
        <Route path="/app/reports" element={<ProtectedRoute><AppSection title="Reports" /></ProtectedRoute>} />
        <Route path="*" element={<AmazonOAuthRouteFallback />} />
      </Routes>
    </BrowserRouter>
  )
}
