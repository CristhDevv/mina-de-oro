'use client'
import { useEffect, useState } from 'react'
import { getInventory, updateProductStock } from '@/lib/api/admin'
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

type InventoryItem = {
  id: string
  name: string
  slug: string
  images: string[]
  stock: number
  active: boolean
  category_slug: string
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
      <XCircle size={13} /> Agotado
    </span>
  )
  if (stock <= 5) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-orange-500">
      <AlertTriangle size={13} /> Stock bajo
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
      <CheckCircle size={13} /> En stock
    </span>
  )
}

export default function InventoryView() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getInventory().then(setItems).finally(() => setLoading(false))
  }, [])

  function startEdit(item: InventoryItem) {
    setEditing(item.id)
    setEditValue(item.stock.toString())
  }

  async function saveStock(id: string) {
    const newStock = parseInt(editValue)
    if (isNaN(newStock) || newStock < 0) return
    setSaving(true)
    await updateProductStock(id, newStock)
    setItems(prev => prev.map(i => i.id === id ? { ...i, stock: newStock } : i)
      .sort((a, b) => a.stock - b.stock))
    setEditing(null)
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-[#1B2B5E]" />
    </div>
  )

  const agotados = items.filter(i => i.stock === 0).length
  const bajos = items.filter(i => i.stock > 0 && i.stock <= 5).length

  return (
    <div className="flex flex-col gap-4">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-gray-800">{items.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-orange-500">{bajos}</p>
          <p className="text-xs text-gray-400 mt-0.5">Stock bajo</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-red-500">{agotados}</p>
          <p className="text-xs text-gray-400 mt-0.5">Agotados</p>
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id}
            className={`flex items-center gap-3 p-3 rounded-2xl border ${
              item.stock === 0 ? 'border-red-100 bg-red-50' :
              item.stock <= 5 ? 'border-orange-100 bg-orange-50' :
              'border-gray-100 bg-white'
            }`}>
            {/* Imagen */}
            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
              {item.images?.[0] ? (
                <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="48px" />
              ) : (
                <span className="text-2xl flex items-center justify-center h-full">🛍️</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
              <StockBadge stock={item.stock} />
            </div>

            {/* Editor de stock */}
            {editing === item.id ? (
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-16 h-8 px-2 rounded-xl border border-gray-200 text-sm text-center outline-none focus:border-[#1B2B5E]"
                  min="0"
                  autoFocus
                />
                <button onClick={() => saveStock(item.id)} disabled={saving}
                  className="h-8 px-3 bg-[#1B2B5E] text-white text-xs font-semibold rounded-xl disabled:opacity-50">
                  {saving ? '...' : 'OK'}
                </button>
                <button onClick={() => setEditing(null)}
                  className="h-8 px-2 text-gray-400 text-xs rounded-xl border border-gray-200">
                  ✕
                </button>
              </div>
            ) : (
              <button onClick={() => startEdit(item)}
                className="flex items-center gap-1.5 shrink-0 px-3 h-8 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 active:bg-gray-50">
                {item.stock}
                <span className="text-xs text-gray-400 font-normal">uds</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
