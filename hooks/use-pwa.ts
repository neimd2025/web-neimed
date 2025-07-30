import { useCallback, useEffect, useState } from 'react'

interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // PWA 설치 프롬프트 처리
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as PWAInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      console.log('PWA가 설치되었습니다!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 서비스 워커 등록
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker 등록 성공:', reg)
          setRegistration(reg)
        })
        .catch((error) => {
          console.error('Service Worker 등록 실패:', error)
        })
    }
  }, [])

  // PWA 설치
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('설치 프롬프트가 없습니다.')
      return false
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('PWA 설치가 수락되었습니다.')
        setIsInstalled(true)
        setDeferredPrompt(null)
        return true
      } else {
        console.log('PWA 설치가 거부되었습니다.')
        return false
      }
    } catch (error) {
      console.error('PWA 설치 중 오류:', error)
      return false
    }
  }, [deferredPrompt])

  // 푸시 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다.')
      return false
    }

    if (Notification.permission === 'granted') {
      console.log('알림 권한이 이미 허용되어 있습니다.')
      return true
    }

    if (Notification.permission === 'denied') {
      console.log('알림 권한이 거부되었습니다.')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('알림 권한 요청 중 오류:', error)
      return false
    }
  }, [])

  // 푸시 알림 전송
  const sendPushNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!registration) {
      console.log('Service Worker가 등록되지 않았습니다.')
      return false
    }

    try {
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      })
      return true
    } catch (error) {
      console.error('푸시 알림 전송 중 오류:', error)
      return false
    }
  }, [registration])

  // 백그라운드 동기화 등록
  const registerBackgroundSync = useCallback(async (tag: string) => {
    if (!registration || !('sync' in registration)) {
      console.log('백그라운드 동기화를 지원하지 않습니다.')
      return false
    }

    try {
      await (registration as any).sync.register(tag)
      console.log('백그라운드 동기화 등록:', tag)
      return true
    } catch (error) {
      console.error('백그라운드 동기화 등록 중 오류:', error)
      return false
    }
  }, [registration])

  // 오프라인 데이터 저장
  const saveOfflineData = useCallback(async (key: string, data: any) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
      console.log('오프라인 데이터 저장:', key)
      return true
    } catch (error) {
      console.error('오프라인 데이터 저장 중 오류:', error)
      return false
    }
  }, [])

  // 오프라인 데이터 로드
  const loadOfflineData = useCallback((key: string) => {
    try {
      const stored = localStorage.getItem(`offline_${key}`)
      if (stored) {
        const { data, timestamp } = JSON.parse(stored)
        console.log('오프라인 데이터 로드:', key)
        return data
      }
      return null
    } catch (error) {
      console.error('오프라인 데이터 로드 중 오류:', error)
      return null
    }
  }, [])

  // 오프라인 데이터 삭제
  const removeOfflineData = useCallback((key: string) => {
    try {
      localStorage.removeItem(`offline_${key}`)
      console.log('오프라인 데이터 삭제:', key)
      return true
    } catch (error) {
      console.error('오프라인 데이터 삭제 중 오류:', error)
      return false
    }
  }, [])

  // PWA 업데이트 확인
  const checkForUpdate = useCallback(async () => {
    if (!registration) return false

    try {
      await registration.update()
      console.log('PWA 업데이트 확인 완료')
      return true
    } catch (error) {
      console.error('PWA 업데이트 확인 중 오류:', error)
      return false
    }
  }, [registration])

  // 서비스 워커 새로고침
  const skipWaiting = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [registration])

  return {
    // 상태
    deferredPrompt,
    isInstalled,
    isOnline,
    registration,

    // 메서드
    installPWA,
    requestNotificationPermission,
    sendPushNotification,
    registerBackgroundSync,
    saveOfflineData,
    loadOfflineData,
    removeOfflineData,
    checkForUpdate,
    skipWaiting
  }
}
