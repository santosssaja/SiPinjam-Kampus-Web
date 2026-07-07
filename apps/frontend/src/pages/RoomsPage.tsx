import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from '../hooks/useRooms'
import { PageLoader } from '../components/LoadingSpinner'
import { uploadService } from '../services/uploadService'
import ConfirmDialog from '../components/ConfirmDialog'
import { Room, RoomCreateRequest, RoomUpdateRequest } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Plus, Edit2, Trash2, Building2, Image as ImageIcon } from 'lucide-react'
import { cn } from '../lib/utils'

function RoomModal({
  room,
  onClose,
  onSubmit,
  isLoading,
}: {
  room?: Room | null
  onClose: () => void
  onSubmit: (data: RoomCreateRequest | RoomUpdateRequest) => void
  isLoading: boolean
}) {
  const [form, setForm] = useState({
    code: room?.code ?? '',
    name: room?.name ?? '',
    capacity: room?.capacity ?? 1,
    description: room?.description ?? '',
    location: room?.location ?? '',
    image_url: room?.image_url ?? '',
  })

  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const url = await uploadService.uploadImage(file)
      setForm(prev => ({ ...prev, image_url: url }))
      toast.success('Gambar berhasil diunggah')
    } catch (err: any) {
      toast.error('Gagal mengunggah gambar')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      description: form.description || undefined,
      location: form.location || undefined,
      image_url: form.image_url || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-lg">
            {room ? 'Edit Ruangan' : 'Tambah Ruangan'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="room-code" className="text-sm font-medium text-slate-700">Kode Ruangan</label>
                <Input
                  id="room-code"
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="R101"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="room-capacity" className="text-sm font-medium text-slate-700">Kapasitas (orang)</label>
                <Input
                  id="room-capacity"
                  type="number"
                  required
                  min={1}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="room-name" className="text-sm font-medium text-slate-700">Nama Ruangan</label>
              <Input
                id="room-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Laboratorium Komputer A"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="room-location" className="text-sm font-medium text-slate-700">Lokasi</label>
              <Input
                id="room-location"
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Gedung Utama Lt. 1"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Gambar Ruangan</label>
              <div className="flex gap-2 items-center">
                <Input
                  id="room-image"
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/room.jpg"
                  className="flex-1"
                />
                <span className="text-sm text-slate-500">atau</span>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button type="button" variant="secondary" disabled={uploading}>
                    {uploading ? 'Mengunggah...' : 'Pilih File'}
                  </Button>
                </div>
              </div>
              {form.image_url && (
                <div className="mt-2 h-24 w-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="room-description" className="text-sm font-medium text-slate-700">
                Deskripsi / Fasilitas
              </label>
              <textarea
                id="room-description"
                rows={3}
                className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Fasilitas yang tersedia..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button
              id="room-submit-btn"
              type="submit"
              isLoading={isLoading}
            >
              {room ? 'Simpan Perubahan' : 'Tambah Ruangan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RoomsPage() {
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const { data: rooms, isLoading } = useRooms()
  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom()
  const deleteRoom = useDeleteRoom()

  const [modalRoom, setModalRoom] = useState<Room | null | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const openCreate = () => setModalRoom(null)
  const openEdit = (room: Room) => setModalRoom(room)
  const closeModal = () => setModalRoom(undefined)

  const handleSubmit = async (data: RoomCreateRequest | RoomUpdateRequest) => {
    try {
      if (modalRoom) {
        await updateRoom.mutateAsync({ id: modalRoom.id, data })
        toast.success('Ruangan berhasil diperbarui')
      } else {
        await createRoom.mutateAsync(data as RoomCreateRequest)
        toast.success('Ruangan berhasil ditambahkan')
      }
      closeModal()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Terjadi kesalahan')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteRoom.mutateAsync(deleteId)
      toast.success('Ruangan berhasil dihapus')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal menghapus')
    } finally {
      setDeleteId(null)
    }
  }

  // Filter local for rooms since there are usually fewer rooms
  const filteredRooms = rooms?.filter(room => 
    room.name.toLowerCase().includes(search.toLowerCase()) || 
    room.code.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading && !rooms) return <PageLoader />

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ruangan Kampus</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola ruangan yang tersedia untuk dipinjam.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            placeholder="Cari ruangan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          {isAdmin && (
            <Button id="add-room-btn" onClick={openCreate} className="whitespace-nowrap">
              <Plus size={16} className="mr-2" />
              Tambah Ruangan
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {!filteredRooms || filteredRooms.length === 0 ? (
            <div className="text-center text-slate-500 py-16 flex flex-col items-center">
              <Building2 size={48} className="text-slate-300 mb-4" strokeWidth={1} />
              <p className="font-medium text-slate-600">Ruangan tidak ditemukan</p>
              <p className="text-sm mt-1">Coba sesuaikan pencarian Anda atau tambah ruangan baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl w-16">Foto</th>
                    <th className="px-6 py-4">Kode</th>
                    <th className="px-6 py-4">Nama Ruangan</th>
                    <th className="px-6 py-4">Lokasi</th>
                    <th className="px-6 py-4">Kapasitas</th>
                    {isAdmin && <th className="px-6 py-4 rounded-tr-xl text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {room.image_url ? (
                            <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={18} className="text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200/60">
                          {room.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{room.name}</p>
                        <p className="text-xs text-slate-500 max-w-[200px] truncate mt-0.5" title={room.description || ''}>
                          {room.description ?? 'Tidak ada deskripsi'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {room.location ? (
                          <span className="text-slate-700">{room.location}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{room.capacity} orang</Badge>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              id={`edit-room-${room.id}`}
                              onClick={() => openEdit(room)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              id={`delete-room-${room.id}`}
                              onClick={() => setDeleteId(room.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {modalRoom !== undefined && (
        <RoomModal
          room={modalRoom}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isLoading={createRoom.isPending || updateRoom.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Hapus Ruangan"
        message="Ruangan akan dinonaktifkan. Histori peminjaman tetap tersimpan."
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteRoom.isPending}
      />
    </div>
  )
}
