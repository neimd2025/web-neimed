"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { calculateEventStatus, eventAPI } from '@/lib/supabase/database'
import { logError } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, User, Users } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  location: string | null
  status: string | null
  current_participants: number | null
  max_participants: number | null
  event_code: string | null
  created_at: string | null
  created_by: string | null
  updated_at: string | null
}

interface Participant {
  id: string
  user_id: string
  event_id: string
  status: string
  joined_at: string
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [isParticipant, setIsParticipant] = useState(false)

  useEffect(() => {
    const fetchEventData = async () => {
      if (!params.id) return

      try {
        setLoading(true)

                const eventData = await eventAPI.getEvent(params.id as string)
        setEvent(eventData)

        // 참가자 목록 로드
        await loadParticipants(params.id as string)

        // 현재 사용자가 참가자인지 확인
        if (user) {
          await checkParticipantStatus(params.id as string)
        }
      } catch (error) {
        logError('이벤트 로드 오류:', error)
        toast.error('이벤트를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [params.id, user])

  const loadParticipants = useCallback(async (eventId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .order('joined_at', { ascending: false })

      if (error) {
        logError('참가자 목록 로드 오류:', error)
        return
      }

      setParticipants(data || [])
    } catch (error) {
      logError('참가자 목록 로드 오류:', error)
    }
  }, [])

  const checkParticipantStatus = useCallback(async (eventId: string) => {
    if (!user) return

    try {
      const supabase = createClient()
      // 모든 참가자 목록을 가져온 후 클라이언트에서 필터링
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)

      if (error) {
        logError('참가자 상태 확인 오류:', error)
        return
      }

      // 클라이언트에서 현재 사용자의 참가 상태 확인
      const userParticipation = data?.find(participant => participant.user_id === user.id)
      setIsParticipant(!!userParticipation)
    } catch (error) {
      logError('참가자 상태 확인 오류:', error)
    }
  }, [user])

  const getStatusBadge = (event: any) => {
    const status = calculateEventStatus(event)
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

  const handleJoinEvent = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      return
    }

    if (!event) {
      toast.error('이벤트 정보를 불러올 수 없습니다.')
      return
    }

    if (isParticipant) {
      toast.error('이미 참가한 이벤트입니다.')
      return
    }

    setJoining(true)
    try {
      const supabase = createClient()

      // 이벤트 참가 정보 추가
      const { error: joinError } = await supabase
        .from('event_participants')
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: 'confirmed',
          joined_at: new Date().toISOString()
        })

      if (joinError) {
        logError('이벤트 참가 오류:', joinError)
        toast.error('이벤트 참가에 실패했습니다.')
        return
      }

      // 이벤트 참가자 수 업데이트
      const { error: updateError } = await supabase
        .from('events')
        .update({
          current_participants: (event.current_participants || 0) + 1
        })
        .eq('id', event.id)

      if (updateError) {
        logError('참가자 수 업데이트 오류:', updateError)
      }

      toast.success('이벤트에 참가했습니다!')
      setIsParticipant(true)

      // 이벤트 정보와 참가자 목록 새로고침
      const updatedEvent = await eventAPI.getEvent(event.id)
      setEvent(updatedEvent)
      await loadParticipants(event.id)

    } catch (error) {
      logError('이벤트 참가 중 오류:', error)
      toast.error('이벤트 참가에 실패했습니다.')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">이벤트 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">이벤트를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 이벤트가 존재하지 않거나 삭제되었습니다.</p>
          <Link href="/events/history">
            <Button>이벤트 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">이벤트 상세</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* 이벤트 정보 */}
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                {getStatusBadge(event)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{event.description}</p>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">시작일</p>
                  <p className="font-medium">
                    {new Date(event.start_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">종료일</p>
                  <p className="font-medium">
                    {new Date(event.end_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">장소</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">참가자</p>
                  <p className="font-medium">
                    {event.current_participants || 0} / {event.max_participants || 0}명
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 참가자 목록 */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">참가자 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {participants.length > 0 ? (
                participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          참가자 {participant.user_id.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(participant.joined_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">참가</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>아직 참가자가 없습니다</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="flex gap-3">
          {isParticipant ? (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              참가 완료
            </Button>
          ) : (
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleJoinEvent}
              disabled={joining || calculateEventStatus(event) === 'completed'}
            >
              {joining ? '참가 중...' : calculateEventStatus(event) === 'completed' ? '종료된 이벤트' : '이벤트 참가하기'}
            </Button>
          )}

          <Link href="/scan-card" className="flex-1">
            <Button variant="outline" className="w-full">
              명함 스캔하기
            </Button>
          </Link>
        </div>

        {/* QR 코드 스캔 안내 */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-purple-900 mb-2">💡 팁</h3>
            <p className="text-sm text-purple-700">
              다른 참가자들의 명함을 스캔하여 네트워킹을 시작해보세요!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
