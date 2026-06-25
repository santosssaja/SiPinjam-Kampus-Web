/**
 * Shared domain types for SiPinjam Kampus.
 * Used across frontend and any future TypeScript packages.
 */

export type UserRole = 'ADMIN' | 'BORROWER'
export type ResourceType = 'ITEM' | 'ROOM'
export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

export interface BaseEntity {
  id: number
  created_at: string
}

export interface User extends BaseEntity {
  name: string
  email: string
  role: UserRole
  is_active: boolean
}

export interface Item extends BaseEntity {
  code: string
  name: string
  quantity: number
  description: string | null
  is_active: boolean
}

export interface Room extends BaseEntity {
  code: string
  name: string
  capacity: number
  description: string | null
  is_active: boolean
}

export interface Loan extends BaseEntity {
  borrower_id: number
  resource_type: ResourceType
  resource_id: number
  date: string
  start_time: string
  end_time: string
  purpose: string
  status: LoanStatus
  approved_by: number | null
  updated_at: string | null
}
