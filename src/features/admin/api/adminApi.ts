import { apiRequest } from '../../../api/httpClient'
import { API_CONFIG } from '../../../config/api.config'
import type {
  AdminSellersOverview,
  AdminUserRecord,
  EmployeeRecord,
  GroupRecord,
  PolicyRecord,
  RoleRecord,
  SellerRecord,
} from '../types'

/** Path only — httpClient prepends API_CONFIG.baseUrl when rawPath is true. */
function employeesUrl(id?: string, action?: string): string {
  let path = API_CONFIG.endpoints.admin.employees
  if (id) path += `/${id}`
  if (action) path += `/${action}`
  return path
}

function sellersUrl(id?: string, action?: string): string {
  let path = API_CONFIG.endpoints.admin.sellers
  if (id) path += `/${id}`
  if (action) path += `/${action}`
  return path
}

function groupsUrl(id?: string): string {
  let path = API_CONFIG.endpoints.admin.groups
  if (id) path += `/${id}`
  return path
}

function rolesUrl(id?: string): string {
  let path = API_CONFIG.endpoints.admin.roles
  if (id) path += `/${id}`
  return path
}

function policiesUrl(): string {
  return API_CONFIG.endpoints.admin.policies
}

export async function listEmployees(token: string): Promise<EmployeeRecord[]> {
  return apiRequest({
    method: 'GET',
    endpoint: employeesUrl(),
    token,
    rawPath: true,
  })
}

export async function createEmployee(
  token: string,
  body: {
    email: string
    password: string
    full_name: string
    role_ids?: string[]
    seller_ids?: string[]
  },
): Promise<EmployeeRecord> {
  return apiRequest({
    method: 'POST',
    endpoint: employeesUrl(),
    token,
    body,
    rawPath: true,
  })
}

export async function suspendEmployee(token: string, id: string): Promise<AdminUserRecord> {
  return apiRequest({
    method: 'POST',
    endpoint: employeesUrl(id, 'suspend'),
    token,
    rawPath: true,
  })
}

export async function activateEmployee(token: string, id: string): Promise<AdminUserRecord> {
  return apiRequest({
    method: 'POST',
    endpoint: employeesUrl(id, 'activate'),
    token,
    rawPath: true,
  })
}

export async function deleteEmployee(token: string, id: string): Promise<void> {
  await apiRequest({
    method: 'DELETE',
    endpoint: employeesUrl(id),
    token,
    rawPath: true,
  })
}

export async function assignSellersToEmployee(
  token: string,
  employeeId: string,
  sellerIds: string[],
): Promise<AdminUserRecord[]> {
  return apiRequest({
    method: 'POST',
    endpoint: `${employeesUrl(employeeId)}/sellers`,
    token,
    body: { seller_ids: sellerIds },
    rawPath: true,
  })
}

export async function removeSellerFromEmployee(
  token: string,
  employeeId: string,
  sellerId: string,
): Promise<void> {
  await apiRequest({
    method: 'DELETE',
    endpoint: `${employeesUrl(employeeId)}/sellers/${sellerId}`,
    token,
    rawPath: true,
  })
}

export async function updateEmployeeRoles(
  token: string,
  id: string,
  role_ids: string[],
): Promise<AdminUserRecord> {
  return apiRequest({
    method: 'PATCH',
    endpoint: employeesUrl(id),
    token,
    body: { role_ids },
    rawPath: true,
  })
}

export async function listRoles(token: string): Promise<RoleRecord[]> {
  return apiRequest({
    method: 'GET',
    endpoint: rolesUrl(),
    token,
    rawPath: true,
  })
}

export async function listPolicies(token: string): Promise<PolicyRecord[]> {
  return apiRequest({
    method: 'GET',
    endpoint: policiesUrl(),
    token,
    rawPath: true,
  })
}

export async function createRole(
  token: string,
  body: { name: string; description?: string; policy_ids: string[] },
): Promise<RoleRecord> {
  return apiRequest({
    method: 'POST',
    endpoint: rolesUrl(),
    token,
    body,
    rawPath: true,
  })
}

export async function updateRole(
  token: string,
  id: string,
  body: { name?: string; description?: string; policy_ids?: string[] },
): Promise<RoleRecord> {
  return apiRequest({
    method: 'PATCH',
    endpoint: rolesUrl(id),
    token,
    body,
    rawPath: true,
  })
}

export async function deleteRole(token: string, id: string): Promise<void> {
  await apiRequest({
    method: 'DELETE',
    endpoint: rolesUrl(id),
    token,
    rawPath: true,
  })
}

export async function listSellers(token: string): Promise<SellerRecord[]> {
  return apiRequest({
    method: 'GET',
    endpoint: sellersUrl(),
    token,
    rawPath: true,
  })
}

export async function fetchSellersOverview(token: string): Promise<AdminSellersOverview> {
  return apiRequest({
    method: 'GET',
    endpoint: API_CONFIG.endpoints.admin.sellersOverview,
    token,
    rawPath: true,
  })
}

export async function updateSeller(
  token: string,
  id: string,
  body: { is_paid?: boolean; email?: string; full_name?: string },
): Promise<SellerRecord> {
  return apiRequest({
    method: 'PATCH',
    endpoint: sellersUrl(id),
    token,
    body,
    rawPath: true,
  })
}

export async function assignSellerToEmployee(
  token: string,
  sellerId: string,
  employeeId: string,
): Promise<SellerRecord> {
  return apiRequest({
    method: 'POST',
    endpoint: `${sellersUrl(sellerId)}/assign/${employeeId}`,
    token,
    rawPath: true,
  })
}

export async function createSeller(
  token: string,
  body: { email: string; password: string; full_name: string },
): Promise<AdminUserRecord> {
  return apiRequest({
    method: 'POST',
    endpoint: sellersUrl(),
    token,
    body,
    rawPath: true,
  })
}

export async function suspendSeller(token: string, id: string): Promise<AdminUserRecord> {
  return apiRequest({
    method: 'POST',
    endpoint: sellersUrl(id, 'suspend'),
    token,
    rawPath: true,
  })
}

export async function activateSeller(token: string, id: string): Promise<AdminUserRecord> {
  return apiRequest({
    method: 'POST',
    endpoint: sellersUrl(id, 'activate'),
    token,
    rawPath: true,
  })
}

export async function deleteSeller(token: string, id: string): Promise<void> {
  await apiRequest({
    method: 'DELETE',
    endpoint: sellersUrl(id),
    token,
    rawPath: true,
  })
}

export async function listGroups(token: string): Promise<GroupRecord[]> {
  return apiRequest({
    method: 'GET',
    endpoint: groupsUrl(),
    token,
    rawPath: true,
  })
}

export async function createGroup(
  token: string,
  body: {
    name: string
    description?: string
    employee_ids: string[]
    seller_ids: string[]
  },
): Promise<GroupRecord> {
  return apiRequest({
    method: 'POST',
    endpoint: groupsUrl(),
    token,
    body,
    rawPath: true,
  })
}

export async function deleteGroup(token: string, id: string): Promise<void> {
  await apiRequest({
    method: 'DELETE',
    endpoint: groupsUrl(id),
    token,
    rawPath: true,
  })
}
