import { useCategories, useCreateCategory } from '../hooks/useCategories'
import CategoryModal from '../components/CategoryModal'

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
import { uploadService } from '../services/uploadService'
import ConfirmDialog from '../components/ConfirmDialog'
import { Item, ItemCreateRequest, ItemUpdateRequest } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Plus, Edit2, Trash2, PackageSearch, Image as ImageIcon, Tags } from 'lucide-react'
import { cn } from '../lib/utils'

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
  const { data: categories } = useCategories()
  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    quantity: item?.quantity ?? 1,
    description: item?.description ?? '',
    category: item?.category ?? '',
    image_url: item?.image_url ?? '',
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
      category: form.category || undefined,
      image_url: form.image_url || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-lg">
            {item ? 'Edit Peralatan' : 'Tambah Peralatan'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="item-code" className="text-sm font-medium text-slate-700">Kode</label>
                <Input
                  id="item-code"
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="IT001"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="item-category" className="text-sm font-medium text-slate-700">Kategori</label>
                <select
                  id="item-category"
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Pilih Kategori</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="item-name" className="text-sm font-medium text-slate-700">Nama Peralatan</label>
              <Input
                id="item-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Proyektor LCD"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="item-quantity" className="text-sm font-medium text-slate-700">Jumlah Total</label>
              <Input
                id="item-quantity"
                type="number"
                required
                min={0}
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Gambar Peralatan</label>
              <div className="flex gap-2 items-center">
                <Input
                  id="item-image"
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
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
              <label htmlFor="item-description" className="text-sm font-medium text-slate-700">
                Deskripsi
              </label>
              <textarea
                id="item-description"
                rows={3}
                className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi singkat peralatan..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button
              id="item-submit-btn"
              type="submit"
              isLoading={isLoading}
            >
              {item ? 'Simpan Perubahan' : 'Tambah Peralatan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ItemsPage() {
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  // Using the new search hook API we added in backend
  const { data: items, isLoading } = useItems({ search: search || undefined })
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()

  const [modalItem, setModalItem] = useState<Item | null | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

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

  if (isLoading && !items) return <PageLoader />

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Katalog Peralatan</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola dan cari peralatan laboratorium yang tersedia.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input 
            placeholder="Cari nama atau kode..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)} className="whitespace-nowrap">
                <Tags size={16} className="mr-2" />
                Kelola Kategori
              </Button>
              <Button id="add-item-btn" onClick={openCreate} className="whitespace-nowrap">
                <Plus size={16} className="mr-2" />
                Tambah Peralatan
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {!items || items.length === 0 ? (
            <div className="text-center text-slate-500 py-16 flex flex-col items-center">
              <PackageSearch size={48} className="text-slate-300 mb-4" strokeWidth={1} />
              <p className="font-medium text-slate-600">Peralatan tidak ditemukan</p>
              <p className="text-sm mt-1">Coba sesuaikan pencarian Anda atau tambah peralatan baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl w-16">Foto</th>
                    <th className="px-6 py-4">Kode</th>
                    <th className="px-6 py-4">Nama Peralatan</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Ketersediaan</th>
                    {isAdmin && <th className="px-6 py-4 rounded-tr-xl text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={18} className="text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200/60">
                          {item.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500 max-w-[200px] truncate mt-0.5" title={item.description || ''}>
                          {item.description ?? 'Tidak ada deskripsi'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {item.category ? (
                          <Badge variant="info">{item.category}</Badge>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            item.quantity > 0 ? "bg-green-500" : "bg-red-500"
                          )}></span>
                          <span className={item.quantity > 0 ? "text-slate-700" : "text-red-600 font-medium"}>
                            {item.quantity} Tersedia
                          </span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              id={`edit-item-${item.id}`}
                              onClick={() => openEdit(item)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              id={`delete-item-${item.id}`}
                              onClick={() => setDeleteId(item.id)}
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

      {isCategoryModalOpen && (
        <CategoryModal onClose={() => setIsCategoryModalOpen(false)} />
      )}
    </div>
  )
}
