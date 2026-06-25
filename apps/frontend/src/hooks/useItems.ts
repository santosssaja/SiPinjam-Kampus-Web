import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemService } from '../services/itemService'
import { ItemCreateRequest, ItemUpdateRequest } from '../types'

export const ITEMS_KEY = ['items']

export function useItems() {
  return useQuery({
    queryKey: ITEMS_KEY,
    queryFn: () => itemService.getAll(),
  })
}

export function useItem(id: number) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemService.getById(id),
    enabled: !!id,
  })
}

export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ItemCreateRequest) => itemService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEMS_KEY }),
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemUpdateRequest }) =>
      itemService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEMS_KEY }),
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => itemService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEMS_KEY }),
  })
}
