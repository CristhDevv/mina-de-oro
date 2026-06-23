/**
 * app/api/alegra/confirm-delivery/route.ts
 *
 * POST /api/alegra/confirm-delivery
 * Dispara confirmarEntregaYDescontarStock para una orden dada.
 * Solo accesible por admins autenticados.
 *
 * Body: { order_id: string, retry_failed_only?: boolean }
 *
 * GET /api/alegra/confirm-delivery?order_id=...
 * Devuelve el estado actual del sync log para una orden (diagnóstico sin ejecutar nada).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { confirmarEntregaYDescontarStock } from '@/lib/alegra/delivery-sync'

async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

// ─── POST: ejecutar descuento ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { order_id?: string; retry_failed_only?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { order_id, retry_failed_only = false } = body

  if (!order_id || typeof order_id !== 'string') {
    return NextResponse.json({ error: 'order_id es requerido' }, { status: 400 })
  }

  // Verificar que la orden existe antes de intentar
  const supabase = createAdminClient()
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', order_id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  try {
    const result = await confirmarEntregaYDescontarStock(order_id, {
      retryFailedOnly: retry_failed_only,
    })

    const httpStatus =
      result.failed.length > 0 && result.success.length === 0
        ? 500  // todos fallaron
        : result.failed.length > 0
        ? 207  // parcial (Multi-Status)
        : 200  // todos exitosos (o ya estaban en success / omitted)

    return NextResponse.json({ ok: true, result }, { status: httpStatus })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[API confirm-delivery] Error:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// ─── GET: diagnóstico del log de una orden ────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('order_id')

  if (!orderId) {
    return NextResponse.json({ error: 'order_id es requerido como query param' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: logs, error } = await supabase
    .from('alegra_sync_log')
    .select(`
      id,
      idempotency_key,
      product_id,
      alegra_item_id,
      alegra_warehouse_id,
      quantity,
      operation_type,
      result,
      alegra_adjustment_id,
      error_message,
      created_at,
      updated_at
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Resumen rápido para el admin
  const summary = {
    total: logs?.length ?? 0,
    success: logs?.filter(l => l.result === 'success').length ?? 0,
    pending: logs?.filter(l => l.result === 'pending').length ?? 0,
    error: logs?.filter(l => l.result === 'error').length ?? 0,
  }

  return NextResponse.json({ order_id: orderId, summary, logs })
}
