"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || '알 수 없는 오류가 발생했습니다.'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">오류가 발생했습니다</CardTitle>
          <p className="text-gray-600">죄송합니다. 문제가 발생했습니다.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{message}</p>
          </div>

          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full">
                로그인 페이지로 이동
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
