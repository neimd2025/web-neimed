"use client"

import { useAuthStore } from '@/stores/auth-store'
import { useEffect, useRef } from 'react'

export const useAuth = () => {
  const store = useAuthStore()
  const initializedRef = useRef(false)

  useEffect(() => {
    // 컴포넌트 마운트시 한 번만 실행
    if (!initializedRef.current) {
      initializedRef.current = true
      store.initializeAuth()
    }
  }, [])

  return store
}
