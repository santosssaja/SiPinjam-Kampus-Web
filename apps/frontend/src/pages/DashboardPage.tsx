import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLoans } from '../hooks/useLoans'
import { useItems } from '../hooks/useItems'
import { useRooms } from '../hooks/useRooms'
import { PageLoader } from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { Loan } from '../types'

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number | string
  icon: string
  color: string
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
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
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          {isAdmin
            ? 'Ringkasan sistem peminjaman kampus'
            : `Selamat datang, ${user?.name}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Peminjaman" value={totalLoans} icon="📋" color="bg-blue-50" />
        <StatCard label="Menunggu" value={pending} icon="⏳" color="bg-yellow-50" />
        <StatCard label="Disetujui" value={approved} icon="✅" color="bg-green-50" />
        {isAdmin ? (
          <>
            <StatCard label="Total Peralatan" value={items?.length ?? 0} icon="🔬" color="bg-purple-50" />
          </>
        ) : (
          <StatCard label="Selesai" value={completed} icon="🏁" color="bg-gray-50" />
        )}
      </div>

      {/* Admin extra stats */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Selesai" value={completed} icon="🏁" color="bg-gray-50" />
          <StatCard label="Total Ruangan" value={rooms?.length ?? 0} icon="🏫" color="bg-teal-50" />
          <StatCard
            label="Ditolak"
            value={loans?.filter((l) => l.status === 'REJECTED').length ?? 0}
            icon="❌"
            color="bg-red-50"
          />
          <div className="stat-card flex items-center justify-center">
            <Link to="/admin/loans" className="btn-primary btn-sm">
              Kelola Peminjaman →
            </Link>
          </div>
        </div>
      )}

      {/* Quick actions for borrower */}
      {!isAdmin && (
        <div className="card card-body mb-6 flex flex-col sm:flex-row gap-3">
          <Link to="/loans/new" id="quick-borrow-btn" className="btn-primary">
            + Ajukan Peminjaman Baru
          </Link>
          <Link to="/loans" className="btn-secondary">
            Lihat Riwayat Saya
          </Link>
        </div>
      )}

      {/* Recent loans */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Peminjaman Terbaru</h2>
          <Link to="/loans" className="text-sm text-primary-600 hover:underline">
            Lihat semua
          </Link>
        </div>
        {recentLoans.length === 0 ? (
          <div className="card-body text-center text-gray-400 py-10">
            Belum ada data peminjaman
          </div>
        ) : (
          <div className="table-container rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Jenis</th>
                  <th>Tanggal</th>
                  <th>Tujuan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((loan: Loan) => (
                  <tr key={loan.id}>
                    <td className="font-mono text-xs">#{loan.id}</td>
                    <td>
                      <span className={loan.resource_type === 'ITEM' ? 'badge-item' : 'badge-room'}>
                        {loan.resource_type === 'ITEM' ? 'Peralatan' : 'Ruangan'}
                      </span>
                    </td>
                    <td className="text-sm">{loan.date}</td>
                    <td className="text-sm max-w-[200px] truncate">{loan.purpose}</td>
                    <td><StatusBadge status={loan.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
