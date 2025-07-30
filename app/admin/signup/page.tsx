"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminStore } from "@/stores/admin-store"
import { useAuthStore } from "@/stores/auth-store"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function AdminSignupPage() {
  const router = useRouter()
  const { signUpWithEmail } = useAuthStore()
  const { adminUser, loading } = useAdminStore()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [signupData, setSignupData] = useState<any>(null)

  // 이미 관리자로 로그인된 경우 대시보드로 리다이렉트
  if (adminUser && !loading) {
    router.push('/admin/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.')
      setIsSubmitting(false)
      return
    }

    // 비밀번호 길이 확인
    if (formData.password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.')
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error } = await signUpWithEmail(formData.email, formData.password, formData.name, true)

      if (error) {
        toast.error(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.')
        return
      }

      if (data?.user) {
        setSignupData(data)
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
        </div>

        {!showVerification ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <div className="mt-1 relative">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  placeholder="관리자 이름"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1 relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  placeholder="admin@named.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
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
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="mt-1 relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
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
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
            >
              {isSubmitting ? "회원가입 중..." : "관리자 회원가입"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link href="/admin/login" className="text-purple-600 hover:text-purple-500 font-medium">
                로그인하기
              </Link>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">관리자 계정 안내</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 관리자 계정은 이벤트 관리, 알림 전송 등이 가능합니다</li>
              <li>• 회원가입 후 이메일 인증이 필요합니다</li>
              <li>• 관리자 권한은 자동으로 부여됩니다</li>
            </ul>
          </div>
        </form>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleVerification}>
          <div className="space-y-4">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                인증 코드
              </label>
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
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
            >
              {isSubmitting ? "인증 중..." : "인증 완료"}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowVerification(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← 회원가입으로 돌아가기
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">인증 코드 안내</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 이메일로 발송된 6자리 인증 코드를 입력해주세요</li>
              <li>• 인증 코드는 10분 후 만료됩니다</li>
              <li>• 이메일이 보이지 않으면 스팸함을 확인해주세요</li>
            </ul>
          </div>
        </form>
      )}
      </div>
    </div>
  )
}
