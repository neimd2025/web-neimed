"use client"

import { useAuthStore } from '@/stores/auth-store'
import { useEffect, useState } from 'react'

export default function AuthInitializer() {
  const { initializeAuth } = useAuthStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    initializeAuth()
  }, [initializeAuth])

  // 서버사이드 렌더링 중에는 아무것도 렌더링하지 않음
  if (!isClient) {
    return null
  }

  return null // 이 컴포넌트는 UI를 렌더링하지 않음
}
