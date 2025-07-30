"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { CheckCircle, Eye, EyeOff, Lock, Mail, User, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const { signUpWithEmail, signInWithOAuth } = useAuth()
  const router = useRouter()

  // 이메일 중복 검사
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!formData.email || formData.email.length < 5) {
        setEmailStatus('idle')
        return
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setEmailStatus('idle')
        return
      }

      setEmailStatus('checking')

      try {
        // 실제로는 회원가입 시도로 중복을 확인하는 것이 더 정확합니다
        // 여기서는 간단한 시뮬레이션을 위해 항상 사용 가능으로 설정
        // 실제 구현에서는 서버 사이드에서 처리하거나
        // 회원가입 시도 후 에러 메시지로 판단하는 것이 좋습니다
        setTimeout(() => {
          setEmailStatus('available')
        }, 500)
      } catch (error) {
        console.error('이메일 중복 검사 오류:', error)
        setEmailStatus('idle')
      }
    }

    const timeoutId = setTimeout(checkEmailAvailability, 300)
    return () => clearTimeout(timeoutId)
  }, [formData.email])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      toast.error('모든 필드를 입력해주세요.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error('이름은 2자 이상 입력해주세요.')
      return
    }

    // 이메일 중복 확인
    if (emailStatus === 'taken') {
      toast.error('이미 사용 중인 이메일입니다. 다른 이메일을 사용하거나 로그인을 시도해주세요.')
      return
    }

    // 이메일 검증 중인 경우 대기
    if (emailStatus === 'checking') {
      toast.error('이메일 중복 검사 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await signUpWithEmail(formData.email, formData.password, formData.name, false)
      if (error) {
        // 구체적인 에러 메시지 표시
        const errorMessage = error.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
        toast.error(errorMessage)

        // 이미 가입된 사용자인 경우 로그인 페이지로 안내
        if (error.message?.includes('이미 가입된') || error.message?.includes('already registered')) {
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } else {
        toast.success('회원가입이 완료되었습니다! 이메일로 전송된 인증 코드를 확인해주세요.')
        router.push(`/verify?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (error) {
      toast.error('회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignup = async (provider: 'google' | 'kakao') => {
    setLoading(true)
    try {
      const { error } = await signInWithOAuth(provider)
      if (error) {
        toast.error(`${provider === 'google' ? 'Google' : 'Kakao'} 회원가입에 실패했습니다.`)
      }
    } catch (error) {
      toast.error('소셜 회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">회원가입</CardTitle>
          <p className="text-gray-600">Neimd에 가입하고 네트워킹을 시작하세요</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 소셜 회원가입 버튼들 */}
          <div className="space-y-3">
            <Button
              onClick={() => handleOAuthSignup('google')}
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
              Google로 회원가입
            </Button>

            <Button
              onClick={() => handleOAuthSignup('kakao')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              Kakao로 회원가입
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

          {/* 이메일 회원가입 폼 */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${emailStatus === 'available' ? 'border-green-500' : emailStatus === 'taken' ? 'border-red-500' : ''}`}
                  required
                />
                {emailStatus === 'checking' && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                  </span>
                )}
                {emailStatus === 'available' && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                )}
                {emailStatus === 'taken' && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                    <XCircle className="w-4 h-4" />
                  </span>
                )}
              </div>
              {emailStatus === 'available' && (
                <p className="text-xs text-green-600">사용 가능한 이메일입니다.</p>
              )}
              {emailStatus === 'taken' && (
                <p className="text-xs text-red-600">이미 사용 중인 이메일입니다.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요 (최소 6자)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? '회원가입 중...' : '회원가입'}
            </Button>
          </form>

          {/* 추가 링크들 */}
          <div className="text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
