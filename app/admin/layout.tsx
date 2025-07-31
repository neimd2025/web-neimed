"use client"

import { useAuthStore } from "@/stores/auth-store"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading: authLoading } = useAuthStore()
  const pathname = usePathname()

  // admin 인증 페이지들은 미들웨어에서 처리되므로 바로 렌더링
  if (pathname === '/admin/login' || pathname === '/admin/signup') {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

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

  // 미들웨어에서 이미 인증을 처리했으므로 바로 렌더링
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
