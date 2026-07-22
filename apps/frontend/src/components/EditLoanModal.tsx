import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Loan, LoanCreateRequest, ResourceType } from '../types'
import { useUpdateLoan } from '../hooks/useLoans'
import { useItems } from '../hooks/useItems'
import { useRooms } from '../hooks/useRooms'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Calendar, Clock as ClockIcon, Package, Building2 } from 'lucide-react'
import { cn } from '../lib/utils'

interface EditLoanModalProps {
  loan: Loan
  isOpen: boolean
  onClose: () => void
}

export default function EditLoanModal({ loan, isOpen, onClose }: EditLoanModalProps) {
  const { data: items } = useItems()
  const { data: rooms } = useRooms()
  const updateLoan = useUpdateLoan()

  const [form, setForm] = useState<Partial<LoanCreateRequest>>({
    resource_type: loan.resource_type,
    resource_id: loan.resource_id,
    date: loan.date,
    start_time: loan.start_time.substring(0, 5),
    end_time: loan.end_time.substring(0, 5),
    purpose: loan.purpose,
  })

  useEffect(() => {
    if (isOpen) {
      setForm({
        resource_type: loan.resource_type,
        resource_id: loan.resource_id,
        date: loan.date,
        start_time: loan.start_time.substring(0, 5),
        end_time: loan.end_time.substring(0, 5),
        purpose: loan.purpose,
      })
    }
  }, [isOpen, loan])

  if (!isOpen) return null

  const resourceOptions =
    form.resource_type === 'ITEM'
      ? (items ?? []).map((i) => ({ id: i.id, label: `${i.code} — ${i.name} (${i.quantity} tersedia)` }))
      : (rooms ?? []).map((r) => ({ id: r.id, label: `${r.code} — ${r.name} (${r.capacity} org)` }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.end_time && form.start_time && form.end_time <= form.start_time) {
      toast.error('Waktu selesai harus setelah waktu mulai')
      return
    }

    try {
      await updateLoan.mutateAsync({ id: loan.id, data: form })
      toast.success('Peminjaman berhasil diperbarui')
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal memperbarui peminjaman')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-lg">Edit Peminjaman #{loan.id}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="edit-loan-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Jenis Aset</label>
              <div className="grid grid-cols-2 gap-3">
                {(['ITEM', 'ROOM'] as ResourceType[]).map((type) => (
                  <label
                    key={type}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                      form.resource_type === type
                        ? "border-blue-500 bg-blue-50/50 text-blue-700 font-medium"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <input
                      type="radio"
                      name="resource_type"
                      value={type}
                      checked={form.resource_type === type}
                      onChange={() => setForm({ ...form, resource_type: type, resource_id: 0 })}
                      className="sr-only"
                    />
                    {type === 'ITEM' ? <Package size={16} className="mr-2" /> : <Building2 size={16} className="mr-2" />}
                    {type === 'ITEM' ? 'Peralatan' : 'Ruangan'}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Pilih Aset</label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                value={form.resource_id}
                onChange={(e) => setForm({ ...form, resource_id: parseInt(e.target.value) })}
              >
                <option value={0}>-- Pilih {form.resource_type === 'ITEM' ? 'peralatan' : 'ruangan'} --</option>
                {resourceOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Calendar size={14} /> Tanggal
                </label>
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <ClockIcon size={14} /> Mulai
                  </label>
                  <Input
                    type="time"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <ClockIcon size={14} /> Selesai
                  </label>
                  <Input
                    type="time"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tujuan Peminjaman</label>
              <textarea
                required
                rows={3}
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
          <Button form="edit-loan-form" type="submit" isLoading={updateLoan.isPending}>
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  )
}
