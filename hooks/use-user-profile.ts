import { userProfileAPI } from '@/lib/supabase/database'
import { Database } from '@/types/supabase'
import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export const useUserProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 프로필 로드
  const loadProfile = async () => {
    if (!user?.id) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const userProfile = await userProfileAPI.getUserProfile(user.id)

      if (userProfile) {
        setProfile(userProfile)
      } else {
        // 프로필이 없는 경우 null로 설정 (오류가 아님)
        setProfile(null)
        console.log('사용자 프로필이 아직 생성되지 않았습니다.')
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
      setError('프로필을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 프로필 생성
  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      throw new Error('사용자가 로그인되지 않았습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      const newProfile = await userProfileAPI.createUserProfile({
        id: user.id,
        ...profileData
      })

      if (newProfile) {
        setProfile(newProfile)
        return newProfile
      } else {
        throw new Error('프로필 생성에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error creating profile:', err)
      setError('프로필 생성에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

    // 프로필 업데이트
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      throw new Error('사용자가 로그인되지 않았습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      // 클라이언트에서 직접 업데이트
      const updatedProfile = await userProfileAPI.updateUserProfile(user.id, updates)

      if (updatedProfile) {
        setProfile(updatedProfile)
        return updatedProfile
      } else {
        throw new Error('프로필 업데이트에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('프로필 업데이트에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 프로필 삭제
  const deleteProfile = async () => {
    if (!user?.id) {
      throw new Error('사용자가 로그인되지 않았습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      const success = await userProfileAPI.deleteUserProfile(user.id)

      if (success) {
        setProfile(null)
        return true
      } else {
        throw new Error('프로필 삭제에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error deleting profile:', err)
      setError('프로필 삭제에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 사용자 표시 이름 가져오기
  const getDisplayName = () => {
    if (!profile) {
      if (user?.user_metadata?.full_name) {
        return user.user_metadata.full_name
      }
      if (user?.user_metadata?.nickname) {
        return user.user_metadata.nickname
      }
      if (user?.email) {
        return user.email.split('@')[0]
      }
      return '사용자'
    }

    return profile.full_name || profile.nickname || user?.email?.split('@')[0] || '사용자'
  }

  // 사용자 이니셜 가져오기
  const getInitial = () => {
    const name = getDisplayName()
    return name.charAt(0).toUpperCase()
  }

  // 프로필이 완성되었는지 확인
  const isProfileComplete = () => {
    if (!profile) return false

    return !!(
      profile.full_name &&
      profile.email &&
      profile.company &&
      profile.role
    )
  }

  // 초기 로드
  useEffect(() => {
    loadProfile()
  }, [user?.id])

  return {
    profile,
    loading,
    error,
    loadProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    getDisplayName,
    getInitial,
    isProfileComplete
  }
}
