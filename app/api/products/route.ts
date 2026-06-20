import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/products — Crear producto
 * PUT  /api/products — Actualizar producto
 * 
 * Usa service_role internamente para bypassear RLS, pero primero
 * verifica que el usuario autenticado sea admin.
 */
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null
  return user
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await req.json()
  const admin = createAdminClient()

  // Si ya existe un producto con el mismo slug, lo retornamos como éxito
  // para que el frontend redirija correctamente sin intentar duplicar.
  if (payload.slug) {
    const { data: existing } = await admin
      .from('products')
      .select('*')
      .eq('slug', payload.slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, product: existing }, { status: 200 })
    }
  }

  const { error } = await admin.from('products').insert(payload)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, ...payload } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('products').update(payload).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
