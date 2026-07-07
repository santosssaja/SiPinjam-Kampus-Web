import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCreateLoan } from '../hooks/useLoans'
import { useItems } from '../hooks/useItems'
import { useRooms } from '../hooks/useRooms'
import { PageLoader } from '../components/LoadingSpinner'
import { loanService } from '../services/loanService'
import { LoanCreateRequest, ResourceType } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Package, Building2, Calendar, Clock as ClockIcon, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '../lib/utils'

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
      ? (items ?? []).map((i) => ({ id: i.id, label: `${i.code} — ${i.name} (${i.quantity} tersedia)` }))
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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ajukan Peminjaman</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Isi formulir berikut untuk mengajukan peminjaman peralatan atau ruangan kampus.
        </p>
      </div>

      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <form onSubmit={handleSubmit} id="loan-request-form">
          <CardContent className="p-6 sm:p-8 space-y-8">
            
            {/* Step 1: Resource Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="text-base font-semibold text-slate-900">Pilih Jenis Aset</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 ml-8">
                {(['ITEM', 'ROOM'] as ResourceType[]).map((type) => (
                  <label 
                    key={type} 
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      form.resource_type === type 
                        ? "border-blue-500 bg-blue-50/50" 
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
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
                    {type === 'ITEM' ? <Package size={32} className={form.resource_type === type ? "text-blue-600 mb-2" : "text-slate-400 mb-2"} strokeWidth={1.5} /> : <Building2 size={32} className={form.resource_type === type ? "text-blue-600 mb-2" : "text-slate-400 mb-2"} strokeWidth={1.5} />}
                    <span className={cn("text-sm font-medium", form.resource_type === type ? "text-blue-900" : "text-slate-600")}>
                      {type === 'ITEM' ? 'Peralatan' : 'Ruangan'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Select Resource */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="text-base font-semibold text-slate-900">Pilih {form.resource_type === 'ITEM' ? 'Peralatan' : 'Ruangan'}</h3>
              </div>
              <div className="ml-8">
                <select
                  id="loan-resource"
                  required
                  className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
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
            </div>

            {/* Step 3: Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="text-base font-semibold text-slate-900">Jadwal Peminjaman</h3>
              </div>
              
              <div className="ml-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-3">
                  <label htmlFor="loan-date" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Calendar size={14} /> Tanggal
                  </label>
                  <Input
                    id="loan-date"
                    type="date"
                    required
                    min={today}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1.5 sm:col-span-1.5">
                  <label htmlFor="loan-start-time" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <ClockIcon size={14} /> Waktu Mulai
                  </label>
                  <Input
                    id="loan-start-time"
                    type="time"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1.5 sm:col-span-1.5">
                  <label htmlFor="loan-end-time" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <ClockIcon size={14} /> Waktu Selesai
                  </label>
                  <Input
                    id="loan-end-time"
                    type="time"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="ml-8 pt-2">
                <Button
                  type="button"
                  id="check-availability-btn"
                  onClick={handleCheckAvailability}
                  disabled={checkingAvail || !form.resource_id}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {checkingAvail ? 'Mengecek...' : 'Cek Ketersediaan Jadwal'}
                </Button>

                {availability && (
                  <div
                    className={cn(
                      "mt-3 p-3 rounded-xl border flex items-start gap-2.5 text-sm animate-in slide-in-from-top-2 duration-200",
                      availability.available 
                        ? "bg-green-50 border-green-200 text-green-800" 
                        : "bg-red-50 border-red-200 text-red-800"
                    )}
                  >
                    {availability.available ? (
                      <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
                    )}
                    <span className="font-medium">{availability.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Purpose */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</div>
                <h3 className="text-base font-semibold text-slate-900">Tujuan Peminjaman</h3>
              </div>
              <div className="ml-8">
                <textarea
                  id="loan-purpose"
                  required
                  rows={3}
                  className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Jelaskan tujuan peminjaman secara singkat (misal: Praktikum Jaringan Komputer Kelas A)..."
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                />
              </div>
            </div>

          </CardContent>

          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-xl">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              id="loan-submit-btn"
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="w-full sm:w-auto"
            >
              Kirim Permohonan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
