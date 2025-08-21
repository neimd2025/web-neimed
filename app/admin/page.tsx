"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminStartPage() {
  const router = useRouter()

  useEffect(() => {
    // 미들웨어에서 이미 인증을 처리했으므로 바로 이벤트 관리 페이지로 리다이렉트
    router.replace('/admin/events')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">이벤트 관리 페이지로 이동 중...</p>
      </div>
    </div>
  )
}
