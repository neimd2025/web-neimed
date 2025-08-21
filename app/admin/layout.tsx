"use client"

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { usePathname } from "next/navigation"
import { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // admin 인증 페이지들은 인증 체크 제외
  if (pathname === '/admin/login' || pathname === '/admin/signup') {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // 로딩 중
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // 로그인되지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">관리자 로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">관리자 페이지에 접근하려면 로그인해주세요.</p>
          <Link href="/admin/login">
            <Button>관리자 로그인</Button>
          </Link>
        </div>
      </div>
    )
  }

  // 관리자 권한 체크 (실제로는 더 정교한 권한 체크가 필요)
  // 여기서는 간단히 이메일이나 사용자 ID로 관리자 여부를 판단
  const isAdmin = user.email?.includes('admin') || user.id === 'admin-user-id'

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">관리자 권한이 없습니다</h2>
          <p className="text-gray-600 mb-4">이 페이지에 접근할 권한이 없습니다.</p>
          <Link href="/home">
            <Button>홈으로 돌아가기</Button>
          </Link>
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
