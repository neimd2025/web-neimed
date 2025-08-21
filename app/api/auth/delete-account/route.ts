import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({
        error: '인증되지 않은 사용자입니다.',
        details: userError
      }, { status: 401 })
    }

    const userId = user.id
    console.log('계정 탈퇴 시작:', { userId, email: user.email })

    // 1단계: 비즈니스 카드 삭제
    console.log('1단계: 비즈니스 카드 삭제 중...')
    const { error: businessCardError } = await supabase
      .from('business_cards')
      .delete()
      .eq('user_id', userId)

    if (businessCardError) {
      console.error('비즈니스 카드 삭제 오류:', businessCardError)
      return NextResponse.json({
        error: '비즈니스 카드 삭제에 실패했습니다.',
        details: businessCardError
      }, { status: 500 })
    }

    // 2단계: 이벤트 참가 기록 삭제
    console.log('2단계: 이벤트 참가 기록 삭제 중...')
    const { error: eventParticipantError } = await supabase
      .from('event_participants')
      .delete()
      .eq('user_id', userId)

    if (eventParticipantError) {
      console.error('이벤트 참가 기록 삭제 오류:', eventParticipantError)
      return NextResponse.json({
        error: '이벤트 참가 기록 삭제에 실패했습니다.',
        details: eventParticipantError
      }, { status: 500 })
    }

    // 3단계: 수집된 명함 삭제
    console.log('3단계: 수집된 명함 삭제 중...')
    const { error: collectedCardError } = await supabase
      .from('collected_cards')
      .delete()
      .eq('collector_id', userId)

    if (collectedCardError) {
      console.error('수집된 명함 삭제 오류:', collectedCardError)
      return NextResponse.json({
        error: '수집된 명함 삭제에 실패했습니다.',
        details: collectedCardError
      }, { status: 500 })
    }

    // 4단계: 알림 삭제
    console.log('4단계: 알림 삭제 중...')
    const { error: notificationError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (notificationError) {
      console.error('알림 삭제 오류:', notificationError)
      return NextResponse.json({
        error: '알림 삭제에 실패했습니다.',
        details: notificationError
      }, { status: 500 })
    }

    // 5단계: 피드백 삭제
    console.log('5단계: 피드백 삭제 중...')
    const { error: feedbackError } = await supabase
      .from('feedback')
      .delete()
      .eq('user_id', userId)

    if (feedbackError) {
      console.error('피드백 삭제 오류:', feedbackError)
      return NextResponse.json({
        error: '피드백 삭제에 실패했습니다.',
        details: feedbackError
      }, { status: 500 })
    }

    // 6단계: 사용자가 생성한 이벤트 삭제
    console.log('6단계: 생성한 이벤트 삭제 중...')
    const { error: eventError } = await supabase
      .from('events')
      .delete()
      .eq('created_by', userId)

    if (eventError) {
      console.error('이벤트 삭제 오류:', eventError)
      return NextResponse.json({
        error: '이벤트 삭제에 실패했습니다.',
        details: eventError
      }, { status: 500 })
    }

    // 7단계: 사용자 프로필 삭제
    console.log('7단계: 사용자 프로필 삭제 중...')
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('사용자 프로필 삭제 오류:', profileError)
      return NextResponse.json({
        error: '사용자 프로필 삭제에 실패했습니다.',
        details: profileError
      }, { status: 500 })
    }

    // 8단계: Auth 사용자 삭제 (마지막 단계)
    console.log('8단계: Auth 사용자 삭제 중...')
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth 사용자 삭제 오류:', authError)
      return NextResponse.json({
        error: '계정 삭제에 실패했습니다.',
        details: authError
      }, { status: 500 })
    }

    console.log('✅ 계정 탈퇴 완료:', { userId, email: user.email })

    return NextResponse.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('계정 탈퇴 중 예상치 못한 오류:', error)
    return NextResponse.json({
      error: '계정 탈퇴 중 오류가 발생했습니다.',
      details: error
    }, { status: 500 })
  }
}
