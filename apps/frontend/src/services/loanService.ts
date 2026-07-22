import {
  AvailabilityResponse,
  Loan,
  LoanCreateRequest,
  PaginationParams,
  ResourceType,
} from '../types'
import apiClient from './apiClient'

export const loanService = {
  async getAll(params?: PaginationParams): Promise<Loan[]> {
    const res = await apiClient.get<Loan[]>('/loans', { params })
    return res.data
  },

  async getById(id: number): Promise<Loan> {
    const res = await apiClient.get<Loan>(`/loans/${id}`)
    return res.data
  },

  async create(data: LoanCreateRequest): Promise<Loan> {
    const res = await apiClient.post<Loan>('/loans', data)
    return res.data
  },

  async update(id: number, data: Partial<LoanCreateRequest>): Promise<Loan> {
    const res = await apiClient.put<Loan>(`/loans/${id}`, data)
    return res.data
  },

  async cancel(id: number): Promise<Loan> {
    const res = await apiClient.post<Loan>(`/loans/${id}/cancel`)
    return res.data
  },

  async approve(id: number): Promise<Loan> {
    const res = await apiClient.post<Loan>(`/loans/${id}/approve`)
    return res.data
  },

  async reject(id: number, rejection_reason: string): Promise<Loan> {
    const res = await apiClient.post<Loan>(`/loans/${id}/reject`, { rejection_reason })
    return res.data
  },

  async complete(id: number): Promise<Loan> {
    const res = await apiClient.post<Loan>(`/loans/${id}/complete`)
    return res.data
  },

  async checkAvailability(params: {
    resource_type: ResourceType
    resource_id: number
    date: string
    start_time: string
    end_time: string
  }): Promise<AvailabilityResponse> {
    const res = await apiClient.get<AvailabilityResponse>('/loans/availability', {
      params,
    })
    return res.data
  },
}
