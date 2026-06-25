import { LoanStatus } from '@sipinjam/shared-types'

/**
 * Format a date string (YYYY-MM-DD) to Indonesian locale.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format a time string (HH:mm:ss or HH:mm) to HH:mm.
 */
export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

/**
 * Format a date-time string to Indonesian locale.
 */
export function formatDateTime(datetimeStr: string): string {
  return new Date(datetimeStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get a human-readable label for a LoanStatus value.
 */
export function getLoanStatusLabel(status: LoanStatus): string {
  const labels: Record<LoanStatus, string> = {
    PENDING: 'Menunggu Persetujuan',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    COMPLETED: 'Selesai',
  }
  return labels[status]
}

/**
 * Check if a time window overlaps with another.
 * Uses the standard interval overlap formula: A.start < B.end AND A.end > B.start
 */
export function hasTimeOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && aEnd > bStart
}

/**
 * Validate that end time is strictly after start time.
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  return endTime > startTime
}

/**
 * Generate initials from a full name (up to 2 chars).
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export * from '@sipinjam/shared-types'
