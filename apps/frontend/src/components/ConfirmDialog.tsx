import React from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary' | 'warning' | 'success'
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  children?: React.ReactNode
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const btnClass = {
    danger: 'btn-danger',
    primary: 'btn-primary',
    warning: 'btn-warning',
    success: 'btn-success',
  }[variant ?? 'primary']

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box max-w-sm">
        <div className="modal-header">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="modal-body">
          <p className="text-sm text-gray-600">{message}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>
        <div className="modal-footer">
          <button
            id="confirm-cancel-btn"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-ok-btn"
            onClick={onConfirm}
            className={btnClass}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
