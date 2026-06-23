/**
 * app/api/alegra/warehouses/route.ts
 *
 * CRUD de puntos físicos (warehouses) del negocio.
 * Solo accesible por admins autenticados.
 *
 * GET    /api/alegra/warehouses          → lista todos los warehouses
 * POST   /api/alegra/warehouses          → crea un warehouse nuevo
 * PUT    /api/alegra/warehouses          → actualiza un warehouse existente (requiere id en body)
 * DELETE /api/alegra/warehouses?id=...   → desactiva (soft delete) un warehouse
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const onlyActive = searchParams.get('active') !== 'false' // default: solo activos

  const supabase = createAdminClient()
  let query = supabase
    .from('warehouses')
    .select('id, name, address, active, alegra_warehouse_id, created_at, updated_at')
    .order('created_at', { ascending: true })

  if (onlyActive) query = query.eq('active', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ warehouses: data })
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    name?: string
    address?: string
    active?: boolean
    alegra_warehouse_id?: number | null
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name es requerido' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('warehouses')
    .insert({
      name: body.name.trim(),
      address: body.address?.trim() ?? null,
      active: body.active ?? true,
      alegra_warehouse_id: body.alegra_warehouse_id ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, warehouse: data }, { status: 201 })
}

// ─── PUT ──────────────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    id?: string
    name?: string
    address?: string
    active?: boolean
    alegra_warehouse_id?: number | null
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
  }

  const { id, ...updates } = body
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('warehouses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, warehouse: data })
}

// ─── DELETE (soft delete → active = false) ────────────────────────────────────

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id es requerido como query param' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('warehouses')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
