'use client'

/**
 * components/admin/AlegraTab.tsx
 *
 * Pestaña de configuración de la integración Alegra en el panel de administración.
 * Permite:
 * 1. Gestionar puntos físicos / bodegas (warehouses)
 * 2. Vincular/desvincular productos del catálogo con ítems de Alegra
 * 3. Forzar un ciclo de sincronización de stock manualmente
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Warehouse,
  Link,
  Link2Off,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Pencil,
  Trash2,
  Save,
  X,
} from 'lucide-react'
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getProductLinkStatus,
  linkProductToAlegra,
  unlinkProductFromAlegra,
  triggerStockSync,
} from '@/lib/api/alegra'
import type { WarehouseData, ProductLinkStatus } from '@/lib/api/alegra'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AlegraTabProps {
  /** Lista de productos del catálogo local para el selector de vinculación */
  products: Array<{ id: string; name: string; alegra_item_id?: number | null }>
}

interface WarehouseForm {
  name: string
  address: string
  alegra_warehouse_id: string
}

const emptyForm: WarehouseForm = { name: '', address: '', alegra_warehouse_id: '' }

// ─── Sección Bodegas ──────────────────────────────────────────────────────────

function WarehousesSection() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<WarehouseForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWarehouses(false) // incluir inactivos para gestión
      setWarehouses(data)
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Error al cargar bodegas' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(wh: WarehouseData) {
    setEditingId(wh.id)
    setForm({
      name: wh.name,
      address: wh.address ?? '',
      alegra_warehouse_id: wh.alegra_warehouse_id?.toString() ?? '',
    })
    setShowForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    setFeedback(null)
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        alegra_warehouse_id: form.alegra_warehouse_id ? parseInt(form.alegra_warehouse_id) : null,
      }
      if (editingId) {
        await updateWarehouse({ id: editingId, ...payload })
      } else {
        await createWarehouse(payload)
      }
      await load()
      setEditingId(null)
      setShowForm(false)
      setForm(emptyForm)
      setFeedback({ type: 'success', msg: editingId ? 'Bodega actualizada' : 'Bodega creada' })
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Desactivar esta bodega? Los datos históricos se conservan.')) return
    try {
      await deleteWarehouse(id)
      await load()
      setFeedback({ type: 'success', msg: 'Bodega desactivada' })
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Error' })
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Warehouse size={18} className="text-[#1B2B5E]" />
          <h3 className="text-sm font-bold text-gray-900">Puntos físicos / Bodegas</h3>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B2B5E] text-white text-xs font-bold hover:bg-[#1B2B5E]/90 transition-colors"
        >
          <Plus size={13} /> Nueva bodega
        </button>
      </div>

      {feedback && (
        <div className={`mb-4 flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-2xl ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
          {feedback.msg}
        </div>
      )}

      {/* Formulario de creación / edición */}
      {(showForm || editingId) && (
        <div className="mb-4 bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {editingId ? 'Editar bodega' : 'Nueva bodega'}
          </p>
          <input
            placeholder="Nombre del punto (ej: Bodega Principal)"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="h-10 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E]"
          />
          <input
            placeholder="Dirección (opcional)"
            value={form.address}
            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
            className="h-10 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E]"
          />
          <div className="flex flex-col gap-1">
            <input
              type="number"
              placeholder="ID de bodega en Alegra (número)"
              value={form.alegra_warehouse_id}
              onChange={e => setForm(p => ({ ...p, alegra_warehouse_id: e.target.value }))}
              className="h-10 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E]"
            />
            <p className="text-[10px] text-gray-400 ml-1">
              Encuéntralo en Alegra → Inventario → Bodegas → ID de la fila
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B2B5E] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#1B2B5E]/90 transition-colors"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => { setShowForm(false); cancelEdit() }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              <X size={13} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-300" />
        </div>
      ) : warehouses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No hay bodegas configuradas. Crea una para comenzar.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {warehouses.map(wh => (
            <div
              key={wh.id}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${
                wh.active ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">{wh.name}</p>
                  {!wh.active && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
                      INACTIVA
                    </span>
                  )}
                </div>
                {wh.address && <p className="text-xs text-gray-500 mt-0.5">{wh.address}</p>}
                <p className={`text-[11px] mt-1 font-mono ${wh.alegra_warehouse_id ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {wh.alegra_warehouse_id
                    ? `✓ Alegra ID: ${wh.alegra_warehouse_id}`
                    : '⚠ Sin ID de Alegra configurado'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => startEdit(wh)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-[#1B2B5E] transition-colors"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                {wh.active && (
                  <button
                    onClick={() => handleDelete(wh.id)}
                    className="p-2 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                    title="Desactivar"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sección Vinculación de Productos ─────────────────────────────────────────

function ProductLinkSection({ products }: { products: AlegraTabProps['products'] }) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const [linkStatus, setLinkStatus] = useState<ProductLinkStatus | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [alegraItemIdInput, setAlegraItemIdInput] = useState('')
  const [linking, setLinking] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function loadStatus(productId: string) {
    setLoadingStatus(true)
    setFeedback(null)
    setLinkStatus(null)
    try {
      const status = await getProductLinkStatus(productId)
      setLinkStatus(status)
      setAlegraItemIdInput(status.alegra_item_id?.toString() ?? '')
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Error' })
    } finally {
      setLoadingStatus(false)
    }
  }

  function handleProductChange(id: string) {
    setSelectedProductId(id)
    setLinkStatus(null)
    setFeedback(null)
    setAlegraItemIdInput('')
    if (id) loadStatus(id)
  }

  async function handleLink() {
    if (!selectedProductId || !alegraItemIdInput) return
    const itemId = parseInt(alegraItemIdInput)
    if (isNaN(itemId)) {
      setFeedback({ type: 'error', msg: 'El ID de ítem debe ser un número entero' })
      return
    }
    setLinking(true)
    setFeedback(null)
    try {
      const res = await linkProductToAlegra({ product_id: selectedProductId, alegra_item_id: itemId })
      setFeedback({
        type: 'success',
        msg: `Vinculado con "${res.alegra_item_name}" en Alegra${res.inventory_available !== null ? ` · Stock disponible: ${res.inventory_available}` : ''}`,
      })
      await loadStatus(selectedProductId)
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Error al vincular' })
    } finally {
      setLinking(false)
    }
  }

  async function handleUnlink() {
    if (!selectedProductId) return
    if (!confirm('¿Desvincular este producto de Alegra? El stock volverá al campo local.')) return
    setLinking(true)
    setFeedback(null)
    try {
      await unlinkProductFromAlegra(selectedProductId)
      setFeedback({ type: 'success', msg: 'Producto desvinculado. La caché de stock fue eliminada.' })
      setAlegraItemIdInput('')
      await loadStatus(selectedProductId)
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Error al desvincular' })
    } finally {
      setLinking(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Link size={18} className="text-[#1B2B5E]" />
        <h3 className="text-sm font-bold text-gray-900">Vincular Producto ↔ Alegra</h3>
      </div>

      {feedback && (
        <div className={`mb-4 flex items-start gap-2 text-xs font-medium px-4 py-3 rounded-2xl ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={13} className="mt-0.5 shrink-0" /> : <AlertCircle size={13} className="mt-0.5 shrink-0" />}
          {feedback.msg}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Selector de producto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Producto del catálogo</label>
          <select
            value={selectedProductId}
            onChange={e => handleProductChange(e.target.value)}
            className="h-11 px-4 rounded-2xl border border-gray-200 text-sm bg-white outline-none focus:border-[#1B2B5E]"
          >
            <option value="">Selecciona un producto...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}{p.alegra_item_id ? ' ✓' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Estado de vínculo actual */}
        {loadingStatus && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 size={13} className="animate-spin" /> Consultando Alegra...
          </div>
        )}

        {linkStatus && !loadingStatus && (
          <div className={`rounded-2xl p-4 text-xs ${
            linkStatus.linked
              ? 'bg-emerald-50 border border-emerald-100'
              : 'bg-amber-50 border border-amber-100'
          }`}>
            {linkStatus.linked ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <CheckCircle size={13} /> Vinculado con Alegra
                </div>
                <p className="text-emerald-600">
                  Ítem: <strong>{linkStatus.alegra_item_name ?? '—'}</strong>
                  {' · '}ID: <code className="font-mono">{linkStatus.alegra_item_id}</code>
                </p>
                {linkStatus.alegra_reference && (
                  <p className="text-emerald-600">Referencia: {linkStatus.alegra_reference}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-bold text-amber-700">
                <AlertCircle size={13} /> Sin vínculo. El stock se lee del campo local.
              </div>
            )}
          </div>
        )}

        {/* Campo para el ID de Alegra */}
        {selectedProductId && !loadingStatus && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              ID del ítem en Alegra
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="ej: 12345"
                value={alegraItemIdInput}
                onChange={e => setAlegraItemIdInput(e.target.value)}
                className="flex-1 h-10 px-4 rounded-xl border border-gray-200 text-sm font-mono outline-none focus:border-[#1B2B5E]"
              />
              <button
                onClick={handleLink}
                disabled={linking || !alegraItemIdInput}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B2B5E] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#1B2B5E]/90 transition-colors whitespace-nowrap"
              >
                {linking ? <Loader2 size={13} className="animate-spin" /> : <Link size={13} />}
                {linking ? 'Vinculando...' : 'Vincular'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 ml-1">
              En Alegra: Inventario → Ítems → abre el ítem → el número en la URL es el ID
            </p>
          </div>
        )}

        {/* Botón desvincular */}
        {linkStatus?.linked && (
          <button
            onClick={handleUnlink}
            disabled={linking}
            className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 disabled:opacity-50 transition-colors"
          >
            <Link2Off size={13} /> Desvincular
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Sección Sync de Stock ────────────────────────────────────────────────────

function StockSyncSection() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{
    total: number; success: number; failed: number; sync_interval_ms: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setResult(null)
    try {
      const data = await triggerStockSync()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="text-[#1B2B5E]" />
          <h3 className="text-sm font-bold text-gray-900">Sincronización de Stock</h3>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B2B5E] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#1B2B5E]/90 transition-colors"
        >
          {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          {syncing ? 'Sincronizando...' : 'Forzar sync ahora'}
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Consulta el inventario de todos los productos vinculados a Alegra y actualiza la caché local.
        El sync automático corre en el intervalo definido por <code className="font-mono text-[11px] bg-gray-100 px-1 rounded">ALEGRA_SYNC_INTERVAL_SECONDS</code> si hay un cron externo configurado.
      </p>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 rounded-2xl px-4 py-3">
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {result && (
        <div className={`rounded-2xl px-4 py-3 text-xs ${
          result.failed === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {result.failed === 0 ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
            Ciclo completado
          </div>
          <p>
            {result.total} productos procesados · {result.success} actualizados
            {result.failed > 0 ? ` · ${result.failed} con error` : ''}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AlegraTab({ products }: AlegraTabProps) {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Integración Alegra</h2>
        <span className="text-xs font-medium px-2.5 py-1 bg-[#1B2B5E]/5 text-[#1B2B5E] rounded-full font-mono">
          api.alegra.com
        </span>
      </div>

      <StockSyncSection />
      <WarehousesSection />
      <ProductLinkSection products={products} />
    </div>
  )
}
