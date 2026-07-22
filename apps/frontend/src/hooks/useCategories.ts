import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '../services/categoryService'
import { CategoryCreateRequest } from '../types'

export const CATEGORIES_KEY = ['categories']

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => categoryService.getAll(),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryCreateRequest) => categoryService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  })
}
