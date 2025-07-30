'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// Zod 스키마 정의
const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { signInWithEmail, signInWithOAuth, user, loading: authLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/home')
    }
  }, [user, authLoading, router])

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      console.log('🔐 로그인 시도:', data.email)
      const { data: result, error } = await signInWithEmail(data.email, data.password)

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
      } else if (result?.user) {
        console.log('✅ 로그인 성공:', result.user.email)
        toast.success('로그인되었습니다!')
        router.push('/home')
      } else {
        console.log('⚠️ 로그인 데이터 없음:', result)
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Named에 오신 것을 환영합니다
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 로그인
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('kakao')}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#FEE500" d="M12 3C6.48 3 2 6.48 2 12s4.48 9 10 9 10-4.48 10-9S17.52 3 12 3z"/>
                <path fill="#000000" d="M12 5c-3.87 0-7 2.79-7 6.25 0 2.25 1.5 4.25 3.75 5.5L9 18l2.25-1.25C11.5 16.75 12 16.5 12 16.5s.5.25 1.75 1.25L16 18l.25-1.25C18.5 15.5 20 13.5 20 11.25 20 7.79 16.87 5 13 5z"/>
              </svg>
              Kakao로 로그인
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading || isSubmitting}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-500">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
