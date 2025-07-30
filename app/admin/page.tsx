"use client"

import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminStartPage() {
  const router = useRouter()
  const { adminUser, adminLoading, adminInitialized } = useAuthStore()

  useEffect(() => {
    if (!adminLoading && adminInitialized) {
      if (adminUser) {
        // 관리자가 로그인되어 있으면 대시보드로 리다이렉트
        router.push('/admin/dashboard')
      } else {
        // 관리자가 아니면 로그인 페이지로 리다이렉트
        router.push('/admin/login')
      }
    }
  }, [adminUser, adminLoading, adminInitialized, router])

  // 로딩 중이면 로딩 화면 표시
  if (adminLoading || !adminInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 리다이렉트 중이면 로딩 화면 표시
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">리다이렉트 중...</p>
      </div>
    </div>
  )
}
