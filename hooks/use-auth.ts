"use client"

import { useAuthStore } from '@/stores/auth-store'
import { useEffect, useRef } from 'react'

export const useAuth = () => {
  const store = useAuthStore()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // 타임아웃 정리
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // 로딩 상태가 완료될 때까지 기다림
  // 타임아웃을 추가하여 무한 로딩 방지
  if (store.loading && !store.initialized) {
    // 기존 타임아웃이 없는 경우에만 새로 설정
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (store.loading) {
          console.warn('Auth loading timeout - forcing initialization')
          store.setLoading(false)
          store.setInitialized(true)
        }
        timeoutRef.current = undefined
      }, 5000) // 5초로 단축
    }

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
