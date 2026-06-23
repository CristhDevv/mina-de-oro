/**
 * app/api/alegra/sync-stock/route.ts
 *
 * Endpoint que dispara un ciclo de sincronización de stock desde Alegra.
 *
 * Diseñado para ser llamado por:
 * - Un cron job externo (ej: Vercel Cron, GitHub Actions, Supabase Edge Function scheduled)
 * - El panel de admin manualmente para forzar sync
 *
 * El intervalo entre llamadas lo controla quien invoca este endpoint,
 * usando ALEGRA_SYNC_INTERVAL_SECONDS como referencia.
 *
 * Seguridad: solo admins autenticados pueden disparar este endpoint.
 * Para uso desde cron externo, se acepta además el header X-Sync-Secret
 * con el valor de ALEGRA_SYNC_SECRET (opcional, para automatización sin sesión).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runStockSyncCycle, getSyncIntervalMs } from '@/lib/alegra/stock-sync'

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Opción 1: Secret estático para crons automatizados
  const syncSecret = process.env.ALEGRA_SYNC_SECRET
  if (syncSecret) {
    const headerSecret = req.headers.get('X-Sync-Secret')
    if (headerSecret === syncSecret) return true
  }

  // Opción 2: Sesión de admin autenticado
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

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = await runStockSyncCycle()
    return NextResponse.json({
      ok: true,
      ...summary,
      sync_interval_ms: getSyncIntervalMs(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Alegra] Error en ciclo de sync:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

/** GET — solo devuelve el intervalo configurado, sin ejecutar sync */
export async function GET() {
  return NextResponse.json({
    sync_interval_ms: getSyncIntervalMs(),
    sync_interval_seconds: getSyncIntervalMs() / 1000,
  })
}
