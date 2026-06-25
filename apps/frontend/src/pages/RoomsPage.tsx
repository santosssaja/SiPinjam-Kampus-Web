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
import ConfirmDialog from '../components/ConfirmDialog'
import { Room, RoomCreateRequest, RoomUpdateRequest } from '../types'

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
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      description: form.description || undefined,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="font-semibold text-gray-900">
            {room ? 'Edit Ruangan' : 'Tambah Ruangan'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label htmlFor="room-code" className="form-label">Kode Ruangan</label>
              <input
                id="room-code"
                type="text"
                required
                className="form-input"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="R101"
              />
            </div>
            <div>
              <label htmlFor="room-name" className="form-label">Nama Ruangan</label>
              <input
                id="room-name"
                type="text"
                required
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Laboratorium Komputer A"
              />
            </div>
            <div>
              <label htmlFor="room-capacity" className="form-label">Kapasitas (orang)</label>
              <input
                id="room-capacity"
                type="number"
                required
                min={1}
                className="form-input"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div>
              <label htmlFor="room-description" className="form-label">
                Deskripsi <span className="text-gray-400">(opsional)</span>
              </label>
              <textarea
                id="room-description"
                rows={3}
                className="form-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Fasilitas yang tersedia..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button
              id="room-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : room ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RoomsPage() {
  const { isAdmin } = useAuth()
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

  if (isLoading) return <PageLoader />

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Ruangan Kampus</h1>
          <p className="page-subtitle">Daftar ruangan yang tersedia untuk dipinjam</p>
        </div>
        {isAdmin && (
          <button id="add-room-btn" onClick={openCreate} className="btn-primary">
            + Tambah Ruangan
          </button>
        )}
      </div>

      <div className="card">
        {!rooms || rooms.length === 0 ? (
          <div className="card-body text-center text-gray-400 py-12">
            Belum ada ruangan terdaftar
          </div>
        ) : (
          <div className="table-container rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Kapasitas</th>
                  <th>Deskripsi</th>
                  <th>Terdaftar</th>
                  {isAdmin && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {room.code}
                      </span>
                    </td>
                    <td className="font-medium">{room.name}</td>
                    <td>
                      <span className="badge-room">{room.capacity} orang</span>
                    </td>
                    <td className="text-gray-500 max-w-[220px] truncate">
                      {room.description ?? '-'}
                    </td>
                    <td className="text-gray-400 text-xs">
                      {new Date(room.created_at).toLocaleDateString('id-ID')}
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            id={`edit-room-${room.id}`}
                            onClick={() => openEdit(room)}
                            className="btn-secondary btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            id={`delete-room-${room.id}`}
                            onClick={() => setDeleteId(room.id)}
                            className="btn-danger btn-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
