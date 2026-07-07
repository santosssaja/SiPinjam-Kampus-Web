import { LoanStatus } from '../types'
import { Badge } from './ui/Badge'

const STATUS_CONFIG: Record<LoanStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  PENDING: { label: 'Menunggu', variant: 'warning' },
  APPROVED: { label: 'Disetujui', variant: 'success' },
  REJECTED: { label: 'Ditolak', variant: 'danger' },
  COMPLETED: { label: 'Selesai', variant: 'default' },
}

export default function StatusBadge({ status }: { status: LoanStatus }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'default' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
