"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminSignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    role: "admin" as "admin" | "super_admin"
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("") // 에러 메시지 초기화
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.")
      return
    }

    if (!formData.name || !formData.email || !formData.company) {
      setError("모든 필드를 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      // 실제로는 Supabase에 관리자 계정을 생성해야 함
      await new Promise(resolve => setTimeout(resolve, 1000)) // 시뮬레이션

      console.log('관리자 계정 생성:', formData)

      // 성공 시 로그인 페이지로 이동
      router.push('/admin/login')
    } catch (error) {
      console.error('관리자 회원가입 오류:', error)
      setError("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">관리자 회원가입</h1>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">관리자 계정 생성</h2>
            <p className="text-gray-600">Neimd Network 관리자 계정을 만드세요</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    이름
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="관리자 이름"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    이메일 주소
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-700 font-medium">
                    회사/조직
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="회사명 또는 조직명"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700 font-medium">
                    관리자 권한
                  </Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl px-3 bg-white"
                  >
                    <option value="admin">일반 관리자</option>
                    <option value="super_admin">슈퍼 관리자</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    비밀번호
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                    비밀번호 확인
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                <Button
                  type="submit"
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "계정 생성 중..." : "관리자 계정 생성"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/admin/login" className="text-purple-600 hover:underline font-semibold">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
