"use client"

import { useAuth } from "@/hooks/use-auth"
import { useAdminStore } from "@/stores/admin-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { initializeAdminAuth, initialized, adminUser, loading } = useAdminStore()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) {
      initializeAdminAuth()
    }
  }, [initialized, initializeAdminAuth])

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않았거나 관리자가 아니면 로그인 페이지로 리다이렉트
  if (!user || !adminUser) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
