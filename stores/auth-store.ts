import { ROLE_IDS, ROLE_NAMES } from '@/lib/constants'
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
      const isAdmin = profile.role === ROLE_NAMES.ADMIN || profile.role_id === ROLE_IDS.ADMIN
      return { profile, isAdmin }
    } else {
      return { profile: null, isAdmin: false }
    }
  } catch (error) {
    return { profile: null, isAdmin: false }
  }
}

// OAuth 사용자 프로필 자동 생성 함수
const ensureUserProfile = async (user: any) => {
  const supabase = createClient()
  try {
    // 기존 프로필 확인
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      console.log('✅ 기존 프로필 존재:', existingProfile.id)
      return
    }

    // 프로필이 없는 경우 생성 (OAuth 사용자)
    if (profileError?.code === 'PGRST116') {
      console.log('📝 OAuth 사용자 프로필 자동 생성 시작:', user.email)
      
      const userMetadata = user.user_metadata || {}
      const appMetadata = user.app_metadata || {}
      const provider = appMetadata.provider || 'email'
      
      // OAuth 사용자만 자동 생성 (이메일 가입은 제외)
      if (provider !== 'email') {
        const fullName = userMetadata.full_name || userMetadata.name || userMetadata.display_name || '사용자'
        const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null

        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: fullName,
            nickname: fullName.split(' ')[0] || fullName || '사용자',
            profile_image_url: avatarUrl,
            role_id: 1, // 일반 사용자
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (createError) {
          console.error('❌ OAuth 프로필 자동 생성 실패:', createError)
        } else {
          console.log('✅ OAuth 프로필 자동 생성 완료:', user.email)
        }
      }
    }
  } catch (error) {
    console.error('❌ 프로필 확인/생성 중 오류:', error)
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
  passwordResetInProgress: boolean
  passwordResetEmail: string | null

  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  setAdminUser: (user: User | null) => void
  setIsAdmin: (isAdmin: boolean) => void
  setAdminLoading: (loading: boolean) => void
  setAdminInitialized: (initialized: boolean) => void
  setPasswordResetInProgress: (inProgress: boolean, email?: string) => void
  clearPasswordResetState: () => void

  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<{ data: any; error: any }>
  signUpWithEmail: (email: string, password: string, name?: string, isAdmin?: boolean) => Promise<{ data: any; error: any }>
  signInWithOAuth: (provider: 'google' | 'kakao' | 'naver') => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>

  // Role switching
  switchToUserMode: () => void
  switchToAdminMode: () => void

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
  passwordResetInProgress: false,
  passwordResetEmail: null,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  setAdminUser: (user) => set({ adminUser: user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setAdminLoading: (loading) => set({ adminLoading: loading }),
  setAdminInitialized: (initialized) => set({ adminInitialized: initialized }),
  setPasswordResetInProgress: (inProgress, email) => set({
    passwordResetInProgress: inProgress,
    passwordResetEmail: email || null
  }),
  clearPasswordResetState: () => set({
    passwordResetInProgress: false,
    passwordResetEmail: null
  }),

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
        data: {
          name: name || '',
          isAdmin: isAdmin || false
        }
      }
    })

    console.log('📧 회원가입 결과:', {
      success: !error,
      user: data?.user?.email,
      error: error?.message
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
      console.log('✅ 회원가입 성공. 이메일 인증을 완료해주세요.')
      console.log('📧 이메일 인증 메일이 발송되었습니다. 스팸함도 확인해주세요.')
    }

    return { data, error }
  },

  signInWithOAuth: async (provider: 'google' | 'kakao' | 'naver') => {
    const supabase = createClient()
    
    // 네이버는 직접적으로 지원되지 않으므로 커스텀 구현 필요
    if (provider === 'naver') {
      // 네이버 로그인은 별도 처리 (네이버 개발자 센터에서 앱 등록 필요)
      console.warn('네이버 로그인은 추가 설정이 필요합니다.')
      return { error: { message: '네이버 로그인 기능은 준비 중입니다.' } }
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
          console.log('Auth state change:', event, session?.user?.email)

          if (session) {
            set({ user: session.user, session })
            
            // OAuth 사용자인 경우 프로필 자동 생성
            if (event === 'SIGNED_IN') {
              await ensureUserProfile(session.user)
            }
            
            const { isAdmin } = await checkUserRole(session.user.id)
            set({ adminUser: isAdmin ? session.user : null, isAdmin, adminLoading: false, adminInitialized: true })
          } else {
            set({ user: null, session: null, adminUser: null, isAdmin: false, adminLoading: false, adminInitialized: true })
          }
          set({ loading: false, initialized: true })
        }
      )

      // 초기 세션이 없는 경우에도 로딩 상태 해제
      set({ loading: false, initialized: true })

      // Cleanup subscription on unmount
      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Auth initialization error:', error)
      // 에러 발생 시에도 로딩 상태 해제
      set({ loading: false, initialized: true, adminLoading: false, adminInitialized: true })
    }
  },

  // 일반 사용자 모드로 전환
  switchToUserMode: () => {
    const state = get()
    // 관리자 정보는 유지하되, 현재 사용자 정보를 일반 사용자로 설정
    if (state.adminUser) {
      set({
        user: state.adminUser,
        session: state.session,
        isAdmin: false
      })
    }
  },

  // 관리자 모드로 전환
  switchToAdminMode: () => {
    const state = get()
    // 관리자 권한이 있는 경우에만 전환
    if (state.adminUser) {
      set({
        user: state.adminUser,
        session: state.session,
        isAdmin: true
      })
    }
  },
}))
