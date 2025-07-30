import { businessCardAPI, userProfileAPI } from '@/lib/supabase/database'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      try {
        // 사용자가 새로 생성된 경우에만 프로필 생성
        const existingProfile = await userProfileAPI.getUserProfile(data.user.id)

        if (!existingProfile) {
          // 사용자 프로필 생성
          await userProfileAPI.createUserProfile({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            email: data.user.email || '',
            phone: '',
            company: '',
            position: '',
            bio: '',
            mbti: '',
            keywords: [],
            profile_image_url: data.user.user_metadata?.avatar_url || null,
            is_public: true
          })

          // 비즈니스 카드 생성
          await businessCardAPI.createBusinessCard({
            user_id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            email: data.user.email || '',
            phone: '',
            company: '',
            position: '',
            bio: '',
            profile_image_url: data.user.user_metadata?.avatar_url || null,
            qr_code_url: null,
            is_public: true
          })

          console.log('✅ OAuth 사용자 프로필과 비즈니스 카드가 자동으로 생성되었습니다.')
        }
      } catch (profileError) {
        console.error('⚠️ OAuth 프로필 생성 중 오류:', profileError)
        // 프로필 생성 실패해도 로그인은 성공으로 처리
      }

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent('OAuth 로그인 중 오류가 발생했습니다.')}`, origin))
}
