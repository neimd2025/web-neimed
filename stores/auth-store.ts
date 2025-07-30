import { createClient } from '@/utils/supabase/client'
import { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'

// 권한 확인 함수
const checkUserRole = async (userId: string) => {
  const supabase = createClient()
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, role_id')
      .eq('id', userId)
      .single()

    if (!error && profile) {
      const isAdmin = profile.role === 'admin' || profile.role_id === 2
      return { profile, isAdmin }
    } else {
      return { profile: null, isAdmin: false }
    }
  } catch (error) {
    return { profile: null, isAdmin: false }
  }
}

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  adminUser: User | null
  isAdmin: boolean
  adminLoading: boolean
  adminInitialized: boolean

  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  setAdminUser: (user: User | null) => void
  setIsAdmin: (isAdmin: boolean) => void
  setAdminLoading: (loading: boolean) => void
  setAdminInitialized: (initialized: boolean) => void

  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<{ data: any; error: any }>
  signUpWithEmail: (email: string, password: string, name?: string, isAdmin?: boolean) => Promise<{ data: any; error: any }>
  signInWithOAuth: (provider: 'google' | 'kakao') => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>

  // Initialize auth
  initializeAuth: () => Promise<(() => void) | undefined>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true, // 초기 로딩 상태를 true로 설정
  initialized: false,
  adminUser: null,
  isAdmin: false,
  adminLoading: true, // 초기 admin 로딩 상태를 true로 설정
  adminInitialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  setAdminUser: (user) => set({ adminUser: user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setAdminLoading: (loading) => set({ adminLoading: loading }),
  setAdminInitialized: (initialized) => set({ adminInitialized: initialized }),

  signInWithEmail: async (email: string, password: string) => {
    const supabase = createClient()

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        data: null,
        error: { message: '올바른 이메일 형식을 입력해주세요.' }
      }
    }

    // 비밀번호 검증
    if (!password || password.length === 0) {
      return {
        data: null,
        error: { message: '비밀번호를 입력해주세요.' }
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Supabase 에러 코드별 구체적인 메시지 처리
    if (error) {
      let errorMessage = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'

      switch (error.message) {
        case 'Invalid login credentials':
        case 'Invalid email or password':
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.'
          break
        case 'Email not confirmed':
          errorMessage = '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.'
          break
        case 'User not found':
          errorMessage = '가입되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.'
          break
        case 'Too many requests':
          errorMessage = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
          break
        default:
          if (error.message.includes('email')) {
            errorMessage = '올바른 이메일 형식을 입력해주세요.'
          } else if (error.message.includes('password')) {
            errorMessage = '비밀번호를 확인해주세요.'
          }
      }

      return { data, error: { ...error, message: errorMessage } }
    }

    return { data, error }
  },

  signUpWithEmail: async (email: string, password: string, name?: string, isAdmin?: boolean) => {
    const supabase = createClient()

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        data: null,
        error: { message: '올바른 이메일 형식을 입력해주세요.' }
      }
    }

    // 비밀번호 검증
    if (!password || password.length < 6) {
      return {
        data: null,
        error: { message: '비밀번호는 최소 6자 이상이어야 합니다.' }
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.'

      switch (error.message) {
        case 'User already registered':
        case 'A user with this email address has already been registered':
          errorMessage = '이미 가입된 이메일입니다. 로그인을 시도해주세요.'
          break
        case 'Password should be at least 6 characters':
          errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.'
          break
        case 'Invalid email':
          errorMessage = '올바른 이메일 형식을 입력해주세요.'
          break
        default:
          if (error.message.includes('email')) {
            errorMessage = '올바른 이메일 형식을 입력해주세요.'
          } else if (error.message.includes('password')) {
            errorMessage = '비밀번호를 확인해주세요.'
          }
      }

      return { data, error: { ...error, message: errorMessage } }
    }

    // 회원가입 성공 시 이메일 인증 대기
    if (!error && data.user) {
      // 이메일 인증이 완료된 후에 프로필과 비즈니스 카드를 생성하도록 변경
      // 인증 완료는 /verify 페이지에서 처리됨
      console.log('✅ 회원가입 성공. 이메일 인증을 완료해주세요.')
      // 세션을 설정하지 않음 - 인증 완료 후에 설정됨
    }

    return { data, error }
  },

  signInWithOAuth: async (provider: 'google' | 'kakao') => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback`,
      }
    })
    return { error }
  },

  signOut: async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (!error) {
      set({ user: null, session: null, adminUser: null, isAdmin: false })
    }

    return { error }
  },

  initializeAuth: async () => {
    const supabase = createClient()

    try {
      set({ loading: true, adminLoading: true })

      // 현재 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        set({ user: session.user, session })
        // 관리자 권한 동기화
        const { isAdmin } = await checkUserRole(session.user.id)
        set({ adminUser: isAdmin ? session.user : null, isAdmin, adminLoading: false, adminInitialized: true })
      } else {
        set({ user: null, session: null, adminUser: null, isAdmin: false, adminLoading: false, adminInitialized: true })
      }

      // onAuthStateChange 구독 추가 - 실시간 상태 변경 감지
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session) {
            set({ user: session.user, session })
            const { isAdmin } = await checkUserRole(session.user.id)
            set({ adminUser: isAdmin ? session.user : null, isAdmin, adminLoading: false, adminInitialized: true })
          } else {
            set({ user: null, session: null, adminUser: null, isAdmin: false, adminLoading: false, adminInitialized: true })
          }
          set({ loading: false, initialized: true })
        }
      )

      set({ loading: false, initialized: true })

      // Cleanup subscription on unmount
      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ loading: false, initialized: true, adminLoading: false, adminInitialized: true })
    }
  },
}))
