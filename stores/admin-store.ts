"use client"

import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AdminState {
  adminUser: User | null
  loading: boolean
  initialized: boolean

  // Actions
  setAdminUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void

  // Initialize admin auth
  initializeAdminAuth: () => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  adminUser: null,
  loading: true,
  initialized: false,

  setAdminUser: (user) => set({ adminUser: user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  initializeAdminAuth: async () => {
    const supabase = createClient()

    try {
      set({ loading: true })

      // 현재 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // 사용자의 role 확인 (role_id 사용)
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role, role_id')
          .eq('id', session.user.id)
          .single()

        if (!error && profile && (profile.role === 'admin' || profile.role_id === 2)) {
          console.log('🔐 관리자 권한 확인됨:', session.user.email, 'Role:', profile.role, 'Role ID:', profile.role_id)
          set({ adminUser: session.user })
        } else {
          console.log('👤 일반 사용자:', session.user.email, 'Role:', profile?.role || 'undefined', 'Role ID:', profile?.role_id)
          set({ adminUser: null })
        }
      } else {
        set({ adminUser: null })
      }

      // 인증 상태 변경 구독
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Admin auth state changed:', event, session?.user?.email)

          if (session?.user) {
            // 사용자의 role 확인 (role_id 사용)
            const { data: profile, error } = await supabase
              .from('user_profiles')
              .select('role, role_id')
              .eq('id', session.user.id)
              .single()

            if (!error && profile && (profile.role === 'admin' || profile.role_id === 2)) {
              console.log('🔐 관리자 권한 확인됨 (상태 변경):', session.user.email, 'Role:', profile.role, 'Role ID:', profile.role_id)
              set({ adminUser: session.user })
            } else {
              console.log('👤 일반 사용자 (상태 변경):', session.user.email, 'Role:', profile?.role || 'undefined', 'Role ID:', profile?.role_id)
              set({ adminUser: null })
            }
          } else {
            set({ adminUser: null })
          }

          set({ loading: false })
        }
      )

      set({ loading: false, initialized: true })

      // Store subscription reference for cleanup (if needed later)
      // Note: subscription cleanup should be handled in component unmount
    } catch (error) {
      console.error('Admin auth initialization error:', error)
      set({ loading: false, initialized: true })
    }
  },
}))
