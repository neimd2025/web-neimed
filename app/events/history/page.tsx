"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useEvents } from '@/hooks/use-events'
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EventHistoryPage() {
  const { events, ongoingEvents, upcomingEvents, completedEvents } = useEvents()
  const [activeTab, setActiveTab] = useState<'진행중' | '예정' | '종료'>('진행중')
  const router = useRouter()

  const getEventsByTab = () => {
    switch (activeTab) {
      case '진행중':
        return ongoingEvents
      case '예정':
        return upcomingEvents
      case '종료':
        return completedEvents
      default:
        return []
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800">진행중</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">예정</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">종료</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const filteredEvents = getEventsByTab()

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <Link href="/home">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">이벤트 히스토리</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* 탭 버튼들 */}
        <div className="flex gap-2">
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

        {/* 이벤트 목록 */}
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{event.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.start_date).toLocaleDateString()}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{event.current_participants || 0}/{event.max_participants || 0}명</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(event.status || 'upcoming')}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/events/${event.id}`)}
                      >
                        상세보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab} 이벤트가 없습니다
              </h3>
              <p className="text-gray-600 text-sm">
                새로운 이벤트에 참가해보세요!
              </p>
            </div>
          )}
        </div>

        {/* 새 이벤트 참가 버튼 */}
        <div className="text-center pt-4">
          <Link href="/events/join">
            <Button className="bg-purple-600 hover:bg-purple-700">
              새 이벤트 참가하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
