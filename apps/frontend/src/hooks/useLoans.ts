import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { loanService } from '../services/loanService'
import { LoanCreateRequest } from '../types'

export const LOANS_KEY = ['loans']

export function useLoans() {
  return useQuery({
    queryKey: LOANS_KEY,
    queryFn: () => loanService.getAll(),
  })
}

export function useLoan(id: number) {
  return useQuery({
    queryKey: ['loans', id],
    queryFn: () => loanService.getById(id),
    enabled: !!id,
  })
}

export function useCreateLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LoanCreateRequest) => loanService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOANS_KEY }),
  })
}

export function useApproveLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => loanService.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOANS_KEY }),
  })
}

export function useRejectLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => loanService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
  })
}

export function useCompleteLoan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => loanService.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOANS_KEY }),
  })
}
