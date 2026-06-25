import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCreateLoan } from '../hooks/useLoans'
import { useItems } from '../hooks/useItems'
import { useRooms } from '../hooks/useRooms'
import { PageLoader } from '../components/LoadingSpinner'
import { loanService } from '../services/loanService'
import { LoanCreateRequest, ResourceType } from '../types'

export default function LoanRequestPage() {
  const navigate = useNavigate()
  const createLoan = useCreateLoan()
  const { data: items, isLoading: itemsLoading } = useItems()
  const { data: rooms, isLoading: roomsLoading } = useRooms()

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<LoanCreateRequest>({
    resource_type: 'ITEM',
    resource_id: 0,
    date: today,
    start_time: '08:00',
    end_time: '10:00',
    purpose: '',
  })

  const [availability, setAvailability] = useState<{
    available: boolean
    message: string
    checked: boolean
  } | null>(null)

  const [checkingAvail, setCheckingAvail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (itemsLoading || roomsLoading) return <PageLoader />

  const resourceOptions =
    form.resource_type === 'ITEM'
      ? (items ?? []).map((i) => ({ id: i.id, label: `${i.code} — ${i.name} (${i.quantity} unit)` }))
      : (rooms ?? []).map((r) => ({ id: r.id, label: `${r.code} — ${r.name} (${r.capacity} org)` }))

  const handleCheckAvailability = async () => {
    if (!form.resource_id || !form.date || !form.start_time || !form.end_time) {
      toast.error('Lengkapi data terlebih dahulu')
      return
    }
    setCheckingAvail(true)
    setAvailability(null)
    try {
      const res = await loanService.checkAvailability({
        resource_type: form.resource_type,
        resource_id: form.resource_id,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
      })
      setAvailability({ available: res.available, message: res.message, checked: true })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal mengecek ketersediaan')
    } finally {
      setCheckingAvail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.resource_id) {
      toast.error('Pilih sumber daya yang ingin dipinjam')
      return
    }
    if (form.end_time <= form.start_time) {
      toast.error('Waktu selesai harus setelah waktu mulai')
      return
    }

    setIsSubmitting(true)
    try {
      await createLoan.mutateAsync(form)
      toast.success('Permintaan peminjaman berhasil dikirim!')
      navigate('/loans')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal mengajukan peminjaman')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Ajukan Peminjaman</h1>
        <p className="page-subtitle">
          Isi formulir berikut untuk mengajukan peminjaman peralatan atau ruangan
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} id="loan-request-form">
          <div className="card-body space-y-5">
            {/* Resource type */}
            <div>
              <label className="form-label">Jenis Sumber Daya</label>
              <div className="flex gap-3">
                {(['ITEM', 'ROOM'] as ResourceType[]).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resource_type"
                      value={type}
                      checked={form.resource_type === type}
                      onChange={() =>
                        setForm({ ...form, resource_type: type, resource_id: 0 })
                      }
                      className="text-primary-600"
                    />
                    <span className="text-sm font-medium">
                      {type === 'ITEM' ? '🔬 Peralatan' : '🏫 Ruangan'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Resource select */}
            <div>
              <label htmlFor="loan-resource" className="form-label">
                {form.resource_type === 'ITEM' ? 'Peralatan' : 'Ruangan'}
              </label>
              <select
                id="loan-resource"
                required
                className="form-select"
                value={form.resource_id}
                onChange={(e) =>
                  setForm({ ...form, resource_id: parseInt(e.target.value), })
                }
              >
                <option value={0}>Pilih {form.resource_type === 'ITEM' ? 'peralatan' : 'ruangan'}...</option>
                {resourceOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="loan-date" className="form-label">Tanggal</label>
              <input
                id="loan-date"
                type="date"
                required
                className="form-input"
                min={today}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="loan-start-time" className="form-label">Waktu Mulai</label>
                <input
                  id="loan-start-time"
                  type="time"
                  required
                  className="form-input"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="loan-end-time" className="form-label">Waktu Selesai</label>
                <input
                  id="loan-end-time"
                  type="time"
                  required
                  className="form-input"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>

            {/* Availability check */}
            <div>
              <button
                type="button"
                id="check-availability-btn"
                onClick={handleCheckAvailability}
                disabled={checkingAvail || !form.resource_id}
                className="btn-secondary btn-sm"
              >
                {checkingAvail ? 'Mengecek...' : '🔍 Cek Ketersediaan'}
              </button>
              {availability && (
                <div
                  className={`mt-2 alert ${availability.available ? 'alert-success' : 'alert-error'
                    }`}
                >
                  {availability.available ? '✅ ' : '❌ '}
                  {availability.message}
                </div>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label htmlFor="loan-purpose" className="form-label">Tujuan Peminjaman</label>
              <textarea
                id="loan-purpose"
                required
                rows={3}
                className="form-textarea"
                placeholder="Jelaskan tujuan peminjaman secara singkat..."
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button
              id="loan-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Permohonan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
