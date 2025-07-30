"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAdminStore } from "@/stores/admin-store"
import { ArrowLeft, Calendar, MapPin, Plus, Search, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Event {
  id: string
  title: string
  startDate: string
  endDate: string
  location: string
  status: "upcoming" | "ongoing" | "completed"
  participants: number
  maxParticipants: number
  eventCode: string
}

export default function AdminEventsPage() {
  const router = useRouter()
  const { adminUser } = useAdminStore()
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "completed">("all")
  const [searchTerm, setSearchTerm] = useState("")

  // 더미 이벤트 데이터
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Neimd 네트워킹 데모 이벤트",
      startDate: "2025-01-25T14:00",
      endDate: "2025-01-25T18:00",
      location: "온라인",
      status: "upcoming",
      participants: 45,
      maxParticipants: 100,
      eventCode: "DEMO01"
    },
    {
      id: "2",
      title: "스타트업 네트워킹 밋업",
      startDate: "2025-01-20T19:00",
      endDate: "2025-01-20T22:00",
      location: "서울시 강남구",
      status: "completed",
      participants: 78,
      maxParticipants: 80,
      eventCode: "STARTUP01"
    },
    {
      id: "3",
      title: "개발자 커뮤니티 모임",
      startDate: "2025-01-30T15:00",
      endDate: "2025-01-30T17:00",
      location: "서울시 서초구",
      status: "upcoming",
      participants: 23,
      maxParticipants: 50,
      eventCode: "DEV01"
    }
  ])

  const getStatusBadge = (status: Event["status"]) => {
    const statusConfig = {
      upcoming: { label: "예정", color: "bg-blue-100 text-blue-800" },
      ongoing: { label: "진행중", color: "bg-green-100 text-green-800" },
      completed: { label: "완료", color: "bg-gray-100 text-gray-800" }
    }
    const config = statusConfig[status]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === "all" || event.status === filter
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.eventCode.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("정말로 이 이벤트를 삭제하시겠습니까?")) return

    try {
      // 실제로는 Supabase에서 이벤트를 삭제해야 함
      await new Promise(resolve => setTimeout(resolve, 500)) // 시뮬레이션

      setEvents(prev => prev.filter(event => event.id !== eventId))
      console.log('이벤트 삭제:', eventId)
    } catch (error) {
      console.error('이벤트 삭제 오류:', error)
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
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">이벤트 관리</h1>
          </div>
          <Link href="/admin/events/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              새 이벤트
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="이벤트명 또는 코드로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "upcoming", "ongoing", "completed"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={filter === status ? "bg-purple-600" : ""}
                >
                  {status === "all" && "전체"}
                  {status === "upcoming" && "예정"}
                  {status === "ongoing" && "진행중"}
                  {status === "completed" && "완료"}
                </Button>
              ))}
            </div>
          </div>

          {/* 이벤트 목록 */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">이벤트가 없습니다</h3>
                  <p className="text-gray-600 mb-4">새로운 이벤트를 생성해보세요</p>
                  <Link href="/admin/events/new">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      이벤트 생성
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          {getStatusBadge(event.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{event.participants}/{event.maxParticipants}명</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">이벤트 코드: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{event.eventCode}</span></span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/admin/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            상세보기
                          </Button>
                        </Link>
                        <Link href={`/admin/events/${event.id}/participants`}>
                          <Button variant="outline" size="sm">
                            참가자
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteEvent(event.id)}
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
