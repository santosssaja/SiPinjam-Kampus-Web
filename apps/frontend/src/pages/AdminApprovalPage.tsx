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
        message: 'Tandai peminjaman ini sebagai selesai (item dikembalikan).',
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

  if (isLoading) return <PageLoader />

  const actionConfig = getActionConfig()

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kelola Peminjaman</h1>
        <p className="page-subtitle">Tinjau dan proses semua permintaan peminjaman</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            id={`filter-${f.value.toLowerCase()}`}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
            {f.value !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({(loans ?? []).filter((l: Loan) => l.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="card-body text-center text-gray-400 py-12">
            Tidak ada peminjaman dengan status ini
          </div>
        ) : (
          <div className="table-container rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Peminjam</th>
                  <th>Jenis</th>
                  <th>Sumber ID</th>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Tujuan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((loan: Loan) => (
                  <tr key={loan.id}>
                    <td className="font-mono text-xs text-gray-400">#{loan.id}</td>
                    <td className="text-sm">User #{loan.borrower_id}</td>
                    <td>
                      <span
                        className={
                          loan.resource_type === 'ITEM' ? 'badge-item' : 'badge-room'
                        }
                      >
                        {loan.resource_type === 'ITEM' ? 'Peralatan' : 'Ruangan'}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">#{loan.resource_id}</td>
                    <td className="text-sm">{loan.date}</td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">
                      {loan.start_time.slice(0, 5)} – {loan.end_time.slice(0, 5)}
                    </td>
                    <td className="text-sm max-w-[150px] truncate">{loan.purpose}</td>
                    <td>
                      <StatusBadge status={loan.status} />
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {loan.status === 'PENDING' && (
                          <>
                            <button
                              id={`approve-loan-${loan.id}`}
                              onClick={() =>
                                setAction({ type: 'approve', loanId: loan.id })
                              }
                              className="btn-success btn-sm"
                            >
                              Setujui
                            </button>
                            <button
                              id={`reject-loan-${loan.id}`}
                              onClick={() =>
                                setAction({ type: 'reject', loanId: loan.id })
                              }
                              className="btn-danger btn-sm"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        {loan.status === 'APPROVED' && (
                          <button
                            id={`complete-loan-${loan.id}`}
                            onClick={() =>
                              setAction({ type: 'complete', loanId: loan.id })
                            }
                            className="btn-primary btn-sm"
                          >
                            Selesai
                          </button>
                        )}
                        {(loan.status === 'REJECTED' ||
                          loan.status === 'COMPLETED') && (
                          <span className="text-xs text-gray-400 italic">Selesai diproses</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
