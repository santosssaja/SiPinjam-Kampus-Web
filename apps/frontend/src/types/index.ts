// -----------------------------------------------------------------------
// Enums (mirroring backend Python enums)
// -----------------------------------------------------------------------

export type UserRole = 'ADMIN' | 'BORROWER'
export type ResourceType = 'ITEM' | 'ROOM'
export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

// -----------------------------------------------------------------------
// Domain types
// -----------------------------------------------------------------------

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Item {
  id: number
  code: string
  name: string
  quantity: number
  description: string | null
  category: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface Room {
  id: number
  code: string
  name: string
  capacity: number
  description: string | null
  location: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface Loan {
  id: number
  borrower_id: number
  resource_type: ResourceType
  resource_id: number
  date: string
  start_time: string
  end_time: string
  purpose: string
  status: LoanStatus
  approved_by: number | null
  rejection_reason: string | null
  created_at: string
  updated_at: string | null
}

// -----------------------------------------------------------------------
// Request types
// -----------------------------------------------------------------------

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface ItemCreateRequest {
  code: string
  name: string
  quantity: number
  description?: string
  category?: string
  image_url?: string
}

export interface ItemUpdateRequest {
  code?: string
  name?: string
  quantity?: number
  description?: string
  category?: string
  image_url?: string
  is_active?: boolean
}

export interface RoomCreateRequest {
  code: string
  name: string
  capacity: number
  description?: string
  location?: string
  image_url?: string
}

export interface RoomUpdateRequest {
  code?: string
  name?: string
  capacity?: number
  description?: string
  location?: string
  image_url?: string
  is_active?: boolean
}

export interface LoanCreateRequest {
  resource_type: ResourceType
  resource_id: number
  date: string
  start_time: string
  end_time: string
  purpose: string
}

// -----------------------------------------------------------------------
// Response types
// -----------------------------------------------------------------------

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface AvailabilityResponse {
  available: boolean
  conflicts: number
  message: string
}

// -----------------------------------------------------------------------
// Pagination
// -----------------------------------------------------------------------

export interface PaginationParams {
  skip?: number
  limit?: number
  search?: string
}
