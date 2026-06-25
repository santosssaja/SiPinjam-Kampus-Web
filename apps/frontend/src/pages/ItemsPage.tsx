import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from '../hooks/useItems'
import { PageLoader } from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import { Item, ItemCreateRequest, ItemUpdateRequest } from '../types'

function ItemModal({
  item,
  onClose,
  onSubmit,
  isLoading,
}: {
  item?: Item | null
  onClose: () => void
  onSubmit: (data: ItemCreateRequest | ItemUpdateRequest) => void
  isLoading: boolean
}) {
  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    quantity: item?.quantity ?? 1,
    description: item?.description ?? '',
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
            {item ? 'Edit Peralatan' : 'Tambah Peralatan'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label htmlFor="item-code" className="form-label">Kode</label>
              <input
                id="item-code"
                type="text"
                required
                className="form-input"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="IT001"
              />
            </div>
            <div>
              <label htmlFor="item-name" className="form-label">Nama</label>
              <input
                id="item-name"
                type="text"
                required
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Proyektor LCD"
              />
            </div>
            <div>
              <label htmlFor="item-quantity" className="form-label">Jumlah</label>
              <input
                id="item-quantity"
                type="number"
                required
                min={0}
                className="form-input"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label htmlFor="item-description" className="form-label">
                Deskripsi <span className="text-gray-400">(opsional)</span>
              </label>
              <textarea
                id="item-description"
                rows={3}
                className="form-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi singkat peralatan..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button
              id="item-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : item ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ItemsPage() {
  const { isAdmin } = useAuth()
  const { data: items, isLoading } = useItems()
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()

  const [modalItem, setModalItem] = useState<Item | null | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const openCreate = () => setModalItem(null)
  const openEdit = (item: Item) => setModalItem(item)
  const closeModal = () => setModalItem(undefined)

  const handleSubmit = async (data: ItemCreateRequest | ItemUpdateRequest) => {
    try {
      if (modalItem) {
        await updateItem.mutateAsync({ id: modalItem.id, data })
        toast.success('Peralatan berhasil diperbarui')
      } else {
        await createItem.mutateAsync(data as ItemCreateRequest)
        toast.success('Peralatan berhasil ditambahkan')
      }
      closeModal()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Terjadi kesalahan')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteItem.mutateAsync(deleteId)
      toast.success('Peralatan berhasil dihapus')
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
          <h1 className="page-title">Peralatan Laboratorium</h1>
          <p className="page-subtitle">Daftar peralatan yang dapat dipinjam</p>
        </div>
        {isAdmin && (
          <button id="add-item-btn" onClick={openCreate} className="btn-primary">
            + Tambah Peralatan
          </button>
        )}
      </div>

      <div className="card">
        {!items || items.length === 0 ? (
          <div className="card-body text-center text-gray-400 py-12">
            Belum ada peralatan terdaftar
          </div>
        ) : (
          <div className="table-container rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Jumlah</th>
                  <th>Deskripsi</th>
                  <th>Terdaftar</th>
                  {isAdmin && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                    </td>
                    <td className="font-medium">{item.name}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.quantity > 0 ? 'badge-approved' : 'badge-rejected'
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="text-gray-500 max-w-[220px] truncate">
                      {item.description ?? '-'}
                    </td>
                    <td className="text-gray-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            id={`edit-item-${item.id}`}
                            onClick={() => openEdit(item)}
                            className="btn-secondary btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            id={`delete-item-${item.id}`}
                            onClick={() => setDeleteId(item.id)}
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

      {/* Modal */}
      {modalItem !== undefined && (
        <ItemModal
          item={modalItem}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isLoading={createItem.isPending || updateItem.isPending}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Hapus Peralatan"
        message="Peralatan akan dinonaktifkan dari sistem. Histori peminjaman tetap tersimpan."
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteItem.isPending}
      />
    </div>
  )
}
