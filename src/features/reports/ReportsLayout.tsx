import { Outlet } from 'react-router-dom'
import { AppShell } from '../../layout/AppShell'
import { DashboardToolbar } from '../dashboard/layout/DashboardToolbar'

export function ReportsLayout() {
  return (
    <AppShell toolbar={<DashboardToolbar />}>
      <Outlet />
    </AppShell>
  )
}