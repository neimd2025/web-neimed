"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useEvents } from '@/hooks/use-events'
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function EventJoinPage() {
  const { user } = useAuth()
  const { findEventByCode, events } = useEvents()
  const [eventCode, setEventCode] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleJoinEvent = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      return
    }

    if (!eventCode.trim()) {
      toast.error('이벤트 코드를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const event = await findEventByCode(eventCode.trim())

      if (!event) {
        toast.error('유효하지 않은 이벤트 코드입니다.')
        return
      }

      // 이벤트 상세 페이지로 이동
      router.push(`/events/${event.id}`)
      toast.success('이벤트에 참가했습니다!')
    } catch (error) {
      console.error('이벤트 참가 오류:', error)
      toast.error('이벤트 참가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const recentEvents = events.slice(0, 3)

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
          <h1 className="text-lg font-semibold text-gray-900">행사 참가</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* 이벤트 코드 입력 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">이벤트 코드 입력</CardTitle>
            <p className="text-sm text-gray-600">
              6자리 이벤트 코드를 입력하여 행사에 참가하세요
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="예: DEMO001"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                className="flex-1 text-center text-lg font-mono tracking-wider"
                maxLength={6}
              />
              <Button
                onClick={handleJoinEvent}
                disabled={loading || !eventCode.trim()}
                className="px-6"
              >
                {loading ? '참가 중...' : '참가하기'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 최근 이벤트 */}
        {recentEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">최근 이벤트</CardTitle>
              <p className="text-sm text-gray-600">
                참가 가능한 이벤트 목록입니다
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      상세보기
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 이벤트 히스토리 링크 */}
        <div className="text-center">
          <Link href="/events/history">
            <Button variant="ghost" className="text-purple-600">
              참가한 이벤트 히스토리 보기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
