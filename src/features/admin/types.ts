export type AccountStatus = 'active' | 'suspended' | 'deleted'

export interface AdminUserRecord {
  id: string
  email: string
  full_name: string
  kind: 'admin' | 'employee' | 'seller'
  status: AccountStatus
  role_ids: string[]
}

export interface SellerRecord extends AdminUserRecord {
  is_paid: boolean
  is_assigned: boolean
  assigned_employees: string[]
}

export interface AdminSellersOverview {
  counts: {
    total: number
    assigned: number
    unassigned: number
    paid: number
    unpaid: number
  }
  sellers: SellerRecord[]
}

export interface AssignedSeller {
  id: string
  full_name: string
  email: string
  status: AccountStatus
}

export interface EmployeeRecord extends AdminUserRecord {
  assigned_sellers: AssignedSeller[]
}

export interface GroupMemberRecord {
  user_id: string
  member_kind: 'employee' | 'seller'
  email: string
  full_name: string
}

export interface GroupRecord {
  id: string
  name: string
  description: string | null
  members: GroupMemberRecord[]
}

export interface RoleRecord {
  id: string
  name: string
  description: string | null
  policy_ids: string[]
}

export interface PolicyRecord {
  id: string
  code: string
  description: string | null
}
