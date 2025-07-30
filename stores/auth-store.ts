import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  birthDate: string
  gender: string
  job: string
  company: string
  mbti: string
  personality: string[]
  interests: string[]
  skills: string[]
  profileImage?: string
  bio?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

// 더미 사용자 데이터
const dummyUser: User = {
  id: "1",
  name: "허수정",
  email: "heosujeong@neimd.com",
  birthDate: "1999-03-15",
  gender: "여성",
  job: "기획자",
  company: "Named",
  mbti: "ENTJ",
  personality: ["리더십", "진취적", "추진력"],
  interests: ["창업", "자기계발", "지속가능성"],
  skills: ["기획", "스타트업"],
  bio: "허무하지 않은 의미있게",
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true })

        // 더미 로그인 로직 (실제로는 API 호출)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (email === "test@neimd.com" && password === "password") {
          set({ user: dummyUser, isLoading: false })
          return true
        }

        set({ isLoading: false })
        return false
      },

      logout: () => {
        set({ user: null })
      },

      updateProfile: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          set({ user: updatedUser })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'named_auth', // localStorage key
      partialize: (state) => ({ user: state.user }), // 사용자 정보만 저장
    }
  )
)