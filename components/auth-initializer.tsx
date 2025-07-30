"use client"

import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

export default function AuthInitializer() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return null // 이 컴포넌트는 UI를 렌더링하지 않음
}
