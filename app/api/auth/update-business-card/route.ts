import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const { cardId, updates } = await request.json()

    console.log('비즈니스 카드 업데이트 API 호출됨:', { cardId, updates })

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

    // 비즈니스 카드 업데이트
    const { data, error } = await supabase
      .from('business_cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      console.error('비즈니스 카드 업데이트 오류:', error)
      return NextResponse.json({
        error: '비즈니스 카드 업데이트 실패',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '비즈니스 카드가 업데이트되었습니다.',
      data: data
    })

  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json({
      error: '서버 오류',
      details: error
    }, { status: 500 })
  }
}
