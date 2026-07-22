import { Category, CategoryCreateRequest } from '../types'
import apiClient from './apiClient'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await apiClient.get<Category[]>('/categories')
    return res.data
  },

  async create(data: CategoryCreateRequest): Promise<Category> {
    const res = await apiClient.post<Category>('/categories', data)
    return res.data
  },
}
