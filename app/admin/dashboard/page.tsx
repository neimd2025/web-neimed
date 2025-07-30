"use client"

import AdminHeader from "@/components/admin/admin-header"
import NoticeModal from "@/components/admin/notice-modal"
import ParticipantModal from "@/components/admin/participant-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Plus, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("진행중")
  const [showParticipants, setShowParticipants] = useState(false)
  const [showNotice, setShowNotice] = useState(false)

  const events = [
    {
      id: 1,
      title: "2025 대학생 커뮤니티",
      date: "2025.08.10.",
      participants: 113,
      code: "NBD2308",
      status: "진행중",
      image: "/placeholder.svg?height=200&width=350&text=University+Community",
    },
    {
      id: 2,
      title: "AI 스타트업 밋업",
      date: "2025.01.25.",
      participants: 113,
      code: "NBD2308",
      status: "진행중",
      image: "/placeholder.svg?height=200&width=350&text=AI+Startup+Meetup",
    },
  ]

  const tabs = ["진행중", "예정", "종료"]

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />

      <div className="px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="border border-gray-200 overflow-hidden">
              <div className="relative">
                <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover" />
                <Badge className="absolute top-3 left-3 bg-blue-600 text-white">{event.status}</Badge>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                  <p className="text-gray-500">{event.date}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">제출자: {event.participants}명</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">코드: {event.code}</span>
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        링크
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowParticipants(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    참여자 보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowNotice(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    공지 전송
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    리포트 받기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/admin/events/new">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>

      {/* Modals */}
      <ParticipantModal open={showParticipants} onClose={() => setShowParticipants(false)} />
      <NoticeModal open={showNotice} onClose={() => setShowNotice(false)} />
    </div>
  )
}
