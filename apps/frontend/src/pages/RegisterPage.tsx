import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'
import { RegisterRequest, UserRole } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

export default function RegisterPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    role: 'BORROWER',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setIsLoading(true)
    try {
      await authService.register(form)
      toast.success('Akun berhasil dibuat! Silakan masuk.')
      navigate('/login')
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Gagal membuat akun'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
            SP
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SiPinjam Kampus</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Buat akun baru untuk mulai meminjam
          </p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Daftar Akun</h2>

          {error && (
            <div className="alert-error mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="register-form" className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="form-label">Nama Lengkap</label>
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Nama lengkap Anda"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="form-label">Email</label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@kampus.ac.id"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="reg-role" className="form-label">Peran</label>
              <select
                id="reg-role"
                className="form-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              >
                <option value="BORROWER">Peminjam (Mahasiswa / Dosen)</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Admin dapat menyetujui dan mengelola peminjaman.
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="form-label">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Minimal 6 karakter"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="form-label">
                Konfirmasi Password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Ulangi password"
                className={`form-input ${
                  confirmPassword && confirmPassword !== form.password
                    ? 'border-red-400 focus:ring-red-400'
                    : ''
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && confirmPassword !== form.password && (
                <p className="form-error">Password tidak cocok</p>
              )}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn-primary w-full py-2.5"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Buat Akun'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Sudah punya akun?{' '}
            <Link
              to="/login"
              id="goto-login-link"
              className="text-primary-600 font-medium hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SiPinjam Kampus © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
