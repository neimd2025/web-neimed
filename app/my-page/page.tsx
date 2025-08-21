"use client"

import { useLoading } from '@/components/loading-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useUserProfile } from '@/hooks/use-user-profile'
import { Calendar, LogOut, MapPin, Settings, Shield, User, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MyPage() {
  const { user, signOut, adminUser, isAdmin } = useAuth()
  const { profile } = useUserProfile()
  const { isLoading } = useLoading()
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

  const handleSwitchToAdmin = () => {
    router.push("/admin")
  }

  const handleSwitchToUser = () => {
    router.push("/home")
  }

  // 현재 관리자 페이지에 있는지 확인
  const isInAdminPage = pathname?.startsWith('/admin')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

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
          <h1 className="text-lg font-semibold text-gray-900">마이페이지</h1>
        </div>
        </div>

      <div className="px-5 py-6 space-y-6">
        {/* 사용자 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">사용자 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {profile?.full_name || user.email?.split('@')[0] || '사용자'}
                </h3>
                <p className="text-sm text-gray-600">가입일: {new Date(user.created_at).toLocaleDateString()}</p>
                {adminUser && (
                  <p className="text-sm text-purple-600 font-medium">관리자</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 프로필 상세 정보 */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">프로필 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.birth_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      생년월일: {new Date(profile.birth_date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}

                {profile.affiliation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      소속: {profile.affiliation}
                    </span>
                  </div>
                )}

                {profile.role && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      역할: {profile.role}
                    </span>
                  </div>
                )}

                {profile.contact && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      연락처: {profile.contact}
                    </span>
                  </div>
                )}
              </div>

              {/* MBTI */}
              {profile.mbti && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">MBTI</h4>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {profile.mbti}
                  </Badge>
                </div>
              )}

              {/* 성격 키워드 */}
              {profile.personality_keywords && profile.personality_keywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">성격 키워드</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.personality_keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 관심 키워드 */}
              {profile.interest_keywords && profile.interest_keywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">관심 키워드</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interest_keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 자기소개 */}
              {profile.introduction && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">자기소개</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {profile.introduction}
                  </p>
                </div>
              )}

              {/* 외부 링크 */}
              {profile.external_link && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">외부 링크</h4>
                  <a
                    href={profile.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-700 underline"
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

          {/* 관리자 페이지 전환 버튼 (관리자만 보이기) */}
          {adminUser && (
            <div
              onClick={isInAdminPage ? handleSwitchToUser : handleSwitchToAdmin}
              className="w-full justify-start cursor-pointer hover:bg-purple-50 p-4 rounded-lg
              flex items-center border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50"
            >
              {isInAdminPage ? (
                <>
                  <UserCheck className="w-5 h-5 mr-3 text-purple-600" />
                  <div className="flex flex-col">
                    <span className="font-medium text-purple-700">일반 사용자 페이지로</span>
                    <span className="text-xs text-purple-500">홈 화면으로 이동하여 일반 사용자 모드로 전환</span>
                  </div>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-3 text-purple-600" />
                  <div className="flex flex-col">
                    <span className="font-medium text-purple-700">관리자 페이지로</span>
                    <span className="text-xs text-purple-500">관리자 대시보드로 이동하여 관리자 기능 사용</span>
                  </div>
                </>
              )}
            </div>
          )}

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
