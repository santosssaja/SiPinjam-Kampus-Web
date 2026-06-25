import { LoginRequest, RegisterRequest, TokenResponse, User } from '../types'
import apiClient from './apiClient'

export const authService = {
  async register(data: RegisterRequest): Promise<User> {
    const res = await apiClient.post<User>('/auth/register', data)
    return res.data
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>('/auth/login', data)
    return res.data
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me')
    return res.data
  },
}
