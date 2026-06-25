import { Item, ItemCreateRequest, ItemUpdateRequest, PaginationParams } from '../types'
import apiClient from './apiClient'

export const itemService = {
  async getAll(params?: PaginationParams): Promise<Item[]> {
    const res = await apiClient.get<Item[]>('/items', { params })
    return res.data
  },

  async getById(id: number): Promise<Item> {
    const res = await apiClient.get<Item>(`/items/${id}`)
    return res.data
  },

  async create(data: ItemCreateRequest): Promise<Item> {
    const res = await apiClient.post<Item>('/items', data)
    return res.data
  },

  async update(id: number, data: ItemUpdateRequest): Promise<Item> {
    const res = await apiClient.put<Item>(`/items/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/items/${id}`)
  },
}
