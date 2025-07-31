import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

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
      .select('email')
      .eq('email', email)
      .single()

    const isTaken = !!existingProfile

    return NextResponse.json({
      isTaken,
      message: isTaken ? '이미 가입된 이메일입니다.' : '사용 가능한 이메일입니다.'
    })

  } catch (error) {
    console.error('❌ 이메일 중복 확인 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
