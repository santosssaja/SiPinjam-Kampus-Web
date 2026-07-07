import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  useLoans,
  useApproveLoan,
  useRejectLoan,
  useCompleteLoan,
} from '../hooks/useLoans'
import { PageLoader } from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Loan, LoanStatus } from '../types'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { CheckCircle2, XCircle, Clock as ClockIcon, Calendar, Activity, ScanLine } from 'lucide-react'
import { cn } from '../lib/utils'

type FilterStatus = LoanStatus | 'ALL'

const STATUS_FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Disetujui', value: 'APPROVED' },
  { label: 'Ditolak', value: 'REJECTED' },
  { label: 'Selesai', value: 'COMPLETED' },
]

interface ActionState {
  type: 'approve' | 'reject' | 'complete'
  loanId: number
}

export default function AdminApprovalPage() {
  const { data: loans, isLoading } = useLoans()
  const approveLoan = useApproveLoan()
  const rejectLoan = useRejectLoan()
  const completeLoan = useCompleteLoan()

  const [filter, setFilter] = useState<FilterStatus>('PENDING')
  const [action, setAction] = useState<ActionState | null>(null)

  const filtered = (loans ?? []).filter((l: Loan) =>
    filter === 'ALL' ? true : l.status === filter,
  )

  const getActionConfig = () => {
    if (!action) return null
    const configs = {
      approve: {
        title: 'Setujui Peminjaman',
        message: 'Peminjaman akan disetujui. Ketersediaan akan dicek ulang.',
        confirmLabel: 'Ya, Setujui',
        variant: 'success' as const,
      },
      reject: {
        title: 'Tolak Peminjaman',
        message: 'Peminjaman ini akan ditolak.',
        confirmLabel: 'Ya, Tolak',
        variant: 'danger' as const,
      },
      complete: {
        title: 'Selesaikan Peminjaman',
        message: 'Tandai peminjaman ini sebagai selesai (item dikembalikan). Denda keterlambatan (jika ada) akan dihitung.',
        confirmLabel: 'Ya, Selesaikan',
        variant: 'primary' as const,
      },
    }
    return configs[action.type]
  }

  const handleConfirm = async () => {
    if (!action) return
    try {
      if (action.type === 'approve') {
        await approveLoan.mutateAsync(action.loanId)
        toast.success('Peminjaman berhasil disetujui')
      } else if (action.type === 'reject') {
        await rejectLoan.mutateAsync(action.loanId)
        toast.success('Peminjaman berhasil ditolak')
      } else {
        await completeLoan.mutateAsync(action.loanId)
        toast.success('Peminjaman ditandai selesai')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Terjadi kesalahan')
    } finally {
      setAction(null)
    }
  }

  const isMutating =
    approveLoan.isPending || rejectLoan.isPending || completeLoan.isPending

  if (isLoading && !loans) return <PageLoader />

  const actionConfig = getActionConfig()

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kelola Peminjaman</h1>
          <p className="text-slate-500 mt-1 text-sm">Tinjau dan proses semua permintaan peminjaman.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            id={`filter-${f.value.toLowerCase()}`}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 inline-flex items-center",
              filter === f.value
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {f.label}
            <Badge 
              variant={filter === f.value ? 'default' : 'default'}
              className={cn("ml-2 px-1.5 py-0 min-w-[20px] justify-center", filter === f.value ? "bg-blue-500 text-white border-none" : "bg-slate-100 text-slate-500 border-none")}
            >
              {(loans ?? []).filter((l: Loan) => l.status === f.value).length}
            </Badge>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center text-slate-500 py-16 flex flex-col items-center">
              <Activity size={48} className="text-slate-300 mb-4" strokeWidth={1} />
              <p className="font-medium text-slate-600">Tidak ada peminjaman</p>
              <p className="text-sm mt-1">Belum ada peminjaman dengan status {STATUS_FILTERS.find(f => f.value === filter)?.label.toLowerCase()}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl w-16">ID</th>
                    <th className="px-6 py-4">Peminjam</th>
                    <th className="px-6 py-4">Aset</th>
                    <th className="px-6 py-4">Jadwal</th>
                    <th className="px-6 py-4">Tujuan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 rounded-tr-xl text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((loan: Loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{loan.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                            U
                          </div>
                          <span className="font-medium text-slate-900">User #{loan.borrower_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "inline-flex w-max items-center px-2 py-0.5 rounded text-xs font-medium",
                            loan.resource_type === 'ITEM' ? 'bg-orange-50 text-orange-700' : 'bg-teal-50 text-teal-700'
                          )}>
                            {loan.resource_type === 'ITEM' ? 'Peralatan' : 'Ruangan'}
                          </span>
                          <span className="text-slate-500 text-xs">ID: {loan.resource_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                            <Calendar size={14} className="text-slate-400" />
                            {loan.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <ClockIcon size={14} className="text-slate-400" />
                            {loan.start_time.slice(0, 5)} – {loan.end_time.slice(0, 5)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-[150px] truncate" title={loan.purpose}>
                        {loan.purpose}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {loan.status === 'PENDING' && (
                            <>
                              <Button
                                id={`approve-loan-${loan.id}`}
                                onClick={() => setAction({ type: 'approve', loanId: loan.id })}
                                variant="secondary"
                                size="sm"
                                className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-none shadow-none"
                              >
                                <CheckCircle2 size={14} className="mr-1" />
                                Setujui
                              </Button>
                              <Button
                                id={`reject-loan-${loan.id}`}
                                onClick={() => setAction({ type: 'reject', loanId: loan.id })}
                                variant="secondary"
                                size="sm"
                                className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-none shadow-none"
                              >
                                <XCircle size={14} className="mr-1" />
                                Tolak
                              </Button>
                            </>
                          )}
                          {loan.status === 'APPROVED' && (
                            <Button
                              id={`complete-loan-${loan.id}`}
                              onClick={() => setAction({ type: 'complete', loanId: loan.id })}
                              size="sm"
                            >
                              <ScanLine size={14} className="mr-1" />
                              Selesai
                            </Button>
                          )}
                          {(loan.status === 'REJECTED' || loan.status === 'COMPLETED') && (
                            <span className="text-xs text-slate-400 italic">Selesai diproses</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      {actionConfig && (
        <ConfirmDialog
          isOpen={action !== null}
          title={actionConfig.title}
          message={actionConfig.message}
          confirmLabel={actionConfig.confirmLabel}
          variant={actionConfig.variant}
          onConfirm={handleConfirm}
          onCancel={() => setAction(null)}
          isLoading={isMutating}
        />
      )}
    </div>
  )
}
