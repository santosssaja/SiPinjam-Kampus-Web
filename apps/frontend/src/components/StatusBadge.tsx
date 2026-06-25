import { LoanStatus } from '../types'

const STATUS_CONFIG: Record<LoanStatus, { label: string; className: string }> = {
  PENDING: { label: 'Menunggu', className: 'badge-pending' },
  APPROVED: { label: 'Disetujui', className: 'badge-approved' },
  REJECTED: { label: 'Ditolak', className: 'badge-rejected' },
  COMPLETED: { label: 'Selesai', className: 'badge-completed' },
}

export default function StatusBadge({ status }: { status: LoanStatus }) {
  const config = STATUS_CONFIG[status]
  return <span className={config.className}>{config.label}</span>
}
