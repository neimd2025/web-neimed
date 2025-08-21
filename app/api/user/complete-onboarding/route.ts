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

    console.log('📝 온보딩 완료 처리:', user.email)

    // 기존 프로필 확인
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, full_name, personality_keywords')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 온보딩 완료 상태를 나타내는 더미 데이터 추가 (프로필이 없는 경우에만)
    if (!existingProfile.full_name || !existingProfile.personality_keywords || existingProfile.personality_keywords.length === 0) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          // 더미 데이터로 온보딩 완료 상태 표시
          full_name: existingProfile.full_name || '사용자',
          personality_keywords: ['onboarding_completed'], // 온보딩 완료 마커
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('❌ 프로필 업데이트 실패:', updateError)
        return NextResponse.json(
          { error: '온보딩 완료 처리에 실패했습니다.' },
          { status: 500 }
        )
      }

      console.log('✅ 온보딩 완료 처리 완료:', user.email)
    }

    return NextResponse.json({ 
      success: true,
      message: '온보딩이 완료되었습니다.' 
    })

  } catch (error) {
    console.error('❌ 온보딩 완료 처리 중 예외 발생:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}