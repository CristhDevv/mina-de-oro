export { updateSession as proxy } from '@/lib/supabase/middleware'

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
