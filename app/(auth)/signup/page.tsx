'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Eye, EyeOff, Lock, Mail, User, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// Zod 스키마 정의
const signupSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다').max(50, '이름은 50자 이하여야 합니다'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const { signUpWithEmail, user, loading: authLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  })

  const watchedEmail = watch('email')

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/home')
    }
  }, [user, authLoading, router])

  // 이메일 중복 확인
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!watchedEmail || watchedEmail.length < 3) {
        setEmailStatus('idle')
        return
      }

      setEmailStatus('checking')

      // 실제로는 Supabase에서 이메일 중복 확인을 해야 합니다
      // 현재는 시뮬레이션
      setTimeout(() => {
        const isTaken = watchedEmail.includes('test') || watchedEmail.includes('admin')
        setEmailStatus(isTaken ? 'taken' : 'available')
      }, 1000)
    }

    const timeoutId = setTimeout(checkEmailAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [watchedEmail])

  const onSubmit = async (data: SignupFormData) => {
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
      const { data: result, error } = await signUpWithEmail(data.email, data.password, data.name, false)

      if (error) {
        console.error('❌ 회원가입 실패:', error)
        toast.error(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.')
        return
      }

      if (result?.user) {
        console.log('✅ 회원가입 성공:', result.user.email)
        toast.success('회원가입이 완료되었습니다! 이메일 인증 후 로그인해주세요.')
        router.push('/login')
      } else {
        console.log('⚠️ 회원가입 데이터 없음:', result)
        toast.error('회원가입에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 회원가입 중 오류:', error)
      toast.error('회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Named 계정을 만들어보세요
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  {...register('name')}
                  type="text"
                  placeholder="이름을 입력하세요"
                  className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className={`pl-10 ${emailStatus === 'available' ? 'border-green-500' : emailStatus === 'taken' ? 'border-red-500' : errors.email ? 'border-red-500' : ''}`}
                />
                {emailStatus === 'checking' && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                  </span>
                )}
                {emailStatus === 'available' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                )}
                {emailStatus === 'taken' && (
                  <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
              {emailStatus === 'available' && (
                <p className="text-green-500 text-sm">사용 가능한 이메일입니다</p>
              )}
              {emailStatus === 'taken' && (
                <p className="text-red-500 text-sm">이미 사용 중인 이메일입니다</p>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력하세요"
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading || isSubmitting || emailStatus === 'checking' || emailStatus === 'taken'}
            >
              {loading ? '회원가입 중...' : '회원가입'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
