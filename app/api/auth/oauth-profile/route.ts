import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ 인증 오류:', authError)
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      )
    }

    console.log('📝 OAuth 사용자 프로필 생성/확인:', user.email)

    // 기존 프로필 확인
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      console.log('✅ 기존 프로필 존재:', existingProfile.id)
      return NextResponse.json({ success: true, profile: existingProfile })
    }

    // 프로필이 없는 경우 생성
    if (profileError?.code === 'PGRST116') {
      const userMetadata = user.user_metadata || {}
      const appMetadata = user.app_metadata || {}
      
      // OAuth 제공자 정보 추출
      const provider = appMetadata.provider || 'email'
      const fullName = userMetadata.full_name || userMetadata.name || userMetadata.display_name || ''
      const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null

      console.log('🔍 OAuth 사용자 메타데이터:', {
        provider,
        fullName,
        email: user.email,
        avatarUrl,
        userMetadata,
        appMetadata
      })

      const profileData = {
        id: user.id,
        email: user.email || '',
        full_name: fullName,
        nickname: fullName.split(' ')[0] || fullName || '사용자',
        profile_image_url: avatarUrl,
        role_id: 1, // 일반 사용자 (roles 테이블의 user role)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📝 프로필 생성 데이터:', profileData)

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (createError) {
        console.error('❌ 프로필 생성 실패:', createError)
        return NextResponse.json(
          { error: '프로필 생성에 실패했습니다.' },
          { status: 500 }
        )
      }

      console.log('✅ OAuth 사용자 프로필 생성 완료:', newProfile.id)
      return NextResponse.json({ 
        success: true, 
        profile: newProfile,
        isNewUser: true 
      })
    }

    // 다른 에러인 경우
    console.error('❌ 프로필 확인 중 오류:', profileError)
    return NextResponse.json(
      { error: '프로필 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )

  } catch (error) {
    console.error('❌ OAuth 프로필 처리 중 예외 발생:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}