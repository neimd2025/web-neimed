"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from 'react-hook-form'
import { toast } from "sonner"
import { z } from 'zod'

// Zod 스키마 정의
const adminSignupSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다').max(50, '이름은 50자 이하여야 합니다'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

type AdminSignupFormData = z.infer<typeof adminSignupSchema>

export default function AdminSignupPage() {
  const router = useRouter()
  const { signUpWithEmail } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [signupData, setSignupData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AdminSignupFormData>({
    resolver: zodResolver(adminSignupSchema)
  })

  const onSubmit = async (data: AdminSignupFormData) => {
    setIsSubmitting(true)

    try {
      const { data: result, error } = await signUpWithEmail(data.email, data.password, data.name, true)

      if (error) {
        toast.error(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.')
        return
      }

      if (result?.user) {
        setSignupData(result)
        setShowVerification(true)
        toast.success('이메일로 인증 코드를 발송했습니다. 이메일을 확인해주세요.')
      }
    } catch (error) {
      console.error('회원가입 오류:', error)
      toast.error('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 여기서 인증 코드 확인 로직을 구현해야 합니다
      // Supabase에서는 이메일 링크 방식이 기본이므로
      // 별도의 인증 코드 확인 API가 필요할 수 있습니다

      toast.success('관리자 계정이 성공적으로 생성되었습니다!')
      router.push('/admin/login')
    } catch (error) {
      console.error('인증 오류:', error)
      toast.error('인증 코드가 올바르지 않습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            관리자 회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            관리자 계정을 생성하세요
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            관리자 권한은 자동으로 부여됩니다
          </p>
        </div>

        {!showVerification ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  이름
                </Label>
                <div className="mt-1 relative">
                  <Input
                    {...register('name')}
                    type="text"
                    autoComplete="name"
                    placeholder="관리자 이름"
                    className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </Label>
                <div className="mt-1 relative">
                  <Input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder="admin@named.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </Label>
                <div className="mt-1 relative">
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="비밀번호를 입력하세요"
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  비밀번호 확인
                </Label>
                <div className="mt-1 relative">
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="비밀번호를 다시 입력하세요"
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? '회원가입 중...' : '관리자 회원가입'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                이미 관리자 계정이 있으신가요?{' '}
                <Link href="/admin/login" className="font-medium text-purple-600 hover:text-purple-500">
                  관리자 로그인
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerification}>
            <div>
              <Label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                인증 코드
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="pl-10"
                  placeholder="이메일로 받은 6자리 코드"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {signupData?.user?.email}로 전송된 인증 코드를 입력해주세요
              </p>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? '인증 중...' : '인증 완료'}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                ← 회원가입으로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
