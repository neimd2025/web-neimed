"use client"

import { businessCardAPI, userProfileAPI } from '@/lib/supabase/database'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // 현재 사용자 가져오기
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 이메일 리다이렉트 제거 - 코드 인증 방식 사용
      }
    })

    // 회원가입 성공 시 자동으로 프로필과 비즈니스 카드 생성
    if (!error && data.user) {
      try {
        // 사용자 프로필 생성
        await userProfileAPI.createUserProfile({
          id: data.user.id,
          name: name || '',
          email: email,
          phone: '',
          company: '',
          position: '',
          bio: '',
          mbti: '',
          keywords: [],
          profile_image_url: null,
          is_public: true
        })

        // 비즈니스 카드 생성
        await businessCardAPI.createBusinessCard({
          user_id: data.user.id,
          name: name || '',
          email: email,
          phone: '',
          company: '',
          position: '',
          bio: '',
          profile_image_url: null,
          qr_code_url: null,
          is_public: true
        })

        console.log('✅ 사용자 프로필과 비즈니스 카드가 자동으로 생성되었습니다.')
      } catch (profileError) {
        console.error('⚠️ 프로필 생성 중 오류:', profileError)
        // 프로필 생성 실패해도 회원가입은 성공으로 처리
      }
    }

    return { data, error }
  }

  const signInWithOAuth = async (provider: 'google' | 'kakao') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback`,
      }
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/')
    }
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback`,
    })
    return { error }
  }

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    resetPassword,
  }
}
