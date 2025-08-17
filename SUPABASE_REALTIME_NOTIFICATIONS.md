# Supabase 실시간 알림 시스템 구현 가이드

## 📋 개요

이 가이드는 Supabase를 사용하여 실시간 알림 시스템을 구현하는 방법을 설명합니다. 관리자가 이벤트 참가자들에게 공지를 전송하면, 사용자들이 실시간으로 알림을 받을 수 있는 시스템입니다.

## 🗄️ 데이터베이스 구조

### 1. 테이블 생성

```sql
-- notifications 테이블 (알림 내용 및 사용자별 상태)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'specific', 'event_participants')),
  target_event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES auth.users(id),  -- 개별 사용자 ID
  sent_by UUID REFERENCES auth.users(id),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id OR target_type = 'all');

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = sent_by);
```

### 2. 테이블 구조 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | UUID | 고유 식별자 |
| `title` | TEXT | 알림 제목 |
| `message` | TEXT | 알림 내용 |
| `target_type` | TEXT | 대상 타입 (all, specific, event_participants) |
| `target_event_id` | UUID | 대상 이벤트 ID |
| `user_id` | UUID | 수신자 사용자 ID |
| `sent_by` | UUID | 발송자 사용자 ID |
| `read_at` | TIMESTAMPTZ | 읽음 처리 시간 |
| `created_at` | TIMESTAMPTZ | 생성 시간 |

## 🔧 관리자 알림 전송 구현

### 1. 관리자 페이지 컴포넌트

```typescript
// app/admin/events/page.tsx
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function AdminEventsPage() {
  const [noticeTitle, setNoticeTitle] = useState("")
  const [noticeMessage, setNoticeMessage] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSendNotice = async () => {
    if (!selectedEvent || !noticeTitle || !noticeMessage || !adminUser) {
      toast.error('제목과 메시지를 모두 입력해주세요.')
      return
    }

    try {
      setLoading(true)

      // 1. 이벤트 참가자 목록 가져오기
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', selectedEvent.id)

      if (participantsError) {
        console.error('참가자 목록 조회 오류:', participantsError)
        toast.error('참가자 목록을 가져오는데 실패했습니다.')
        return
      }

      if (!participants || participants.length === 0) {
        toast.error('이벤트에 참가자가 없습니다.')
        return
      }

      // 2. 배치 처리로 효율적으로 알림 전송
      const batchSize = 50; // 한 번에 50개씩 처리
      let successCount = 0;

      for (let i = 0; i < participants.length; i += batchSize) {
        const batch = participants.slice(i, i + batchSize);

        const notifications = batch.map(participant => ({
          title: noticeTitle,
          message: noticeMessage,
          target_type: 'event_participants',
          target_event_id: selectedEvent.id,
          user_id: participant.user_id,
          sent_by: adminUser.id
        }));

        const { error: batchError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (batchError) {
          console.error(`배치 ${Math.floor(i / batchSize) + 1} 전송 실패:`, batchError);
        } else {
          successCount += batch.length;
        }
      }

      if (successCount === participants.length) {
        toast.success(`${participants.length}명의 참가자에게 공지가 성공적으로 전송되었습니다.`)
      } else {
        toast.warning(`${successCount}명에게 전송되었습니다. (${participants.length - successCount}명 실패)`)
      }

      setShowNoticeModal(false)
      setNoticeTitle("")
      setNoticeMessage("")
      setSelectedEvent(null)
    } catch (error) {
      console.error('공지 전송 오류:', error)
      toast.error('공지 전송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // UI 컴포넌트...
  )
}
```

## 📱 사용자 알림 페이지 구현

### 1. 알림 페이지 컴포넌트

