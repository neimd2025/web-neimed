"use client"

import { useAuthStore } from "@/stores/auth-store"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading, adminUser } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  // admin/login 페이지는 인증 체크를 건너뛰고 바로 렌더링
  if (pathname === '/admin/login' || pathname === '/admin/signup') {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  useEffect(() => {
    // 인증 로딩이 완료되고, 사용자가 없거나 관리자가 아니면 리다이렉트
    if (!authLoading && !hasRedirected.current && (!user || !adminUser)) {
      hasRedirected.current = true
      router.push('/admin/login')
    }
  }, [user, adminUser, authLoading, router])

  // 인증 로딩 중이면 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않았거나 관리자가 아니면 로딩 화면 표시 (리다이렉트 중)
  if (!user || !adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">리다이렉트 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
