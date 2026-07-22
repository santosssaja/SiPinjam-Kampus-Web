import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLoans, useCancelLoan } from '../hooks/useLoans'
import { PageLoader } from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { Loan } from '../types'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Plus, History, Calendar, Clock as ClockIcon, Edit2, XCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import EditLoanModal from '../components/EditLoanModal'
import toast from 'react-hot-toast'

export default function LoanHistoryPage() {
  const { data: loans, isLoading } = useLoans()
  const cancelLoan = useCancelLoan()
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)

  const handleCancel = async (id: number) => {
    if (!window.confirm('Yakin ingin membatalkan peminjaman ini?')) return
    try {
      await cancelLoan.mutateAsync(id)
      toast.success('Peminjaman dibatalkan')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal membatalkan peminjaman')
    }
  }

  if (isLoading && !loans) return <PageLoader />

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat Peminjaman</h1>
          <p className="text-slate-500 mt-1 text-sm">Semua peminjaman yang pernah Anda ajukan.</p>
        </div>
        <Link to="/loans/new">
          <Button id="new-loan-btn" className="whitespace-nowrap">
            <Plus size={16} className="mr-2" />
            Ajukan Peminjaman
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {!loans || loans.length === 0 ? (
            <div className="text-center text-slate-500 py-16 flex flex-col items-center">
              <History size={48} className="text-slate-300 mb-4" strokeWidth={1} />
              <p className="font-medium text-slate-600">Belum ada riwayat peminjaman</p>
              <p className="text-sm mt-1 mb-6">Ajukan peminjaman pertama Anda sekarang.</p>
              <Link to="/loans/new">
                <Button variant="secondary">Mulai Peminjaman</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">ID</th>
                    <th className="px-6 py-4">Peminjaman</th>
                    <th className="px-6 py-4">Waktu</th>
                    <th className="px-6 py-4">Tujuan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Diajukan Pada</th>
                    <th className="px-6 py-4 rounded-tr-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan: Loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        #{loan.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                            loan.resource_type === 'ITEM' ? 'bg-orange-50 text-orange-700 border border-orange-200/50' : 'bg-teal-50 text-teal-700 border border-teal-200/50'
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
                      <td className="px-6 py-4 text-slate-700 max-w-[200px] truncate" title={loan.purpose}>
                        {loan.purpose}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(loan.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        {loan.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingLoan(loan)} title="Edit">
                              <Edit2 size={14} />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleCancel(loan.id)} isLoading={cancelLoan.isPending && cancelLoan.variables === loan.id} title="Batalkan">
                              <XCircle size={14} />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {editingLoan && (
        <EditLoanModal 
          loan={editingLoan} 
          isOpen={!!editingLoan} 
          onClose={() => setEditingLoan(null)} 
        />
      )}
    </div>
  )
}
