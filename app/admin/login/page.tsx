"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminStore } from "@/stores/admin-store"
import { useAuthStore } from "@/stores/auth-store"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const router = useRouter()
  const { signInWithEmail } = useAuthStore()
  const { adminUser, loading } = useAdminStore()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 이미 관리자로 로그인된 경우 대시보드로 리다이렉트
  if (adminUser && !loading) {
    router.push('/admin/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await signInWithEmail(formData.email, formData.password)

      if (error) {
        toast.error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
        return
      }

      if (data?.user) {
        // 관리자 권한 확인은 useAdminStore에서 자동으로 처리됨
        toast.success('로그인되었습니다.')
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      toast.error('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            관리자 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            관리자 계정으로 로그인하세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  autoComplete="current-password"
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
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              관리자 계정이 필요하시면{" "}
              <Link href="/admin/signup" className="text-purple-600 hover:text-purple-500 font-medium">
                회원가입
              </Link>
              하거나 개발팀에 문의하세요.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
