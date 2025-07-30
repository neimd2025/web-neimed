"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/stores/auth-store"
import { createClient } from "@/utils/supabase/client"
import { ArrowLeft, Megaphone, Plus, Search, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Notification {
  id: string
  title: string
  message: string
  target_type: "all" | "specific" | "event_participants"
  target_event?: string
  sent_date?: string
  delivered_count: number
  read_count: number
  status: "draft" | "sent" | "scheduled"
  created_at: string
  updated_at: string
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const { adminUser } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "draft" | "sent" | "scheduled">("all")
  const [isCreating, setIsCreating] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    target_type: "all" as "all" | "specific" | "event_participants",
    target_event: ""
  })

  // 알림 데이터 가져오기
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('알림 가져오기 오류:', error)
          toast.error('알림을 불러오는데 실패했습니다.')
          return
        }

        setNotifications(data || [])
      } catch (error) {
        console.error('알림 가져오기 오류:', error)
        toast.error('알림을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [supabase])

  const getStatusBadge = (status: Notification["status"]) => {
    const statusConfig = {
      draft: { label: "임시저장", color: "bg-gray-100 text-gray-800" },
      sent: { label: "전송완료", color: "bg-green-100 text-green-800" },
      scheduled: { label: "예약전송", color: "bg-blue-100 text-blue-800" }
    }
    const config = statusConfig[status]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === "all" || notification.status === filter
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error("제목과 내용을 모두 입력해주세요.")
      return
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title: newNotification.title,
          message: newNotification.message,
          target_type: newNotification.target_type,
          target_event: newNotification.target_event || null,
          sent_date: new Date().toISOString(),
          delivered_count: 0,
          read_count: 0,
          status: "sent"
        })
        .select()
        .single()

      if (error) {
        console.error('알림 전송 오류:', error)
        toast.error('알림 전송에 실패했습니다.')
        return
      }

      setNotifications(prev => [data, ...prev])
      setNewNotification({ title: "", message: "", target_type: "all", target_event: "" })
      setIsCreating(false)
      toast.success('알림이 성공적으로 전송되었습니다.')
    } catch (error) {
      console.error('알림 전송 오류:', error)
      toast.error('알림 전송에 실패했습니다.')
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm("정말로 이 알림을 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('알림 삭제 오류:', error)
        toast.error('알림 삭제에 실패했습니다.')
        return
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success('알림이 성공적으로 삭제되었습니다.')
    } catch (error) {
      console.error('알림 삭제 오류:', error)
      toast.error('알림 삭제에 실패했습니다.')
    }
  }

  if (!adminUser) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">공지 전송</h1>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            새 알림
          </Button>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 새 알림 작성 */}
          {isCreating && (
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="알림 제목을 입력하세요"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    className="border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">내용</Label>
                  <Textarea
                    id="message"
                    placeholder="알림 내용을 입력하세요"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    className="border-2 border-gray-200 focus:border-purple-500 rounded-lg min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetType">대상</Label>
                  <select
                    id="targetType"
                    value={newNotification.target_type}
                    onChange={(e) => setNewNotification(prev => ({
                      ...prev,
                      target_type: e.target.value as "all" | "specific" | "event_participants"
                    }))}
                    className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="all">전체 사용자</option>
                    <option value="event_participants">특정 이벤트 참가자</option>
                    <option value="specific">특정 사용자</option>
                  </select>
                </div>

                {newNotification.target_type === "event_participants" && (
                  <div className="space-y-2">
                    <Label htmlFor="targetEvent">이벤트 선택</Label>
                    <select
                      id="targetEvent"
                      value={newNotification.target_event}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, target_event: e.target.value }))}
                      className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="">이벤트를 선택하세요</option>
                      <option value="Neimd 네트워킹 데모 이벤트">Neimd 네트워킹 데모 이벤트</option>
                      <option value="스타트업 네트워킹 밋업">스타트업 네트워킹 밋업</option>
                      <option value="개발자 커뮤니티 모임">개발자 커뮤니티 모임</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    취소
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleSendNotification}
                  >
                    <Megaphone className="h-4 w-4 mr-2" />
                    전송
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="알림 제목 또는 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "draft", "sent", "scheduled"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={filter === status ? "bg-purple-600" : ""}
                >
                  {status === "all" && "전체"}
                  {status === "draft" && "임시저장"}
                  {status === "sent" && "전송완료"}
                  {status === "scheduled" && "예약전송"}
                </Button>
              ))}
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">알림 목록을 불러오는 중입니다...</p>
                </CardContent>
              </Card>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">알림이 없습니다</h3>
                  <p className="text-gray-600 mb-4">새로운 알림을 작성해보세요</p>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setIsCreating(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    새 알림
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                          {getStatusBadge(notification.status)}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{notification.message}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>
                              {notification.target_type === "all" && "전체 사용자"}
                              {notification.target_type === "event_participants" && `이벤트: ${notification.target_event}`}
                              {notification.target_type === "specific" && "특정 사용자"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>{notification.sent_date ? new Date(notification.sent_date).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>전송: {notification.delivered_count} | 읽음: {notification.read_count}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
