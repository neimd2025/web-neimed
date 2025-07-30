"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAdminStore } from "@/stores/admin-store"
import { ArrowLeft, Bell, Send, Users, Calendar, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Notification {
  id: string
  title: string
  message: string
  targetType: "all" | "specific" | "event_participants"
  targetEvent?: string
  sentDate: string
  deliveredCount: number
  readCount: number
  status: "draft" | "sent" | "scheduled"
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const { adminUser, sendPushNotification } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "draft" | "sent" | "scheduled">("all")
  const [isCreating, setIsCreating] = useState(false)

  // 더미 알림 데이터
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "이벤트 참가 확정 안내",
      message: "Neimd 네트워킹 데모 이벤트 참가가 확정되었습니다. 자세한 내용은 앱을 확인해주세요.",
      targetType: "event_participants",
      targetEvent: "Neimd 네트워킹 데모 이벤트",
      sentDate: "2025-01-20",
      deliveredCount: 45,
      readCount: 38,
      status: "sent"
    },
    {
      id: "2",
      title: "새로운 기능 업데이트",
      message: "Neimd 앱에 새로운 기능이 추가되었습니다. 더 나은 네트워킹 경험을 제공합니다.",
      targetType: "all",
      sentDate: "2025-01-18",
      deliveredCount: 156,
      readCount: 89,
      status: "sent"
    },
    {
      id: "3",
      title: "이벤트 시작 1시간 전",
      message: "곧 이벤트가 시작됩니다. 준비해주세요!",
      targetType: "event_participants",
      targetEvent: "스타트업 네트워킹 밋업",
      sentDate: "2025-01-25",
      deliveredCount: 78,
      readCount: 65,
      status: "scheduled"
    }
  ])

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    targetType: "all" as "all" | "specific" | "event_participants",
    targetEvent: ""
  })

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
      alert("제목과 내용을 모두 입력해주세요.")
      return
    }

    try {
      // 실제로는 Supabase에 알림을 저장하고 전송해야 함
      await new Promise(resolve => setTimeout(resolve, 1000)) // 시뮬레이션

      const notification: Notification = {
        id: Date.now().toString(),
        title: newNotification.title,
        message: newNotification.message,
        targetType: newNotification.targetType,
        targetEvent: newNotification.targetEvent,
        sentDate: new Date().toISOString().split("T")[0],
        deliveredCount: 0,
        readCount: 0,
        status: "sent"
      }

      setNotifications(prev => [notification, ...prev])
      setNewNotification({ title: "", message: "", targetType: "all", targetEvent: "" })
      setIsCreating(false)

      console.log('알림 전송:', notification)
    } catch (error) {
      console.error('알림 전송 오류:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm("정말로 이 알림을 삭제하시겠습니까?")) return

    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      console.log('알림 삭제:', notificationId)
    } catch (error) {
      console.error('알림 삭제 오류:', error)
    }
  }

  if (!adminUser) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">공지 전송</h1>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsCreating(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            새 알림
          </Button>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 새 알림 작성 */}
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>새 알림 작성</CardTitle>
              </CardHeader>
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
                    value={newNotification.targetType}
                    onChange={(e) => setNewNotification(prev => ({
                      ...prev,
                      targetType: e.target.value as "all" | "specific" | "event_participants"
                    }))}
                    className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="all">전체 사용자</option>
                    <option value="event_participants">특정 이벤트 참가자</option>
                    <option value="specific">특정 사용자</option>
                  </select>
                </div>

                {newNotification.targetType === "event_participants" && (
                  <div className="space-y-2">
                    <Label htmlFor="targetEvent">이벤트 선택</Label>
                    <select
                      id="targetEvent"
                      value={newNotification.targetEvent}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, targetEvent: e.target.value }))}
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
                    <Send className="h-4 w-4 mr-2" />
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
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">알림이 없습니다</h3>
                  <p className="text-gray-600 mb-4">새로운 알림을 작성해보세요</p>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setIsCreating(true)}
                  >
                    <Send className="h-4 w-4 mr-2" />
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
                            <Users className="h-4 w-4" />
                            <span>
                              {notification.targetType === "all" && "전체 사용자"}
                              {notification.targetType === "event_participants" && `이벤트: ${notification.targetEvent}`}
                              {notification.targetType === "specific" && "특정 사용자"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{notification.sentDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>전송: {notification.deliveredCount} | 읽음: {notification.readCount}</span>
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
