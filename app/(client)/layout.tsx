"use client"

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const { passwordResetInProgress, passwordResetEmail, setPasswordResetInProgress, clearPasswordResetState } = useAuthStore()
  const router = useRouter()
  const [showPasswordResetWarning, setShowPasswordResetWarning] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user && !authLoading) {
      // 비밀번호 재설정 상태 확인 (스토어와 localStorage 동기화)
      const resetInProgress = localStorage.getItem('passwordResetInProgress')
      const resetEmail = localStorage.getItem('passwordResetEmail')

      if (resetInProgress === 'true' && resetEmail && user.email === resetEmail) {
        setPasswordResetInProgress(true, resetEmail)
        setShowPasswordResetWarning(true)
        toast.warning('비밀번호 재설정이 완료되지 않았습니다')
      }
    }
  }, [mounted, user, authLoading, setPasswordResetInProgress])

  // 로딩 중 - 타임아웃 추가
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">이 페이지에 접근하려면 로그인해주세요.</p>
          <Link href="/login">
            <Button>로그인하기</Button>
          </Link>
        </div>
      </div>
    )
  }

  // 비밀번호 재설정 경고 모달
  if (showPasswordResetWarning) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-yellow-600 text-xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              비밀번호 재설정이 완료되지 않았습니다
            </h2>
            <p className="text-gray-600 mb-4">
              비밀번호 재설정을 완료하지 않고 다른 페이지로 이동했습니다.
              계속해서 새 비밀번호를 설정해주세요.
            </p>
            <div className="space-y-3">
              <Link href="/reset-password">
                <Button className="w-full">
                  비밀번호 재설정 계속하기
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  localStorage.removeItem('passwordResetInProgress')
                  localStorage.removeItem('passwordResetEmail')
                  clearPasswordResetState()
                  setShowPasswordResetWarning(false)
                  toast.success('비밀번호 재설정을 나중에 진행할 수 있습니다')
                }}
              >
                나중에 하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
