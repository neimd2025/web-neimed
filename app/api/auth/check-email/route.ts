import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, isAdmin = false } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 서버 사이드에서 직접 Supabase 클라이언트 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // user_profiles 테이블에서 이메일 존재 여부 확인
    const { data: existingProfile, error } = await supabase
      .from('user_profiles')
      .select('email, role_id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      // 관리자 회원가입인 경우 기존 사용자의 역할 확인
      if (isAdmin) {
        // roles 테이블에서 관리자 역할 ID 확인
        const { data: adminRole } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'admin')
          .single()

        if (adminRole && existingProfile.role_id === adminRole.id) {
          return NextResponse.json({
            isTaken: true,
            message: '이미 관리자로 가입된 이메일입니다.'
          })
        } else {
          // 일반 사용자이므로 관리자로 업그레이드 가능
          return NextResponse.json({
            isTaken: false,
            canUpgrade: true,
            message: '기존 사용자입니다. 관리자로 업그레이드할 수 있습니다.'
          })
        }
      } else {
        // 일반 회원가입인 경우
        return NextResponse.json({
          isTaken: true,
          message: '이미 가입된 이메일입니다.'
        })
      }
    }

    // 새 사용자인 경우
    return NextResponse.json({
      isTaken: false,
      canUpgrade: false,
      message: '사용 가능한 이메일입니다.'
    })

  } catch (error) {
    console.error('❌ 이메일 중복 확인 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
