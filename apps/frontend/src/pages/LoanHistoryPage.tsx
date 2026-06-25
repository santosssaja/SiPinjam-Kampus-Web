import { Link } from 'react-router-dom'
import { useLoans } from '../hooks/useLoans'
import { PageLoader } from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { Loan } from '../types'

export default function LoanHistoryPage() {
  const { data: loans, isLoading } = useLoans()

  if (isLoading) return <PageLoader />

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Riwayat Peminjaman</h1>
          <p className="page-subtitle">Semua peminjaman yang pernah Anda ajukan</p>
        </div>
        <Link to="/loans/new" id="new-loan-btn" className="btn-primary">
          + Ajukan Baru
        </Link>
      </div>

      <div className="card">
        {!loans || loans.length === 0 ? (
          <div className="card-body text-center text-gray-400 py-12">
            <p className="text-2xl mb-3">📋</p>
            <p>Belum ada riwayat peminjaman</p>
            <Link to="/loans/new" className="btn-primary btn-sm mt-4 inline-flex">
              Ajukan Peminjaman Pertama
            </Link>
          </div>
        ) : (
          <div className="table-container rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jenis</th>
                  <th>ID Sumber</th>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Tujuan</th>
                  <th>Status</th>
                  <th>Diajukan</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan: Loan) => (
                  <tr key={loan.id}>
                    <td className="font-mono text-xs text-gray-400">#{loan.id}</td>
                    <td>
                      <span className={loan.resource_type === 'ITEM' ? 'badge-item' : 'badge-room'}>
                        {loan.resource_type === 'ITEM' ? 'Peralatan' : 'Ruangan'}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">{loan.resource_id}</td>
                    <td className="text-sm">{loan.date}</td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">
                      {loan.start_time.slice(0, 5)} – {loan.end_time.slice(0, 5)}
                    </td>
                    <td className="text-sm max-w-[180px] truncate">{loan.purpose}</td>
                    <td><StatusBadge status={loan.status} /></td>
                    <td className="text-xs text-gray-400">
                      {new Date(loan.created_at).toLocaleDateString('id-ID')}
                    </td>
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
