import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ItemsPage from './pages/ItemsPage'
import RoomsPage from './pages/RoomsPage'
import LoanRequestPage from './pages/LoanRequestPage'
import LoanHistoryPage from './pages/LoanHistoryPage'
import AdminApprovalPage from './pages/AdminApprovalPage'
import CalendarPage from './pages/CalendarPage'
import ScannerPage from './pages/ScannerPage'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected (any authenticated user) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/loans" element={<LoanHistoryPage />} />
            <Route path="/loans/new" element={<LoanRequestPage />} />
          </Route>

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/loans" element={<AdminApprovalPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
          </Route>

          {/* Default redirect for 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
