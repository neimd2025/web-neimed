"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading, signInWithEmail, signInWithOAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      // 이미 로그인된 사용자는 홈으로 리다이렉트
      router.push('/home')
    }
  }, [user, authLoading, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      console.log('🔐 로그인 시도:', email)
      const { data, error } = await signInWithEmail(email, password)

      if (error) {
        console.error('❌ 로그인 실패:', error)
        // 구체적인 에러 메시지 표시
        const errorMessage = error.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
        toast.error(errorMessage)

        // 가입되지 않은 사용자인 경우 회원가입 페이지로 안내
        if (error.message?.includes('가입되지 않은') || error.message?.includes('not found')) {
          setTimeout(() => {
            router.push('/signup')
          }, 2000)
        }
      } else if (data?.user) {
        console.log('✅ 로그인 성공:', data.user.email)
        toast.success('로그인되었습니다!')
        router.push('/home')
      } else {
        console.log('⚠️ 로그인 데이터 없음:', data)
        toast.error('로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 로그인 중 오류:', error)
      toast.error('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'kakao') => {
    setLoading(true)
    try {
      const { error } = await signInWithOAuth(provider)
      if (error) {
        toast.error(`${provider === 'google' ? 'Google' : 'Kakao'} 로그인에 실패했습니다.`)
      }
    } catch (error) {
      toast.error('소셜 로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {authLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 상태를 확인하는 중...</p>
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">로그인</CardTitle>
            <p className="text-gray-600">Neimd에 오신 것을 환영합니다</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-3">
              <Button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 로그인
              </Button>

              <Button
                onClick={() => handleOAuthLogin('kakao')}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                </svg>
                Kakao로 로그인
              </Button>
            </div>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">또는</span>
              </div>
            </div>

            {/* 이메일 로그인 폼 */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>

            {/* 추가 링크들 */}
            <div className="space-y-2 text-center text-sm">
              <Link href="/reset-password" className="text-purple-600 text-sm hover:underline">
                비밀번호를 잊으셨나요?
              </Link>
              <div>
                계정이 없으신가요?{' '}
                <Link href="/signup" className="text-purple-600 text-sm hover:underline font-medium">
                  회원가입
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
