import { apiRequest } from '../../api/httpClient'
import { API_CONFIG } from '../../config/api.config'

export interface EmployeeProfile {
  id: string
  full_name: string
  employee_code: string | null
  location: string | null
  manager_name: string | null
  joined_at: string
}

export interface EmployeeSellerRow {
  id: string
  full_name: string
  status: string
  has_dashboard_access: boolean
  access_request_status: string | null
}

export interface SellerAccessRequest {
  id: string
  employee_id: string
  employee_name: string
  seller_id: string
  seller_name: string
  status: string
  created_at: string
}

export function fetchEmployeeProfile(token: string) {
  return apiRequest<EmployeeProfile>({
    method: 'GET',
    endpoint: API_CONFIG.endpoints.employee.me,
    token,
    rawPath: true,
  })
}

export function fetchEmployeeSellers(token: string) {
  return apiRequest<EmployeeSellerRow[]>({
    method: 'GET',
    endpoint: API_CONFIG.endpoints.employee.sellers,
    token,
    rawPath: true,
  })
}

export function fetchEmployeeAssignedSellers(token: string) {
  return apiRequest<EmployeeSellerRow[]>({
    method: 'GET',
    endpoint: API_CONFIG.endpoints.employee.assignedSellers,
    token,
    rawPath: true,
  })
}

export function requestSellerAccess(token: string, sellerId: string) {
  return apiRequest<{ id: string; status: string }>({
    method: 'POST',
    endpoint: `/employee/seller-access-requests/${sellerId}`,
    token,
    rawPath: true,
  })
}

export function listSellerAccessRequests(token: string) {
  return apiRequest<SellerAccessRequest[]>({
    method: 'GET',
    endpoint: API_CONFIG.endpoints.admin.sellerAccessRequests,
    token,
    rawPath: true,
  })
}

export function approveSellerAccessRequest(token: string, requestId: string) {
  return apiRequest<SellerAccessRequest>({
    method: 'POST',
    endpoint: `${API_CONFIG.endpoints.admin.sellerAccessRequests}/${requestId}/approve`,
    token,
    rawPath: true,
  })
}

export function rejectSellerAccessRequest(token: string, requestId: string) {
  return apiRequest<void>({
    method: 'POST',
    endpoint: `${API_CONFIG.endpoints.admin.sellerAccessRequests}/${requestId}/reject`,
    token,
    rawPath: true,
  })
}
