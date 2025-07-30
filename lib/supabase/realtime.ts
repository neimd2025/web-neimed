import { createClient } from '@/utils/supabase/client'

// Realtime 이벤트 타입 정의
export interface RealtimeEvent {
  id: string
  type: 'notification' | 'event_update' | 'participant_update'
  title: string
  message: string
  data?: any
  timestamp: string
}

export interface NotificationEvent {
  id: string
  title: string
  message: string
  targetType: 'all' | 'specific' | 'event_participants'
  targetIds?: string[]
  sentDate: string
  deliveredCount: number
  readCount: number
}

export interface EventUpdate {
  id: string
  title: string
  status: 'upcoming' | 'ongoing' | 'completed'
  participants: number
  maxParticipants: number
  updatedAt: string
}

export interface ParticipantUpdate {
  eventId: string
  participantId: string
  status: 'confirmed' | 'pending' | 'cancelled'
  updatedAt: string
}

// Realtime 구독 관리 클래스
export class RealtimeManager {
  private supabase = createClient()
  private subscriptions: Map<string, any> = new Map()

  // 알림 실시간 구독
  subscribeToNotifications(userId: string, callback: (notification: NotificationEvent) => void) {
    const subscription = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `target_ids=cs.{${userId}}`
        },
        (payload) => {
          console.log('새 알림 수신:', payload.new)
          callback(payload.new as NotificationEvent)
        }
      )
      .subscribe()

    this.subscriptions.set(`notifications:${userId}`, subscription)
    return subscription
  }

  // 이벤트 업데이트 실시간 구독
  subscribeToEventUpdates(eventId: string, callback: (event: EventUpdate) => void) {
    const subscription = this.supabase
      .channel(`events:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`
        },
        (payload) => {
          console.log('이벤트 업데이트:', payload.new)
          callback(payload.new as EventUpdate)
        }
      )
      .subscribe()

    this.subscriptions.set(`events:${eventId}`, subscription)
    return subscription
  }

  // 참가자 업데이트 실시간 구독
  subscribeToParticipantUpdates(eventId: string, callback: (participant: ParticipantUpdate) => void) {
    const subscription = this.supabase
      .channel(`participants:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_participants',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('참가자 업데이트:', payload)
          callback({
            eventId,
            participantId: payload.new?.user_id || payload.old?.user_id,
            status: payload.new?.status,
            updatedAt: new Date().toISOString()
          } as ParticipantUpdate)
        }
      )
      .subscribe()

    this.subscriptions.set(`participants:${eventId}`, subscription)
    return subscription
  }

  // 전체 이벤트 목록 실시간 구독
  subscribeToAllEvents(callback: (events: EventUpdate[]) => void) {
    const subscription = this.supabase
      .channel('all_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        async () => {
          // 이벤트 목록을 다시 가져옴
          const { data: events } = await this.supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })

          if (events) {
            callback(events as EventUpdate[])
          }
        }
      )
      .subscribe()

    this.subscriptions.set('all_events', subscription)
    return subscription
  }

  // 구독 해제
  unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName)
    if (subscription) {
      this.supabase.removeChannel(subscription)
      this.subscriptions.delete(channelName)
      console.log(`구독 해제: ${channelName}`)
    }
  }

  // 모든 구독 해제
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, channelName) => {
      this.supabase.removeChannel(subscription)
      console.log(`구독 해제: ${channelName}`)
    })
    this.subscriptions.clear()
  }

  // 연결 상태 확인
  getConnectionStatus() {
    return this.supabase.getChannels()
  }
}

// 싱글톤 인스턴스
export const realtimeManager = new RealtimeManager()

// 훅에서 사용할 수 있는 유틸리티 함수들
export const useRealtime = () => {
  return {
    subscribeToNotifications: realtimeManager.subscribeToNotifications.bind(realtimeManager),
    subscribeToEventUpdates: realtimeManager.subscribeToEventUpdates.bind(realtimeManager),
    subscribeToParticipantUpdates: realtimeManager.subscribeToParticipantUpdates.bind(realtimeManager),
    subscribeToAllEvents: realtimeManager.subscribeToAllEvents.bind(realtimeManager),
    unsubscribe: realtimeManager.unsubscribe.bind(realtimeManager),
    unsubscribeAll: realtimeManager.unsubscribeAll.bind(realtimeManager),
    getConnectionStatus: realtimeManager.getConnectionStatus.bind(realtimeManager)
  }
}
