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
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      })

      if (error) {
        toast.error('인증 코드가 올바르지 않습니다. 다시 확인해주세요.')
      } else if (data.user) {
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
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) {
        toast.error('인증 코드 재전송에 실패했습니다.')
      } else {
        toast.success('새로운 인증 코드를 이메일로 전송했습니다.')
      }
    } catch (error) {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">이메일 인증</CardTitle>
          <p className="text-gray-600">
            {email ? `${email}로 전송된 6자리 인증 코드를 입력해주세요.` : '이메일 인증이 필요합니다.'}
          </p>
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

            <div className="text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
