import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LayoutDashboard, Package, Building2, Calendar, ClipboardList, Clock, Settings, LogOut, Menu, X, ScanLine } from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'BORROWER'] },
  { to: '/items', label: 'Katalog Peralatan', icon: Package, roles: ['ADMIN', 'BORROWER'] },
  { to: '/rooms', label: 'Ruangan', icon: Building2, roles: ['ADMIN', 'BORROWER'] },
  { to: '/calendar', label: 'Kalender', icon: Calendar, roles: ['ADMIN', 'BORROWER'] },
  { to: '/loans/new', label: 'Ajukan Pinjam', icon: ClipboardList, roles: ['BORROWER'] },
  { to: '/loans', label: 'Riwayat Pinjam', icon: Clock, roles: ['ADMIN', 'BORROWER'] },
  { to: '/scanner', label: 'QR Scanner', icon: ScanLine, roles: ['ADMIN'] },
  { to: '/admin/loans', label: 'Kelola Peminjaman', icon: Settings, roles: ['ADMIN'] },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.role ?? ''),
  )

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50",
          "w-64 bg-white border-r border-slate-200 flex flex-col",
          "transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-600/20">
              SP
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm tracking-tight leading-none">SiPinjam</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Kampus</div>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          {filteredNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={cn("transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              isAdmin ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-blue-100 text-blue-800 border border-blue-200"
            )}>
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              id="logout-btn"
              className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar (Mobile only for cleaner desktop look) */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="font-semibold text-slate-900 text-sm">SiPinjam</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
