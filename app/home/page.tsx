"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useBusinessCards } from '@/hooks/use-business-cards'
import { useEvents } from '@/hooks/use-events'
import { useUserProfile } from '@/hooks/use-user-profile'
import { ArrowRight, Bell, Calendar, Camera, MessageCircle, QrCode, Star, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, getDisplayName, getInitial, loading: profileLoading } = useUserProfile()
  const { events, ongoingEvents, upcomingEvents, completedEvents, loading: eventsLoading } = useEvents()
  const { userCard, collectedCards, loading: cardsLoading } = useBusinessCards()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'진행중' | '예정' | '종료'>('진행중')

  useEffect(() => {
    setMounted(true)
  }, [])

  // 인증 로딩 중이거나 마운트되지 않은 경우
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // 사용자가 없는 경우
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">홈페이지를 보려면 로그인해주세요.</p>
          <Link href="/login">
            <Button>로그인하기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* 헤더 섹션 */}
      <div className="bg-white border-b border-gray-200 px-5 py-10">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            {/* 프로필 아바타 */}
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{getInitial()}</span>
            </div>
            {/* 환영 메시지 */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                안녕하세요, {getDisplayName()}님!
              </h1>
              <p className="text-gray-600 text-sm">
                오늘도 좋은 만남이 있기를 🤝
              </p>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex gap-3">
          <Link href="/scan-card" className="flex-1">
            <Card className="bg-purple-600 text-white border-0 hover:bg-purple-700 transition-colors">
              <CardContent className="p-5 text-center">
                <Camera className="w-4 h-4 mx-auto mb-4 text-white" />
                <p className="text-sm">명함 스캔</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/events/join" className="flex-1">
            <Card className="bg-white border border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="p-5 text-center">
                <Calendar className="w-4 h-4 mx-auto mb-4 text-gray-700" />
                <p className="text-sm text-gray-700">행사참가</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-5 py-6 space-y-6">
        {/* 통계 카드들 */}
        <div className="flex gap-3">
          <Card className="flex-1 bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">167</p>
                <p className="text-sm text-gray-600">프로필 조회수</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </CardContent>
          </Card>

          <Card className="flex-1 bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {cardsLoading ? '...' : collectedCards.length}
                </p>
                <p className="text-sm text-gray-600">수집된 명함</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </CardContent>
          </Card>

          <Card className="flex-1 bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {eventsLoading ? '...' : events.length}
                </p>
                <p className="text-sm text-gray-600">참가한 행사</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        {/* 내 명함 섹션 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">내 명함</h2>
            <Link href="/my-namecard">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                보기
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{getInitial()}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{getDisplayName()}</h3>
              <p className="text-sm text-gray-600">
                {cardsLoading ? '로딩 중...' : `${userCard?.role || '직책'} @ ${userCard?.company || '회사'}`}
              </p>
            </div>
            <Link href="/my-qr">
              <Button size="sm" variant="outline" className="border-purple-200 text-purple-600">
                <QrCode className="w-4 h-4 mr-1" />
                QR보기
              </Button>
            </Link>
          </div>
        </div>

        {/* 실시간 알림 섹션 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">최근 알림</h2>
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                모두보기
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Bell className="w-4 h-4 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">새로운 이벤트가 등록되었습니다</h4>
                <p className="text-xs text-gray-600 mt-1">Neimd 네트워킹 데모 이벤트에 참가해보세요!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Bell className="w-4 h-4 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">명함이 수집되었습니다</h4>
                <p className="text-xs text-gray-600 mt-1">새로운 연결을 확인해보세요</p>
              </div>
            </div>
          </div>
        </div>

                       {/* 실시간 이벤트 섹션 */}
               <div className="bg-white rounded-xl border border-gray-200 p-5">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-semibold text-gray-900">진행중인 이벤트</h2>
                   <Link href="/events/history">
                     <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                       모두보기
                       <ArrowRight className="w-4 h-4 ml-1" />
                     </Button>
                   </Link>
                 </div>

                 <div className="space-y-3">
                   {ongoingEvents.length > 0 ? (
                     ongoingEvents.slice(0, 2).map((event) => (
                       <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                         <div>
                           <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                           <p className="text-xs text-gray-600 mt-1">
                             참가자: {event.current_participants || 0}/{event.max_participants || 0}명
                           </p>
                         </div>
                         <Badge className="bg-green-100 text-green-800">진행중</Badge>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-4 text-gray-500 text-sm">
                       진행중인 이벤트가 없습니다
                     </div>
                   )}
                 </div>
               </div>

        {/* 행사 히스토리 섹션 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">행사 히스토리</h2>
            <Link href="/events/history">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                모두보기
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* 탭 버튼들 */}
          <div className="flex gap-2 mb-4">
            {(['진행중', '예정', '종료'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? "bg-purple-600" : ""}
              >
                {tab}
              </Button>
            ))}
          </div>

                           {/* 행사 목록 */}
                 <div className="space-y-3">
                   {(() => {
                     let filteredEvents: any[] = []

                     if (activeTab === '진행중') {
                       filteredEvents = ongoingEvents
                     } else if (activeTab === '예정') {
                       filteredEvents = upcomingEvents
                     } else if (activeTab === '종료') {
                       filteredEvents = completedEvents
                     }

                     return filteredEvents.length > 0 ? (
                       filteredEvents.slice(0, 3).map((event) => (
                         <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <div>
                             <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                             <p className="text-xs text-gray-600 mt-1">
                               {new Date(event.start_date).toLocaleDateString()} • {event.current_participants || 0}명 참가
                             </p>
                           </div>
                           <Badge
                             className={
                               event.status === "ongoing" ? "bg-green-100 text-green-800" :
                               event.status === "upcoming" ? "bg-blue-100 text-blue-800" :
                               "bg-gray-100 text-gray-800"
                             }
                           >
                             {event.status === 'ongoing' ? '진행중' :
                              event.status === 'upcoming' ? '예정' : '종료'}
                           </Badge>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-4 text-gray-500 text-sm">
                         {activeTab} 이벤트가 없습니다
                       </div>
                     )
                   })()}
                 </div>
        </div>
      </div>
    </div>
  )
}
