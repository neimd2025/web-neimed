import { EventUpdate, ParticipantUpdate, realtimeManager } from '@/lib/supabase/realtime'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useRealtimeEvents = () => {
  const [events, setEvents] = useState<EventUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // 이벤트 업데이트 처리
  const handleEventUpdate = useCallback((updatedEvent: EventUpdate) => {
    console.log('이벤트 업데이트:', updatedEvent)

    setEvents(prev =>
      prev.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )

    // 토스트 알림 표시
    toast(`이벤트 업데이트: ${updatedEvent.title}`, {
      description: `상태: ${updatedEvent.status} | 참가자: ${updatedEvent.participants}/${updatedEvent.maxParticipants}`,
      duration: 3000
    })
  }, [])

  // 전체 이벤트 목록 업데이트 처리
  const handleAllEventsUpdate = useCallback((updatedEvents: EventUpdate[]) => {
    console.log('전체 이벤트 목록 업데이트:', updatedEvents)
    setEvents(updatedEvents)
  }, [])

  // 실시간 구독 설정
  useEffect(() => {
    console.log('실시간 이벤트 구독 시작')
    setIsConnected(true)

    // 전체 이벤트 구독
    const subscription = realtimeManager.subscribeToAllEvents(handleAllEventsUpdate)

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log('실시간 이벤트 구독 해제')
      realtimeManager.unsubscribe('all_events')
      setIsConnected(false)
    }
  }, [handleAllEventsUpdate])

  return {
    events,
    isConnected,
    handleEventUpdate
  }
}

// 특정 이벤트 실시간 구독 훅
export const useRealtimeEvent = (eventId: string) => {
  const [event, setEvent] = useState<EventUpdate | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // 이벤트 업데이트 처리
  const handleEventUpdate = useCallback((updatedEvent: EventUpdate) => {
    console.log('특정 이벤트 업데이트:', updatedEvent)
    setEvent(updatedEvent)

    // 토스트 알림 표시
    toast(`이벤트 업데이트: ${updatedEvent.title}`, {
      description: `상태: ${updatedEvent.status} | 참가자: ${updatedEvent.participants}/${updatedEvent.maxParticipants}`,
      duration: 3000
    })
  }, [])

  // 실시간 구독 설정
  useEffect(() => {
    if (!eventId) return

    console.log('특정 이벤트 실시간 구독 시작:', eventId)
    setIsConnected(true)

    // 특정 이벤트 구독
    const subscription = realtimeManager.subscribeToEventUpdates(eventId, handleEventUpdate)

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log('특정 이벤트 실시간 구독 해제:', eventId)
      realtimeManager.unsubscribe(`events:${eventId}`)
      setIsConnected(false)
    }
  }, [eventId, handleEventUpdate])

  return {
    event,
    isConnected
  }
}

// 참가자 실시간 구독 훅
export const useRealtimeParticipants = (eventId: string) => {
  const [participants, setParticipants] = useState<ParticipantUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // 참가자 업데이트 처리
  const handleParticipantUpdate = useCallback((participantUpdate: ParticipantUpdate) => {
    console.log('참가자 업데이트:', participantUpdate)

    setParticipants(prev => {
      const existingIndex = prev.findIndex(p => p.participantId === participantUpdate.participantId)

      if (existingIndex >= 0) {
        // 기존 참가자 업데이트
        const updated = [...prev]
        updated[existingIndex] = participantUpdate
        return updated
      } else {
        // 새 참가자 추가
        return [...prev, participantUpdate]
      }
    })

    // 토스트 알림 표시
    toast('참가자 상태 변경', {
      description: `참가자 ID: ${participantUpdate.participantId} | 상태: ${participantUpdate.status}`,
      duration: 3000
    })
  }, [])

  // 실시간 구독 설정
  useEffect(() => {
    if (!eventId) return

    console.log('참가자 실시간 구독 시작:', eventId)
    setIsConnected(true)

    // 참가자 구독
    const subscription = realtimeManager.subscribeToParticipantUpdates(eventId, handleParticipantUpdate)

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log('참가자 실시간 구독 해제:', eventId)
      realtimeManager.unsubscribe(`participants:${eventId}`)
      setIsConnected(false)
    }
  }, [eventId, handleParticipantUpdate])

  return {
    participants,
    isConnected
  }
}
