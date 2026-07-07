import React, { useMemo } from 'react'
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { id } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { useLoans } from '../hooks/useLoans'
import { PageLoader } from '../components/LoadingSpinner'
import { Loan } from '../types'
import { Badge } from '../components/ui/Badge'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { cn } from '../lib/utils'

const locales = {
  'id': id,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const CustomEvent = ({ event }: { event: any }) => (
  <div className="flex flex-col h-full text-xs p-1">
    <div className="font-semibold truncate">{event.title}</div>
    <div className="truncate opacity-90">{event.resource}</div>
  </div>
)

export default function CalendarPage() {
  const { data: loans, isLoading } = useLoans()
  const [view, setView] = React.useState<View>(Views.MONTH)
  const [date, setDate] = React.useState(new Date())

  const events = useMemo(() => {
    if (!loans) return []
    return loans.map((loan: Loan) => {
      const [year, month, day] = loan.date.split('-').map(Number)
      const [startHour, startMin] = loan.start_time.split(':').map(Number)
      const [endHour, endMin] = loan.end_time.split(':').map(Number)
      
      return {
        id: loan.id,
        title: loan.purpose || 'Peminjaman',
        start: new Date(year, month - 1, day, startHour, startMin),
        end: new Date(year, month - 1, day, endHour, endMin),
        resource: loan.resource_type === 'ITEM' ? `Item #${loan.resource_id}` : `Ruangan #${loan.resource_id}`,
        status: loan.status,
        type: loan.resource_type,
      }
    })
  }, [loans])

  const eventPropGetter = (event: any) => {
    let backgroundColor = '#3b82f6' // default blue
    let borderColor = '#2563eb'
    
    if (event.status === 'PENDING') {
      backgroundColor = '#f59e0b'
      borderColor = '#d97706'
    } else if (event.status === 'APPROVED') {
      backgroundColor = '#10b981'
      borderColor = '#059669'
    } else if (event.status === 'REJECTED') {
      backgroundColor = '#ef4444'
      borderColor = '#dc2626'
    } else if (event.status === 'COMPLETED') {
      backgroundColor = '#64748b'
      borderColor = '#475569'
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: '#fff',
        borderRadius: '6px',
        border: '1px solid',
        display: 'block',
      },
    }
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kalender Reservasi</h1>
          <p className="text-slate-500 mt-1 text-sm">Lihat jadwal ketersediaan ruangan dan peralatan.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="warning" className="text-xs">Menunggu</Badge>
          <Badge variant="success" className="text-xs">Disetujui</Badge>
          <Badge variant="default" className="text-xs bg-slate-500 hover:bg-slate-600 border-none text-white">Selesai</Badge>
        </div>
      </div>
      
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 sm:p-6">
          {/* We need to add global styles for calendar to look good, but for now we use inline/tailwind as much as possible */}
          <div className="h-[70vh] min-h-[600px] calendar-wrapper">
            <style>{`
              .calendar-wrapper .rbc-toolbar button {
                color: #475569;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 6px 16px;
                font-weight: 500;
                transition: all 0.2s;
              }
              .calendar-wrapper .rbc-toolbar button:hover {
                background-color: #f8fafc;
                color: #0f172a;
              }
              .calendar-wrapper .rbc-toolbar button.rbc-active {
                background-color: #eff6ff;
                color: #2563eb;
                border-color: #bfdbfe;
                box-shadow: none;
              }
              .calendar-wrapper .rbc-toolbar button:focus {
                outline: none;
              }
              .calendar-wrapper .rbc-header {
                padding: 10px 0;
                font-weight: 600;
                color: #475569;
                text-transform: uppercase;
                font-size: 0.75rem;
                border-bottom: 1px solid #e2e8f0;
              }
              .calendar-wrapper .rbc-month-view, 
              .calendar-wrapper .rbc-time-view {
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
                background: white;
              }
              .calendar-wrapper .rbc-today {
                background-color: #f8fafc;
              }
              .calendar-wrapper .rbc-event {
                padding: 2px 4px;
              }
              .calendar-wrapper .rbc-day-bg + .rbc-day-bg {
                border-left: 1px solid #f1f5f9;
              }
              .calendar-wrapper .rbc-month-row + .rbc-month-row {
                border-top: 1px solid #f1f5f9;
              }
            `}</style>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              culture="id"
              view={view}
              onView={(newView) => setView(newView)}
              date={date}
              onNavigate={(newDate) => setDate(newDate)}
              eventPropGetter={eventPropGetter}
              components={{
                event: CustomEvent,
              }}
              messages={{
                next: "Selanjutnya",
                previous: "Sebelumnya",
                today: "Hari Ini",
                month: "Bulan",
                week: "Minggu",
                day: "Hari",
                agenda: "Agenda",
                date: "Tanggal",
                time: "Waktu",
                event: "Peminjaman",
                noEventsInRange: "Tidak ada peminjaman di rentang waktu ini.",
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
