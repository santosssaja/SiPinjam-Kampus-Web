import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ScanLine, Search, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLoans, useCompleteLoan } from '../hooks/useLoans'
import toast from 'react-hot-toast'
import { Loan } from '../types'

export default function ScannerPage() {
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const navigate = useNavigate()
  
  const { data: loans } = useLoans()
  const completeLoan = useCompleteLoan()

  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    )

    scannerRef.current = scanner

    scanner.render((decodedText) => {
      setScannedResult(decodedText)
      handleProcessQR(decodedText)
      // Optional: pause scanner after successful read
      scanner.pause(true)
    }, (error) => {
      // ignore errors (happens when no qr code is visible)
    })

    return () => {
      scanner.clear().catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleProcessQR = (text: string) => {
    // Expecting QR code to be a JSON string or a loan ID
    let loanId = -1
    try {
      // If it's a URL or text with ID
      if (text.includes('loan_id=')) {
        loanId = parseInt(text.split('loan_id=')[1])
      } else {
        // Just a number
        loanId = parseInt(text)
      }
    } catch (e) {
      toast.error('Format QR Code tidak dikenali')
      resumeScanner()
      return
    }

    if (isNaN(loanId) || loanId <= 0) {
      toast.error('Format QR Code tidak valid')
      resumeScanner()
      return
    }

    processLoan(loanId)
  }

  const processLoan = async (loanId: number) => {
    if (!loans) return
    const loan = loans.find((l: Loan) => l.id === loanId)
    
    if (!loan) {
      toast.error(`Peminjaman dengan ID #${loanId} tidak ditemukan`)
      resumeScanner()
      return
    }

    if (loan.status === 'COMPLETED') {
      toast.success(`Peminjaman #${loanId} sudah selesai`)
      resumeScanner()
      return
    }

    if (loan.status !== 'APPROVED') {
      toast.error(`Peminjaman #${loanId} belum disetujui (Status: ${loan.status})`)
      resumeScanner()
      return
    }

    try {
      await completeLoan.mutateAsync(loanId)
      toast.success(`Berhasil memproses pengembalian peminjaman #${loanId}`)
      setTimeout(() => {
        resumeScanner()
      }, 3000)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal memproses peminjaman')
      resumeScanner()
    }
  }

  const resumeScanner = () => {
    setScannedResult(null)
    if (scannerRef.current) {
      scannerRef.current.resume()
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode) return
    handleProcessQR(manualCode)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">QR Scanner</h1>
          <p className="text-slate-500 mt-1 text-sm">Pindai QR Code peminjaman untuk proses penyelesaian (pengembalian).</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-0">
            {scannedResult ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
                <CheckCircle2 size={64} className="text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">QR Code Terbaca!</h3>
                <p className="text-slate-500 mb-6 break-all max-w-[250px] truncate">{scannedResult}</p>
                <Button onClick={resumeScanner}>Pindai Lagi</Button>
              </div>
            ) : (
              <div>
                {/* Global styles overrides for html5-qrcode */}
                <style>{`
                  #reader {
                    border: none !important;
                    width: 100% !important;
                  }
                  #reader__scan_region {
                    background: #f8fafc;
                  }
                  #reader__dashboard_section_csr button {
                    background-color: #2563eb !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 6px !important;
                    padding: 8px 16px !important;
                    font-weight: 500 !important;
                    cursor: pointer;
                    transition: background-color 0.2s;
                  }
                  #reader__dashboard_section_csr button:hover {
                    background-color: #1d4ed8 !important;
                  }
                  #reader a {
                    color: #2563eb !important;
                  }
                `}</style>
                <div id="reader" className="w-full"></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 h-fit">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <Search size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Input Manual</h3>
                <p className="text-sm text-slate-500">Masukkan ID peminjaman jika kamera bermasalah</p>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="manual-code" className="text-sm font-medium text-slate-700 block mb-1.5">ID Peminjaman</label>
                <Input
                  id="manual-code"
                  type="text"
                  placeholder="Contoh: 12"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">Proses Peminjaman</Button>
            </form>

            <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-medium text-slate-900 text-sm mb-2">Petunjuk Penggunaan:</h4>
              <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4">
                <li>Berikan izin akses kamera saat diminta.</li>
                <li>Arahkan QR Code yang ada di detail peminjaman pengguna ke kamera.</li>
                <li>Sistem akan memproses pengembalian secara otomatis (menjadi status <strong>SELESAI</strong>).</li>
                <li>Denda akan dihitung secara otomatis jika terlambat.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
