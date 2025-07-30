"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function AdminStartPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">NN</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Neimd Network</h1>
        </div>
        <p className="text-gray-500 mt-1">네트워킹 이벤트 관리 플랫폼</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <Card className="max-w-md mx-auto w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl mx-auto flex items-center justify-center">
              <span className="text-white font-bold text-xl">NN</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">시작하기</h2>
              <p className="text-gray-600">
                네트워킹 이벤트를 쉽게 관리하고
                <br />
                참가자들과 연결하세요
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/admin/login">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold rounded-xl">
                  로그인
                </Button>
              </Link>
              <Link href="/admin/signup">
                <Button
                  variant="outline"
                  className="w-full border-2 border-purple-200 text-purple-600 py-3 text-lg font-semibold rounded-xl bg-transparent"
                >
                  회원가입
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500">처음 방문이시면 회원가입 후 이용해주세요</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
