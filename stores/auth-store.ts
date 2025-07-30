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
      console.log(`👤 사용자 권한 확인: ${profile.role} (ID: ${profile.role_id}) - ${isAdmin ? '관리자' : '일반사용자'}`)
    } else {
      console.log('❌ 사용자 권한 확인 실패:', error)
    }
  } catch (error) {
    console.error('권한 확인 중 오류:', error)
  }
}

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean

  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void

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
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

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

    if (!error && data.user) {
      set({ user: data.user, session: data.session })
    }

    return { data, error }
  },

  signUpWithEmail: async (email: string, password: string, name?: string, isAdmin: boolean = false) => {
    const supabase = createClient()

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        data: null,
        error: { message: '올바른 이메일 형식을 입력해주세요.' }
      }
    }

    // 비밀번호 강도 검증
    if (password.length < 6) {
      return {
        data: null,
        error: { message: '비밀번호는 최소 6자 이상이어야 합니다.' }
      }
    }

    // 이름 검증
    if (!name || name.trim().length < 2) {
      return {
        data: null,
        error: { message: '이름은 2자 이상 입력해주세요.' }
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          isAdmin: isAdmin
        }
      }
    })

    // Supabase 에러 코드별 구체적인 메시지 처리
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

    // 회원가입 성공 시 자동으로 프로필과 비즈니스 카드 생성
    if (!error && data.user) {
      try {
        // 관리자 이메일 목록
        const adminEmails = [
          'admin@named.com',
          'simjaehyeong@gmail.com',
          'test@admin.com'
        ]

        const userRole = isAdmin || adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user'
        const roleId = userRole === 'admin' ? 2 : 1 // admin: 2, user: 1

        // 클라이언트에서 직접 프로필 생성
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            full_name: name || '',
            email: email,
            contact: '',
            company: '',
            role: userRole, // 기존 호환성을 위해 유지
            role_id: roleId, // 새로운 참조 관계
            introduction: '',
            mbti: '',
            keywords: [],
            profile_image_url: null,
            qr_code_url: null
          })

        if (profileError) {
          console.error('⚠️ 프로필 생성 실패:', profileError)
        } else {
          console.log(`✅ 사용자 프로필이 자동으로 생성되었습니다. (Role: ${userRole})`)
        }

        // 비즈니스 카드 생성
        const { error: cardError } = await supabase
          .from('business_cards')
          .insert({
            user_id: data.user.id,
            full_name: name || '',
            email: email,
            contact: '',
            company: '',
            role: '',
            introduction: '',
            profile_image_url: null,
            qr_code_url: null,
            is_public: true
          })

        if (cardError) {
          console.error('⚠️ 비즈니스 카드 생성 실패:', cardError)
        } else {
          console.log('✅ 비즈니스 카드가 자동으로 생성되었습니다.')
        }
      } catch (profileError) {
        console.error('⚠️ 프로필/카드 생성 중 오류:', profileError)
      }
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
      set({ user: null, session: null })
    }

    return { error }
  },

  initializeAuth: async () => {
    const supabase = createClient()

    try {
      set({ loading: true })

      // 현재 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        set({ user: session.user, session })
        // 권한 확인 로그 추가
        await checkUserRole(session.user.id)
      }

      // 인증 상태 변경 구독
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state changed:', event, session?.user?.email)

          if (session) {
            set({ user: session.user, session })
            // 권한 확인 로그 추가
            await checkUserRole(session.user.id)
          } else {
            set({ user: null, session: null })
          }

          set({ loading: false })
        }
      )

      set({ loading: false, initialized: true })

      // Cleanup subscription on unmount
      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ loading: false, initialized: true })
    }
  },
}))
