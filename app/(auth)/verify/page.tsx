"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
      console.log('📧 인증 페이지 로드:', emailParam)
    }
  }, [searchParams])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code || code.length !== 6) {
      toast.error('6자리 인증 코드를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      console.log('🔍 인증 시도:', { email, code: code.substring(0, 2) + '****' })

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      })

      if (error) {
        console.error('❌ 인증 실패:', error)
        toast.error('인증 코드가 올바르지 않습니다. 다시 확인해주세요.')
      } else if (data.user) {
        // 인증 완료 후 프로필과 비즈니스 카드 생성
        try {
          // 관리자 이메일 목록
          const adminEmails = [
            'admin@named.com',
            'simjaehyeong@gmail.com',
            'test@admin.com'
          ]

          const userRole = adminEmails.includes(data.user.email?.toLowerCase() || '') ? 'admin' : 'user'
          const roleId = userRole === 'admin' ? 2 : 1 // admin: 2, user: 1

          // 프로필 생성
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              full_name: data.user.user_metadata?.name || '',
              email: data.user.email || '',
              contact: '',
              company: '',
              role: userRole,
              role_id: roleId,
              introduction: '',
              mbti: '',
              keywords: [],
              profile_image_url: null,
              qr_code_url: null
            })

          if (profileError) {
            console.error('⚠️ 프로필 생성 실패:', profileError)
          } else {
            console.log(`✅ 사용자 프로필이 자동으로 생성되었습니다. (Role: ${userRole})`)
          }

          // 비즈니스 카드 생성
          const { error: cardError } = await supabase
            .from('business_cards')
            .insert({
              user_id: data.user.id,
              full_name: data.user.user_metadata?.name || '',
              email: data.user.email || '',
              contact: '',
              company: '',
              role: '',
              introduction: '',
              profile_image_url: null,
              qr_code_url: null,
              is_public: true
            })

          if (cardError) {
            console.error('⚠️ 비즈니스 카드 생성 실패:', cardError)
          } else {
            console.log('✅ 비즈니스 카드가 자동으로 생성되었습니다.')
          }
        } catch (profileError) {
          console.error('⚠️ 프로필/카드 생성 중 오류:', profileError)
        }

        console.log('✅ 이메일 인증 완료:', data.user.email)
        toast.success('이메일 인증이 완료되었습니다!')
        // 인증 완료 후 바로 홈으로 이동
        router.push('/home')
      }
    } catch (error) {
      toast.error('인증 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      toast.error('이메일 주소가 필요합니다.')
      return
    }

    setResending(true)
    try {
      console.log('📧 인증 코드 재전송 시도:', email)

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) {
        console.error('❌ 인증 코드 재전송 실패:', error)
        toast.error('인증 코드 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.')
      } else {
        console.log('✅ 인증 코드 재전송 성공')
        toast.success('새로운 인증 코드를 이메일로 전송했습니다. 스팸함도 확인해주세요.')
      }
    } catch (error) {
      console.error('❌ 인증 코드 재전송 중 오류:', error)
      toast.error('인증 코드 재전송 중 오류가 발생했습니다.')
    } finally {
      setResending(false)
    }
  }

  const handleCodeChange = (value: string) => {
    // 숫자만 입력 가능
    const numericValue = value.replace(/[^0-9]/g, '')
    setCode(numericValue.slice(0, 6))
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">이메일 인증</CardTitle>
          <p className="text-gray-600">
            {email ? `${email}로 전송된 6자리 인증 코드를 입력해주세요.` : '이메일 인증이 필요합니다.'}
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 이메일이 오지 않는다면 스팸함을 확인해주세요.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">인증 코드</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 text-center">
                6자리 숫자 코드를 입력해주세요
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  인증 중...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  인증하기
                </div>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <Button
              onClick={handleResendCode}
              disabled={resending}
              variant="outline"
              className="w-full"
            >
              {resending ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  재전송 중...
                </div>
              ) : (
                '인증 코드 재전송'
              )}
            </Button>

            <div className="text-center text-sm space-y-2">
              <p className="text-gray-500 text-xs">
                이메일이 오지 않는다면 다음을 확인해주세요:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 스팸함/정크메일함 확인</li>
                <li>• 이메일 주소가 정확한지 확인</li>
                <li>• 몇 분 후 다시 시도</li>
              </ul>
              <Link href="/login" className="text-blue-600 hover:underline block mt-2">
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