```typescript
// app/notifications/page.tsx
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  target_id?: string
  created_at: string
  read_at?: string
  user_id: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  // 알림 새로고침 함수
  const refreshNotifications = async () => {
    if (!user) return

    try {
      console.log('알림 새로고침 시작, 사용자 ID:', user.id)

      // 사용자에게 전송된 알림들을 가져옴
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},target_type.eq.all`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('알림 새로고침 오류:', error)
        return
      }

      console.log('새로고침된 알림 데이터:', data)
      setNotifications(data || [])
    } catch (error) {
      console.error('알림 새로고침 오류:', error)
    }
  }

  // 알림 데이터 가져오기
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return

      try {
        setLoading(true)
        console.log('알림 가져오기 시작, 사용자 ID:', user.id)

        // 사용자에게 전송된 알림들을 가져옴
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`user_id.eq.${user.id},target_type.eq.all`)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('알림 가져오기 오류:', error)
          toast.error('알림을 불러오는데 실패했습니다.')
          return
        }

        console.log('필터링된 알림 데이터:', data)
        setNotifications(data || [])
      } catch (error) {
        console.error('알림 가져오기 오류:', error)
        toast.error('알림을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user, supabase])

  // 페이지 포커스 시 알림 새로고침
  useEffect(() => {
    const handleFocus = () => {
      console.log('페이지 포커스됨, 알림 새로고침')
      refreshNotifications()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  // 실시간 알림 수신을 위한 useEffect
  useEffect(() => {
    if (!user) return

    console.log('실시간 알림 구독 시작, 사용자 ID:', user.id)
    setIsConnected(true)

    // 개선된 실시간 구독
    const channel = supabase.channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('새 알림 실시간 수신:', payload.new)
          const newNotification = payload.new as Notification

          // 현재 사용자에게 온 알림인지 확인
          if (newNotification.user_id === user.id || newNotification.target_type === 'all') {
            console.log('사용자에게 맞는 알림 확인됨:', newNotification)
            setNotifications((prev) => [newNotification, ...prev])
            toast.success('새 알림이 도착했습니다!')
          }
        }
      )
      .subscribe((status) => {
        console.log('실시간 구독 상태:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      console.log('실시간 알림 구독 해제')
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [user, supabase])

  // 알림 읽음 처리 함수
  const markAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('알림 읽음 처리 오류:', error)
        return
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      )
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error)
    }
  }

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id)
    }

    // 알림 타입에 따른 라우팅
    switch (notification.type) {
      case 'business_card':
        if (notification.target_id) {
          window.location.href = `/business-card/${notification.target_id}`
        }
        break
      case 'event':
        if (notification.target_id) {
          window.location.href = `/events/${notification.target_id}`
        }
        break
      case 'announcement':
        // 공지사항 상세 페이지로 이동 (필요시 구현)
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <MobileHeader title="최근 활동 및 알림" showMenuButton />

      {/* 디버깅 정보 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
          <p className="text-xs text-yellow-800">
            디버그: 연결 상태: {isConnected ? '연결됨' : '연결 안됨'} |
            알림 수: {notifications.length} |
            사용자 ID: {user?.id}
          </p>
        </div>
      )}

      <div className="px-4 py-6 space-y-4">
        {/* 새로고침 버튼 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">알림</h2>
          <button
            onClick={refreshNotifications}
            disabled={loading}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
          >
            {loading ? '새로고침 중...' : '새로고침'}
          </button>
        </div>

        {loading ? (
          <p className="text-center py-8">알림을 불러오는 중입니다...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center py-8">아직 받은 알림이 없습니다.</p>
        ) : (
          notifications.map((notification) => {
            const { icon, color, bg } = getNotificationIcon(notification.type)
            return (
              <Card
                key={notification.id}
                className="border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      {React.createElement(icon, { className: `h-5 w-5 ${color}` })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              notification.type === "event"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {notification.type === "business_card" ? "명함" :
                             notification.type === "event" ? "이벤트" :
                             notification.type === "announcement" ? "공지" : "알림"}
                          </Badge>
                          {!notification.read_at && <div className="w-2 h-2 bg-purple-600 rounded-full"></div>}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatTime(notification.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
```

## 🔧 환경 설정

### 1. Supabase 클라이언트 설정

```typescript
// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey)
```

### 2. 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ✨ 주요 특징

### 1. **배치 처리**
- 대용량 알림 전송 시 성능 최적화
- 한 번에 50개씩 처리하여 안정성 확보

### 2. **실시간 구독**
- Supabase Realtime을 활용한 즉시 알림
- 필터 없이 모든 INSERT 이벤트 수신 후 클라이언트에서 필터링

### 3. **보안**
- RLS (Row Level Security)로 사용자별 데이터 접근 제어
- 사용자는 자신의 알림만 볼 수 있음

### 4. **성능 최적화**
- 인덱스 추가로 쿼리 성능 향상
- 페이지 포커스 시 자동 새로고침

### 5. **사용자 경험**
- 실시간 토스트 알림
- 읽음/안읽음 상태 표시
- 새로고침 버튼으로 수동 업데이트

## 🚀 사용 방법

### 1. 관리자가 공지 전송
1. 관리자 페이지에서 이벤트 선택
2. 공지 제목과 내용 입력
3. "공지 전송" 버튼 클릭
4. 자동으로 모든 참가자에게 배치 처리로 전송

### 2. 사용자가 알림 확인
1. 알림 페이지 접속
2. 실시간으로 새 알림 수신
3. 알림 클릭 시 읽음 처리 및 해당 페이지로 이동

## 🔍 디버깅

### 1. 개발 모드에서 디버깅 정보 표시
- 연결 상태
- 알림 수
- 사용자 ID

### 2. 콘솔 로그 확인
- 실시간 구독 상태
- 알림 수신 로그
- 오류 메시지

## ⚠️ 주의사항

1. **사용자 수 증가 시 고려사항**
   - 현재 방식은 사용자가 많아지면 데이터 중복 문제 발생
   - 대규모 서비스의 경우 하이브리드 방식 고려 필요

2. **실시간 구독 한계**
   - 네트워크 연결이 불안정하면 이벤트를 놓칠 수 있음
   - 브라우저 탭이 백그라운드에 있으면 제한될 수 있음

3. **성능 최적화**
   - 알림이 많아지면 페이지네이션 고려
   - 오래된 알림 자동 삭제 정책 수립

## 📚 추가 리소스

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)

---

이 가이드를 따라하면 Supabase를 사용한 실시간 알림 시스템을 쉽게 구현할 수 있습니다! 🚀
