import { ROLE_IDS, ROLE_NAMES } from '@/lib/constants'
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

  // Admin 관련 경로들
  const adminRoutes = ['/admin']
  const adminAuthRoutes = ['/admin/login', '/admin/signup']
  const isAdminRoute = adminRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  const isAdminAuthRoute = adminAuthRoutes.some(route => req.nextUrl.pathname === route)

  // Admin 경로 처리
  if (isAdminRoute && !isAdminAuthRoute) {
    // Admin 페이지에 접근하려면 로그인이 필요
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Admin 권한 확인 - user_profiles 테이블에서 role 확인
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role, role_id')
        .eq('id', session.user.id)
        .single()

      if (error || !profile) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      const isAdmin = profile.role === ROLE_NAMES.ADMIN || profile.role_id === ROLE_IDS.ADMIN
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Admin 인증 페이지에서 이미 로그인된 관리자 처리
  if (isAdminAuthRoute && session) {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role, role_id')
        .eq('id', session.user.id)
        .single()

      if (!error && profile) {
        const isAdmin = profile.role === ROLE_NAMES.ADMIN || profile.role_id === ROLE_IDS.ADMIN
        if (isAdmin) {
          return NextResponse.redirect(new URL('/admin/events', req.url))
        }
      }
    } catch (error) {
      // 에러가 발생하면 그냥 로그인 페이지에 머무름
    }
  }

  // 일반 사용자 인증 처리
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
