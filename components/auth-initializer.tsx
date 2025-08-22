"use client"

import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

export default function AuthInitializer() {
  const { initializeAuth, initialized } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initializeAuth()
    }
  }, [initializeAuth, initialized])

  return null
}
