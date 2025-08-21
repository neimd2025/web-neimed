'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔄 OAuth 콜백 페이지 진입')
      
      try {
        const supabase = createClient()

        // URL 해시 확인
        console.log('🔍 현재 URL:', window.location.href)
        console.log('🔍 URL 해시:', window.location.hash)
        
        // URL 해시에서 토큰을 처리
        if (window.location.hash) {
          console.log('🔄 URL 해시에서 토큰 교환 시작')
          const { data: authData, error: authError } = await supabase.auth.getSession()
          
          if (authError) {
            console.error('❌ 토큰 교환 실패:', authError)
          } else {
            console.log('✅ 토큰 교환 성공')
          }
        }
        
        // 최종 세션 확인
        const { data, error } = await supabase.auth.getSession()
        console.log('📊 최종 세션 데이터:', data)
        console.log('📊 최종 세션 에러:', error)

        if (error) {
          console.error('❌ OAuth 콜백 처리 실패:', error)
          setError(error.message)
          toast.error('로그인 처리 중 오류가 발생했습니다.')
          
          // 3초 후 로그인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/login')
          }, 3000)
          return
        }

        if (data.session && data.session.user) {
          console.log('✅ OAuth 로그인 성공:', data.session.user.email)
          console.log('👤 사용자 메타데이터:', data.session.user.user_metadata)
          console.log('🔑 앱 메타데이터:', data.session.user.app_metadata)
          
          // OAuth 프로필 처리 API 호출
          console.log('📞 OAuth 프로필 처리 API 호출 시작')
          
          const profileResponse = await fetch('/api/auth/oauth-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          console.log('📞 API 응답 상태:', profileResponse.status)
          console.log('📞 API 응답 상태 텍스트:', profileResponse.statusText)

          if (!profileResponse.ok) {
            const error = await profileResponse.json()
            console.error('❌ 프로필 처리 실패:', error)
            console.error('❌ 응답 상태:', profileResponse.status)
            toast.error('프로필 처리에 실패했습니다.')
          } else {
            const result = await profileResponse.json()
            console.log('✅ API 응답 성공:', result)
            
            if (result.isNewUser) {
              console.log('✅ OAuth 신규 사용자 프로필 생성 완료')
              toast.success('환영합니다! 프로필이 생성되었습니다.')
            } else {
              console.log('✅ OAuth 기존 사용자 로그인 완료')
            }
          }

          toast.success('로그인되었습니다!')
          router.push('/home')
        } else {
          console.log('⚠️ 세션 정보가 없습니다.')
          setError('세션 정보를 찾을 수 없습니다.')
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
      } catch (error) {
        console.error('❌ OAuth 콜백 처리 중 예외 발생:', error)
        setError('로그인 처리 중 오류가 발생했습니다.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900">
              로그인 처리 중...
            </h1>
            <p className="text-gray-600">
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4 px-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xl">!</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900">
              로그인 실패
            </h1>
            <p className="text-gray-600 text-sm">
              {error}
            </p>
            <p className="text-gray-500 text-sm">
              자동으로 로그인 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}