"use client"

import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

export const useAuth = () => {
  const store = useAuthStore()

  useEffect(() => {
    // 5초 후에도 로딩 중이면 강제 초기화
    const timeout = setTimeout(() => {
      if (store.loading && !store.initialized) {
        console.warn('Auth loading timeout - forcing initialization')
        store.setLoading(false)
        store.setInitialized(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [store.loading, store.initialized, store])

  return store
}
