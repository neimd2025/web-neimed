import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, isAdmin } = await request.json()

    console.log('API 호출됨:', { userId, email, name, isAdmin })

    // 환경 변수 확인
    console.log('환경 변수 확인:')
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SERVICE_ROLE_KEY 존재:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

            let supabase
    try {
      supabase = await createClient()
      console.log('Supabase 클라이언트 생성됨')
    } catch (error) {
      console.error('Supabase 클라이언트 생성 오류:', error)
      return NextResponse.json({
        error: 'Supabase 클라이언트 생성 실패',
        details: error
      }, { status: 500 })
    }

    // 관리자 이메일 목록 (실제 운영 시에는 환경변수로 관리)
    const adminEmails = [
      'admin@named.com',
      'simjaehyeong@gmail.com',
      'test@admin.com'
    ]

    // 관리자 회원가입이거나 관리자 이메일인 경우 admin role 설정
    const userRole = isAdmin || adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user'

    // 사용자 프로필 생성
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        full_name: name || '',
        email: email,
        contact: '',
        company: '',
        role: userRole,
        introduction: '',
        mbti: '',
        keywords: [],
        profile_image_url: null,
        qr_code_url: null
      })

    if (profileError) {
      console.error('프로필 생성 오류:', profileError)
      return NextResponse.json({ error: '프로필 생성 실패', details: profileError }, { status: 500 })
    }

    // 비즈니스 카드 생성
    const { error: cardError } = await supabase
      .from('business_cards')
      .insert({
        user_id: userId,
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
      console.error('비즈니스 카드 생성 오류:', cardError)
      return NextResponse.json({ error: '비즈니스 카드 생성 실패', details: cardError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '프로필과 비즈니스 카드가 생성되었습니다.',
      role: userRole
    })

  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json({ error: '서버 오류', details: error }, { status: 500 })
  }
}
