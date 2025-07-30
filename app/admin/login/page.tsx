"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminStore } from "@/stores/admin-store"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("admin@neimd.com")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")
  const router = useRouter()
  const { adminLogin, isLoading } = useAdminStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await adminLogin(email, password)
    if (success) {
      router.push("/admin/dashboard")
    } else {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.")
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
            <span className="text-white font-bold text-sm">NN</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Neimd Network</h1>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">관리자 로그인</h2>
            <p className="text-gray-600">관리자 계정으로 로그인하세요</p>
          </div>

          {/* Demo Info */}
          <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">관리자 계정 정보</h4>
              <p className="text-sm text-blue-700">이메일: admin@neimd.com</p>
              <p className="text-sm text-blue-700">비밀번호: admin123</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    이메일 주소
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    required
                  />
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                <Button
                  type="submit"
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-gray-600">
            계정이 없으신가요?{" "}
            <Link href="/admin/signup" className="text-purple-600 hover:underline font-semibold">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
