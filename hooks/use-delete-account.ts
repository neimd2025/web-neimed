"use client"

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export const useDeleteAccount = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteAccount = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      return { success: false, error: '로그인이 필요합니다.' }
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '계정 탈퇴에 실패했습니다.')
      }

      toast.success('계정이 성공적으로 삭제되었습니다.')

      // 로그아웃 처리
      const supabase = (await import('@/utils/supabase/client')).createClient()
      await supabase.auth.signOut()

      // 홈페이지로 리다이렉트
      router.push('/')

      return { success: true }
    } catch (error) {
      console.error('계정 탈퇴 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '계정 탈퇴에 실패했습니다.'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    deleteAccount,
    isDeleting
  }
}
