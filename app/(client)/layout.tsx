"use client"

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useProfile } from '@/hooks/use-profile'
import { useBusinessCard } from '@/hooks/use-business-card'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading, needsOnboarding } = useProfile()
  const { businessCard, loading: cardLoading, needsBusinessCard } = useBusinessCard()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // 클라이언트 마운트 확인
  if (typeof window !== 'undefined' && !mounted) {
    setMounted(true)
  }

  // 온보딩 및 명함 생성 리다이렉트 로직
  useEffect(() => {
    if (mounted && user && !profileLoading && !cardLoading) {
      const isOnboardingRoute = pathname.startsWith('/onboarding')
      const isNamecardEditRoute = pathname.startsWith('/namecard/edit')
      
      // 프로필이 필요한 경우
      if (needsOnboarding && !isOnboardingRoute && !isNamecardEditRoute) {
        router.push('/onboarding')
        return
      }
      
      // 프로필은 있지만 명함이 필요한 경우
      if (!needsOnboarding && needsBusinessCard && !isNamecardEditRoute && !isOnboardingRoute) {
        router.push('/namecard/edit')
        return
      }
    }
  }, [mounted, user, profileLoading, cardLoading, needsOnboarding, needsBusinessCard, pathname, router])

  // 로딩 중
  if (!mounted || loading || (user && (profileLoading || cardLoading))) {
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

  return <>{children}</>
}
