"use client"

import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminStartPage() {
  const router = useRouter()
  const { adminUser, adminLoading, adminInitialized } = useAuthStore()

  useEffect(() => {
    // 로딩이 완료되고 초기화가 되었을 때만 리다이렉트 실행
    if (!adminLoading && adminInitialized) {
      if (adminUser) {
        // 관리자가 로그인되어 있으면 대시보드로 리다이렉트
        router.replace('/admin/dashboard')
      }
      // 미들웨어에서 이미 인증되지 않은 사용자는 처리하므로 여기서는 대시보드로만 리다이렉트
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

  // 미들웨어에서 이미 인증을 처리했으므로 대시보드로 리다이렉트
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">대시보드로 이동 중...</p>
      </div>
    </div>
  )
}
