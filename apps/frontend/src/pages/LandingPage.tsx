import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, ScanLine, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <Zap size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SiPinjam</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button>
                  Ke Dashboard
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" className="bg-transparent border-none hover:bg-slate-100">
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button>Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50/50 px-3 py-1 text-sm text-blue-600 mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              Sistem Manajemen Peminjaman Kampus Modern
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight">
              Pinjam fasilitas kampus, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                tanpa ribet dan drama.
              </span>
            </h1>
            
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Tinggalkan formulir kertas dan jadwal bentrok. SiPinjam menghadirkan pengalaman meminjam ruangan dan alat yang transparan, cepat, dan 100% digital.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-blue-600/20 rounded-full hover:scale-105 transition-transform">
                  Mulai Sekarang
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Fitur Unggulan SiPinjam
              </h2>
              <p className="mt-4 text-lg text-slate-500">
                Dirancang khusus untuk ekosistem kampus yang dinamis.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                  <CalendarDays size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Jadwal Anti Bentrok</h3>
                <p className="text-slate-600 leading-relaxed">
                  Sistem visual kalender cerdas yang mencegah pemesanan ganda. Jika ruangan sedang dipakai, sistem otomatis memblokir jadwal tersebut.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                  <ScanLine size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">QR Code Scanner</h3>
                <p className="text-slate-600 leading-relaxed">
                  Admin dapat mengkonfirmasi pengembalian barang dalam hitungan detik hanya dengan memindai kode QR dari peramban gawai mereka.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Notifikasi Transparan</h3>
                <p className="text-slate-600 leading-relaxed">
                  Pantau status peminjaman secara *real-time*. Jika permohonan ditolak, admin wajib memberikan alasan yang jelas kepada peminjam.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
              <Zap size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SiPinjam</span>
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} SiPinjam Kampus. Didesain untuk kemudahan akademik.
          </p>
        </div>
      </footer>
    </div>
  )
}
