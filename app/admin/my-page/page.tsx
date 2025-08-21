"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useUserProfile } from '@/hooks/use-user-profile'
import { Calendar, LogOut, MapPin, Settings, User, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminMyPage() {
  const { user, signOut, adminUser, isAdmin } = useAuth()
  const { profile, loading } = useUserProfile()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  const handleSwitchToUser = () => {
    router.push("/home")
  }

  // 현재 관리자 페이지에 있는지 확인
  const isInAdminPage = pathname?.startsWith('/admin')

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">마이페이지를 보려면 로그인해주세요.</p>
          <Link href="/login">
            <Button>로그인하기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">관리자 마이페이지</h1>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            관리자
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* 사용자 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">사용자 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile?.full_name || user?.email}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
                <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700">
                  관리자 계정
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 프로필 상세 정보 */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">프로필 상세 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.birth_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">생년월일:</span>
                  <span className="text-sm font-medium">{profile.birth_date}</span>
                </div>
              )}

              {profile.affiliation && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">소속:</span>
                  <span className="text-sm font-medium">{profile.affiliation}</span>
                </div>
              )}

              {profile.role && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">역할:</span>
                  <span className="text-sm font-medium">{profile.role}</span>
                </div>
              )}

              {profile.contact && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">연락처:</span>
                  <span className="text-sm font-medium">{profile.contact}</span>
                </div>
              )}

              {profile.mbti && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">MBTI:</span>
                  <span className="text-sm font-medium">{profile.mbti}</span>
                </div>
              )}

              {profile.personality_keywords && profile.personality_keywords.length > 0 && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-600">성격 키워드:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.personality_keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {profile.interest_keywords && profile.interest_keywords.length > 0 && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-600">관심사:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.interest_keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {profile.introduction && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-600">자기소개:</span>
                    <p className="text-sm font-medium mt-1">{profile.introduction}</p>
                  </div>
                </div>
              )}

              {profile.external_link && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">외부 링크:</span>
                  <a
                    href={profile.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {profile.external_link}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 프로필 완성도 */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">프로필 완성도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">기본 정보</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile.full_name ? '완료' : '미완료'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">성격 키워드</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile.personality_keywords && profile.personality_keywords.length > 0 ? '완료' : '미완료'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(() => {
                        let completed = 0;
                        if (profile.full_name) completed++;
                        if (profile.personality_keywords && profile.personality_keywords.length > 0) completed++;
                        return (completed / 2) * 100;
                      })()}%`
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 메뉴 */}
        <div className="space-y-4">
          <Link href="/profile/edit">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">프로필 수정</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 일반 사용자 페이지로 전환 버튼 */}
          <div
            onClick={handleSwitchToUser}
            className="w-full justify-start cursor-pointer hover:bg-blue-50 p-4 rounded-lg
            flex items-center border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50"
          >
            <UserCheck className="w-5 h-5 mr-3 text-blue-600" />
            <div className="flex flex-col">
              <span className="font-medium text-blue-700">일반 사용자 페이지로</span>
              <span className="text-xs text-blue-500">홈 화면으로 이동하여 일반 사용자 모드로 전환</span>
            </div>
          </div>

          <div
            onClick={handleLogout}
            className="w-full justify-start cursor-pointer hover:bg-gray-100 p-4 rounded-lg
            flex items-center border border-gray-200"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-500" />
            <span className="font-medium">로그아웃</span>
          </div>
        </div>
      </div>
    </div>
  )
}
