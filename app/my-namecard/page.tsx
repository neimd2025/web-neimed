'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, QrCode, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function MyNamecardPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 사용자 표시 이름 가져오기
  const getUserDisplayName = () => {
    if (!user) return "사용자"

    if (user.app_metadata?.provider === 'kakao') {
      return user.user_metadata?.nickname ||
             user.user_metadata?.full_name ||
             user.email?.split('@')[0] ||
             "사용자"
    }

    return user.user_metadata?.full_name ||
           user.email?.split('@')[0] ||
           "사용자"
  }

  // 사용자 이니셜 가져오기
  const getUserInitial = () => {
    const name = getUserDisplayName()
    return name.charAt(0)
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4 text-gray-900" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">내 명함</h1>
          <div className="w-10"></div> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          {/* 명함 카드 */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl p-6 mb-6">
            {/* 프로필 섹션 */}
            <div className="text-center mb-6">
              {/* 프로필 이미지 */}
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-5 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-600" />
              </div>

              {/* 이름과 소개 */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getUserDisplayName()}
              </h2>
              <p className="text-gray-600 text-base mb-4">
                하루하루 의미있게
              </p>

              {/* 기본 정보 */}
              <div className="space-y-2 text-sm text-gray-500">
                <p>24세</p>
                <p>Named / 기획</p>
                <p>MBTI: ENTJ</p>
              </div>
            </div>

            {/* 태그 섹션들 */}
            <div className="space-y-6">
              {/* 성격 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">성격</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    사람들과 잘 어울려요
                  </Badge>
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    계획을 세우는 걸 좋아해요
                  </Badge>
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    새로운 아이디어를 자주 떠올려요
                  </Badge>
                </div>
              </div>

              {/* 관심사 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">관심사</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-gray-200 px-3 py-1">
                    창업
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 px-3 py-1">
                    자기계발
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 px-3 py-1">
                    지속가능성
                  </Badge>
                </div>
              </div>

              {/* 취미 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">취미</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-gray-200 px-3 py-1">
                    독서
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 px-3 py-1">
                    자기계발
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 px-3 py-1">
                    사람
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 px-3 py-1">
                    영화감상
                  </Badge>
                </div>
              </div>

              {/* 링크 */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">- YouTube</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Enjoy the videos and music you love, upload original content, and share it all with friends...
                </p>
                <p className="text-gray-500 text-sm">www.youtube.com</p>
              </div>

              {/* 공유 링크 */}
              <div className="text-center">
                <p className="text-purple-600 text-sm font-medium">naimd.link/1s2v</p>
              </div>
            </div>
          </Card>

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <Link href="/my-qr">
              <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                <QrCode className="w-4 h-4 mr-2" />
                QR 코드 보기
              </Button>
            </Link>

                               <Link href="/profile/edit">
                     <Button variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50">
                       <Edit className="w-4 h-4 mr-2" />
                       명함 수정하기
                     </Button>
                   </Link>
          </div>
        </motion.div>
      </div>


    </div>
  )
}

// Card 컴포넌트 (shadcn/ui가 없는 경우를 대비)
function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {children}
    </div>
  )
}
