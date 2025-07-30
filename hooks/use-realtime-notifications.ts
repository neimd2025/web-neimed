import { NotificationEvent, realtimeManager } from '@/lib/supabase/realtime'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from './use-auth'

export const useRealtimeNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // 새 알림 수신 처리
  const handleNewNotification = useCallback((notification: NotificationEvent) => {
    console.log('새 알림 수신:', notification)

    // 알림 목록에 추가
    setNotifications(prev => [notification, ...prev])

    // 토스트 알림 표시
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
      action: {
        label: '확인',
        onClick: () => {
          // 알림 상세 페이지로 이동하거나 알림을 읽음 처리
          console.log('알림 확인:', notification.id)
        }
      }
    })
  }, [])

  // 실시간 구독 설정
  useEffect(() => {
    if (!user?.id) return

    console.log('실시간 알림 구독 시작:', user.id)
    setIsConnected(true)

    // 알림 구독
    const subscription = realtimeManager.subscribeToNotifications(user.id, handleNewNotification)

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log('실시간 알림 구독 해제')
      realtimeManager.unsubscribe(`notifications:${user.id}`)
      setIsConnected(false)
    }
  }, [user?.id, handleNewNotification])

  // 알림 읽음 처리
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // 실제로는 Supabase에서 알림을 읽음 처리해야 함
      console.log('알림 읽음 처리:', notificationId)

      // 로컬 상태에서 읽음 처리
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, readCount: notification.readCount + 1 }
            : notification
        )
      )
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error)
    }
  }, [])

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      console.log('모든 알림 읽음 처리')

      // 실제로는 Supabase에서 모든 알림을 읽음 처리해야 함
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, readCount: notification.readCount + 1 }))
      )
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error)
    }
  }, [])

  // 알림 삭제
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      console.log('알림 삭제:', notificationId)

      // 실제로는 Supabase에서 알림을 삭제해야 함
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
    } catch (error) {
      console.error('알림 삭제 오류:', error)
    }
  }, [])

  return {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
}
