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

  // 인증이 필요한 페이지들 (새로운 폴더 구조 반영)
  const protectedRoutes = ['/home', '/my-page', '/namecard', '/events', '/saved-cards', '/scan-card', '/my-namecard', '/my-qr', '/notifications', '/business-card', '/onboarding']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // 인증 페이지들
  const authRoutes = ['/login', '/signup', '/verify', '/forgot-password', '/reset-password']
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

  // 인증된 사용자의 프로필 및 명함 상태 확인
  if (isProtectedRoute && session) {
    try {
      // 사용자 프로필 확인
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, personality_keywords')
        .eq('id', session.user.id)
        .single()

      // 사용자 명함 확인
      const { data: businessCard, error: cardError } = await supabase
        .from('business_cards')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      // 온보딩이나 명함 편집 페이지가 아닌 경우에만 리다이렉트
      const isOnboardingRoute = req.nextUrl.pathname.startsWith('/onboarding')
      const isNamecardEditRoute = req.nextUrl.pathname.startsWith('/namecard/edit')
      
      if (!isOnboardingRoute && !isNamecardEditRoute) {
        // 프로필이 없거나 불완전한 경우 명함 생성으로 리다이렉트
        if (!profile || !profile.full_name || !profile.personality_keywords || profile.personality_keywords.length === 0) {
          return NextResponse.redirect(new URL('/namecard/edit', req.url))
        }

        // 프로필은 있지만 명함이 없는 경우도 명함 편집으로 리다이렉트 (명함과 프로필이 함께 생성됨)
        if (!businessCard) {
          return NextResponse.redirect(new URL('/namecard/edit', req.url))
        }
      }
    } catch (error) {
      console.error('Error checking user profile/card:', error)
      // 에러 발생시 명함 편집으로 리다이렉트
      if (!req.nextUrl.pathname.startsWith('/namecard/edit') && !req.nextUrl.pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/namecard/edit', req.url))
      }
    }

    // 비밀번호 재설정 중인지 확인하는 헤더 추가
    const response = NextResponse.next()
    response.headers.set('x-password-reset-check', 'true')
    return response
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
