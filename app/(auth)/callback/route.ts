import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      try {
        // Use dynamic import for server-side functions
        const { userProfileAPI } = await import('@/lib/supabase/database')
        const { businessCardAPI } = await import('@/lib/supabase/database')

        // 사용자가 새로 생성된 경우에만 프로필 생성
        const existingProfile = await userProfileAPI.getUserProfile(data.user.id)

        if (!existingProfile) {
          // 관리자 이메일 목록 (실제 운영 시에는 환경변수로 관리)
          const adminEmails = [
            'admin@named.com',
            'simjaehyeong@gmail.com',
            'test@admin.com'
          ]

          const userRole = adminEmails.includes(data.user.email?.toLowerCase() || '') ? 'admin' : 'user'

          // 사용자 프로필 생성
          await userProfileAPI.createUserProfile({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            email: data.user.email || '',
            contact: '', // Changed from phone
            company: '',
            role: userRole, // role 설정
            introduction: '', // Changed from bio
            mbti: '',
            keywords: [],
            profile_image_url: data.user.user_metadata?.avatar_url || null,
            qr_code_url: null // Added qr_code_url
          })

          // 비즈니스 카드 생성
          await businessCardAPI.createBusinessCard({
            user_id: data.user.id,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            email: data.user.email || '',
            contact: '', // Changed from phone
            company: '',
            role: '', // Changed from position
            introduction: '', // Changed from bio
            profile_image_url: data.user.user_metadata?.avatar_url || null,
            qr_code_url: null,
            is_public: true
          })

          console.log(`✅ OAuth 사용자 프로필과 비즈니스 카드가 자동으로 생성되었습니다. (Role: ${userRole})`)
        }
      } catch (profileError) {
        console.error('⚠️ OAuth 프로필 생성 중 오류:', profileError)
      }
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent('OAuth 로그인 중 오류가 발생했습니다.')}`, origin))
}
