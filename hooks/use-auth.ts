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
  }, []) // store 의존성 제거

  // 로딩 상태가 완료될 때까지 기다림
  if (store.loading && !store.initialized) {
    return {
      ...store,
      user: null,
      session: null,
      adminUser: null,
      isAdmin: false
    }
  }

  return store
}
