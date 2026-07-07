import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLoans } from '../hooks/useLoans'
import { useItems } from '../hooks/useItems'
import { useRooms } from '../hooks/useRooms'
import { PageLoader } from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { Loan } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ClipboardList, Clock, CheckCircle2, XCircle, Package, Building2, Plus, ArrowRight, Activity } from 'lucide-react'
import { cn } from '../lib/utils'

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          </div>
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bg, color)}>
            <Icon size={24} strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const { data: loans, isLoading: loansLoading } = useLoans()
  const { data: items, isLoading: itemsLoading } = useItems()
  const { data: rooms, isLoading: roomsLoading } = useRooms()

  if (loansLoading || itemsLoading || roomsLoading) return <PageLoader />

  const pending = loans?.filter((l) => l.status === 'PENDING').length ?? 0
  const approved = loans?.filter((l) => l.status === 'APPROVED').length ?? 0
  const completed = loans?.filter((l) => l.status === 'COMPLETED').length ?? 0
  const totalLoans = loans?.length ?? 0

  const recentLoans = [...(loans ?? [])].slice(0, 5)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isAdmin ? 'Ringkasan sistem peminjaman kampus' : `Selamat datang kembali, ${user?.name}`}
          </p>
        </div>
        
        {/* Quick actions for borrower */}
        {!isAdmin && (
          <div className="flex items-center gap-3">
            <Link to="/loans" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
              Riwayat Saya
            </Link>
            <Link to="/loans/new">
              <Button>
                <Plus size={16} className="mr-2" />
                Ajukan Pinjam
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Peminjaman" value={totalLoans} icon={ClipboardList} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Menunggu" value={pending} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Disetujui" value={approved} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
        
        {isAdmin ? (
          <StatCard label="Total Peralatan" value={items?.length ?? 0} icon={Package} color="text-purple-600" bg="bg-purple-50" />
        ) : (
          <StatCard label="Selesai" value={completed} icon={Activity} color="text-slate-600" bg="bg-slate-100" />
        )}
      </div>

      {/* Admin extra stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Selesai" value={completed} icon={Activity} color="text-slate-600" bg="bg-slate-100" />
          <StatCard label="Total Ruangan" value={rooms?.length ?? 0} icon={Building2} color="text-teal-600" bg="bg-teal-50" />
          <StatCard
            label="Ditolak"
            value={loans?.filter((l) => l.status === 'REJECTED').length ?? 0}
            icon={XCircle}
            color="text-red-600"
            bg="bg-red-50"
          />
          <Card className="border-none shadow-sm flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
            <CardContent className="p-6 text-center w-full">
              <Link to="/admin/loans">
                <Button variant="secondary" className="w-full text-blue-700 hover:text-blue-800">
                  Kelola Peminjaman <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent loans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <CardTitle className="text-lg">Peminjaman Terbaru</CardTitle>
          <Link to="/loans" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center">
            Lihat semua <ArrowRight size={14} className="ml-1" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentLoans.length === 0 ? (
            <div className="text-center text-slate-500 py-12 flex flex-col items-center">
              <ClipboardList size={48} className="text-slate-300 mb-4" strokeWidth={1} />
              <p>Belum ada data peminjaman</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">ID</th>
                    <th className="px-6 py-4">Jenis</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Tujuan</th>
                    <th className="px-6 py-4 rounded-tr-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLoans.map((loan: Loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">#{loan.id}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                          loan.resource_type === 'ITEM' ? 'bg-orange-50 text-orange-700 border border-orange-200/50' : 'bg-teal-50 text-teal-700 border border-teal-200/50'
                        )}>
                          {loan.resource_type === 'ITEM' ? 'Peralatan' : 'Ruangan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{loan.date}</td>
                      <td className="px-6 py-4 text-slate-700 max-w-[200px] truncate" title={loan.purpose}>{loan.purpose}</td>
                      <td className="px-6 py-4"><StatusBadge status={loan.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
