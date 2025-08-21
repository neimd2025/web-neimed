import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 이름이 필요합니다.' },
        { status: 400 }
      )
    }

    // 서버 사이드에서 직접 Supabase 클라이언트 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. 기존 사용자로 로그인
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 2. 관리자 역할 ID 가져오기
    const { data: adminRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single()

    if (!adminRole) {
      return NextResponse.json(
        { error: '관리자 역할이 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 3. user_profiles 테이블에서 관리자로 업데이트
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        role: 'admin',
        role_id: adminRole.id,
        full_name: name,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    if (updateError) {
      console.error('프로필 업데이트 오류:', updateError)
      return NextResponse.json(
        { error: '관리자 권한 부여 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 4. 사용자 메타데이터 업데이트
    const { error: metadataError } = await supabase.auth.admin.updateUserById(
      signInData.user.id,
      {
        user_metadata: {
          full_name: name,
          isAdmin: true
        }
      }
    )

    if (metadataError) {
      console.error('메타데이터 업데이트 오류:', metadataError)
      return NextResponse.json(
        { error: '사용자 정보 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '성공적으로 관리자로 업그레이드되었습니다.'
    })

  } catch (error) {
    console.error('❌ 관리자 업그레이드 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
