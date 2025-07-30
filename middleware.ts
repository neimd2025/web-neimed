import { createClient } from '@/utils/supabase/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { supabase, supabaseResponse } = createClient(req)

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 인증이 필요한 페이지들
  const protectedRoutes = ['/home', '/my-page', '/profile', '/events', '/saved-cards', '/scan-card']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // 인증 페이지들
  const authRoutes = ['/login', '/signup', '/verify']
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    // 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthRoute && session) {
    // 이미 로그인된 사용자를 홈으로 리다이렉트
    return NextResponse.redirect(new URL('/home', req.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
