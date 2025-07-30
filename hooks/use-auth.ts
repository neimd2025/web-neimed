"use client"

import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

export const useAuth = () => {
  const {
    user,
    session,
    loading,
    initialized,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    initializeAuth
  } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initializeAuth()
    }
  }, [initialized, initializeAuth])

  return {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
  }
}
