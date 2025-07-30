"use client"
import MobileHeader from "@/components/mobile-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Calendar, Megaphone, Plus } from "lucide-react"
import { useEffect, useState } from "react"

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "business_card",
      icon: Plus,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      title: "명함 수집",
      description: "정민원님의 명함을 수집했습니다",
      time: "12시간 전",
      status: "활동",
    },
    {
      id: 2,
      type: "business_card",
      icon: Plus,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      title: "명함 수집",
      description: "최은정님의 명함을 수집했습니다",
      time: "12시간 전",
      status: "활동",
    },
    {
      id: 3,
      type: "business_card",
      icon: Plus,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      title: "명함 수집",
      description: "박준호님의 명함을 수집했습니다",
      time: "15시간 전",
      status: "활동",
    },
    {
      id: 4,
      type: "event",
      icon: Calendar,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      title: "이벤트 참가",
      description: "Neimd 네트워킹 데모 이벤트에 참가했습니다",
      time: "1일 전",
      status: "활동",
    },
    {
      id: 5,
      type: "announcement",
      icon: Megaphone,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      title: "새로운 네트워킹 이벤트",
      description: "UX/UI 디자이너 모임이 2월 15일에 열립니다. 지금 참가신청하세요!",
      time: "2일 전",
      status: "알림",
      hasIndicator: true,
    },
  ])

  // 알림 읽음 처리 함수
  const markAsRead = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, hasIndicator: false }
          : notification
      )
    )
  }

  // 알림 클릭 처리
  const handleNotificationClick = (notification: any) => {
    if (notification.hasIndicator) {
      markAsRead(notification.id)
    }

    // 알림 타입에 따른 라우팅
    switch (notification.type) {
      case 'business_card':
        // 명함 상세 페이지로 이동
        break
      case 'event':
        // 이벤트 상세 페이지로 이동
        break
      case 'announcement':
        // 공지사항 상세 페이지로 이동
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <MobileHeader title="최근 활동 및 알림" showMenuButton />

      <div className="px-4 py-6 space-y-4">
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <Card
              key={notification.id}
              className="border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 ${notification.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`h-5 w-5 ${notification.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            notification.status === "활동"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {notification.status}
                        </Badge>
                        {notification.hasIndicator && <div className="w-2 h-2 bg-purple-600 rounded-full"></div>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
