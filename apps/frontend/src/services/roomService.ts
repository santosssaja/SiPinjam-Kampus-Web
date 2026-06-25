import { Room, RoomCreateRequest, RoomUpdateRequest, PaginationParams } from '../types'
import apiClient from './apiClient'

export const roomService = {
  async getAll(params?: PaginationParams): Promise<Room[]> {
    const res = await apiClient.get<Room[]>('/rooms', { params })
    return res.data
  },

  async getById(id: number): Promise<Room> {
    const res = await apiClient.get<Room>(`/rooms/${id}`)
    return res.data
  },

  async create(data: RoomCreateRequest): Promise<Room> {
    const res = await apiClient.post<Room>('/rooms', data)
    return res.data
  },

  async update(id: number, data: RoomUpdateRequest): Promise<Room> {
    const res = await apiClient.put<Room>(`/rooms/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/rooms/${id}`)
  },
}
