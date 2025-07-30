import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  // 코드 인증 방식에서는 이 라우트가 직접 호출되지 않음
  // 대신 /verify 페이지에서 코드를 입력받아 처리
  if (token_hash && type) {
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })
    if (!error) {
      return NextResponse.redirect(new URL('/welcome', origin))
    }
  }

  // 코드 인증 방식으로 변경되었으므로 인증 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/verify', origin))
}
