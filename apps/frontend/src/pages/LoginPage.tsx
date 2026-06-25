import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'
import { LoginRequest } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await authService.login(form)
      login(res.access_token, res.user)
      toast.success(`Selamat datang, ${res.user.name}!`)
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Email atau password salah'
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
            Sistem Manajemen Peminjaman Peralatan & Ruangan
          </p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Masuk ke Akun</h2>

          {error && (
            <div className="alert-error mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="login-form" className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@kampus.ac.id"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary w-full py-2.5"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Masuk'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Belum punya akun?{' '}
            <Link
              to="/register"
              id="goto-register-link"
              className="text-primary-600 font-medium hover:underline"
            >
              Daftar sekarang
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
