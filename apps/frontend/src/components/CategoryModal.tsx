import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useCategories, useCreateCategory } from '../hooks/useCategories'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Tags, Plus } from 'lucide-react'

export default function CategoryModal({ onClose }: { onClose: () => void }) {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const [newCategory, setNewCategory] = useState('')

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    try {
      await createCategory.mutateAsync({ name: newCategory.trim() })
      toast.success('Kategori ditambahkan')
      setNewCategory('')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal menambahkan kategori')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tags size={20} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-lg">Kelola Kategori</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nama kategori baru..."
              className="flex-1"
            />
            <Button type="submit" isLoading={createCategory.isPending}>
              <Plus size={16} />
            </Button>
          </form>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">Daftar Kategori</h4>
            {isLoading ? (
              <p className="text-sm text-slate-500">Memuat...</p>
            ) : categories && categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span key={c.id} className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700 border border-slate-200">
                    {c.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Belum ada kategori.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
