import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomService } from '../services/roomService'
import { RoomCreateRequest, RoomUpdateRequest } from '../types'

export const ROOMS_KEY = ['rooms']

export function useRooms() {
  return useQuery({
    queryKey: ROOMS_KEY,
    queryFn: () => roomService.getAll(),
  })
}

export function useRoom(id: number) {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: () => roomService.getById(id),
    enabled: !!id,
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoomCreateRequest) => roomService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROOMS_KEY }),
  })
}

export function useUpdateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoomUpdateRequest }) =>
      roomService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROOMS_KEY }),
  })
}

export function useDeleteRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => roomService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROOMS_KEY }),
  })
}
