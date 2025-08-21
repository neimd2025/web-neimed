"use client"

import { useAuth } from '@/hooks/use-auth'
import { useUserProfile } from '@/hooks/use-user-profile'
import { createContext, ReactNode, useContext } from 'react'

interface LoadingContextType {
  isLoading: boolean
  authLoading: boolean
  profileLoading: boolean
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  authLoading: true,
  profileLoading: true
})

export const useLoading = () => useContext(LoadingContext)

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const { loading: authLoading, initialized: authInitialized } = useAuth()
  const { loading: profileLoading } = useUserProfile()

  const isLoading = authLoading || !authInitialized || profileLoading

  return (
    <LoadingContext.Provider value={{ isLoading, authLoading, profileLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
