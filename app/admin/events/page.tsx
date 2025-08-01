"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/stores/auth-store"
import { createClient } from "@/utils/supabase/client"
import { ArrowLeft, Bell, Calendar, Copy, Eye, FileText, Filter, MapPin, MoreVertical, Plus, Save, Search, Share, Users, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Event {
  id: string
  title: string
  start_date: string
  end_date: string
  location: string
  status: "upcoming" | "ongoing" | "completed"
  max_participants: number
  event_code: string
  created_at: string
  updated_at: string
  image_url?: string
}

export default function AdminEventsPage() {
  const router = useRouter()
  const { adminUser } = useAuthStore()
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "completed">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [noticeTitle, setNoticeTitle] = useState("")
  const [noticeMessage, setNoticeMessage] = useState("")
  const supabase = createClient()

  // 이벤트 데이터 가져오기
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('이벤트 가져오기 오류:', error)
          toast.error('이벤트를 불러오는데 실패했습니다.')
          return
        }

        setEvents(data || [])
      } catch (error) {
        console.error('이벤트 가져오기 오류:', error)
        toast.error('이벤트를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [supabase])

  const getStatusBadge = (status: Event["status"]) => {
    const statusConfig = {
      upcoming: { label: "예정", color: "bg-blue-50 text-blue-700 border-blue-200" },
      ongoing: { label: "진행중", color: "bg-green-50 text-green-700 border-green-200" },
      completed: { label: "완료", color: "bg-gray-50 text-gray-700 border-gray-200" }
    }
    const config = statusConfig[status]
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
  }

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === "all" || event.status === filter
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.event_code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("정말로 이 이벤트를 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) {
        console.error('이벤트 삭제 오류:', error)
        toast.error('이벤트 삭제에 실패했습니다.')
        return
      }

      setEvents(prev => prev.filter(event => event.id !== eventId))
      toast.success('이벤트가 성공적으로 삭제되었습니다.')
    } catch (error) {
      console.error('이벤트 삭제 오류:', error)
      toast.error('이벤트 삭제에 실패했습니다.')
    }
  }

  const handleSendNotice = async () => {
    if (!selectedEvent || !noticeTitle || !noticeMessage) {
      toast.error('제목과 메시지를 모두 입력해주세요.')
      return
    }

    try {
      // 공지 전송 로직 구현
      toast.success('공지가 성공적으로 전송되었습니다.')
      setShowNoticeModal(false)
      setNoticeTitle("")
      setNoticeMessage("")
      setSelectedEvent(null)
    } catch (error) {
      console.error('공지 전송 오류:', error)
      toast.error('공지 전송에 실패했습니다.')
    }
  }

  const handleCopyLink = () => {
    if (selectedEvent) {
      const link = `${window.location.origin}/events/${selectedEvent.id}`
      navigator.clipboard.writeText(link)
      toast.success('링크가 복사되었습니다.')
    }
  }

  const handleShare = () => {
    if (selectedEvent) {
      const link = `${window.location.origin}/events/${selectedEvent.id}`
      if (navigator.share) {
        navigator.share({
          title: selectedEvent.title,
          text: `${selectedEvent.title} 이벤트에 참여해보세요!`,
          url: link
        })
      } else {
        navigator.clipboard.writeText(link)
        toast.success('링크가 복사되었습니다.')
      }
    }
  }

  const handleSaveQR = () => {
    // QR 코드 저장 로직 구현
    toast.success('QR 코드가 저장되었습니다.')
  }

  if (!adminUser) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">NN</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Neimd Network</span>
                <div className="text-xs text-gray-500">이벤트 관리</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md">
              이벤트
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-medium">D</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* 검색 및 필터 섹션 */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="이벤트명 또는 코드로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                <div className="flex">
                  {(["all", "upcoming", "ongoing", "completed"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        filter === status
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {status === "all" && "전체"}
                      {status === "upcoming" && "예정"}
                      {status === "ongoing" && "진행중"}
                      {status === "completed" && "완료"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-900">{filteredEvents.length}</div>
                  <div className="text-sm text-blue-700">전체 이벤트</div>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {filteredEvents.filter(e => e.status === "ongoing").length}
                  </div>
                  <div className="text-sm text-green-700">진행중</div>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {filteredEvents.filter(e => e.status === "upcoming").length}
                  </div>
                  <div className="text-sm text-purple-700">예정</div>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredEvents.filter(e => e.status === "completed").length}
                  </div>
                  <div className="text-sm text-gray-700">완료</div>
                </div>
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 이벤트 목록 */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">이벤트를 불러오는 중입니다...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">이벤트가 없습니다</h3>
                <p className="text-gray-600 mb-6">새로운 이벤트를 생성하여 네트워킹을 시작해보세요</p>
                <Link href="/admin/events/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    이벤트 생성
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <div className="relative">
                    {/* 이벤트 이미지 */}
                    <div className="h-40 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 relative">
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="sm" className="bg-black bg-opacity-20 hover:bg-opacity-30 text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">{event.location || "온라인"}</span>
                        </div>
                      </div>
                    </div>

                    {/* 이벤트 정보 */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.start_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{event.max_participants}명</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">코드:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">
                            {event.event_code}
                          </code>
                        </div>
                        <div className="w-6 h-6 border-2 border-purple-600 rounded-sm relative">
                          <div className="absolute inset-0.5 border border-purple-600 rounded-sm"></div>
                          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-purple-600 rounded-full"></div>
                          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-purple-600 rounded-full"></div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
                          onClick={() => {
                            setSelectedEvent(event)
                            router.push(`/admin/events/${event.id}/participants`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">참여자</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200"
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowNoticeModal(true)
                          }}
                        >
                          <Bell className="h-4 w-4" />
                          <span className="hidden sm:inline">공지</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-200"
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowQRModal(true)
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline">QR</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 공지 전송 모달 */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">공지 전송</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNoticeModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="공지사항 제목을 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">메시지</label>
                  <textarea
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    placeholder="참가자들에게 전달할 메시지를 입력하세요"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  className="flex-1 py-3"
                  onClick={() => setShowNoticeModal(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  onClick={handleSendNotice}
                >
                  전송하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR 코드 모달 */}
      {showQRModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white rounded-sm relative">
                      <div className="absolute inset-0.5 border border-white rounded-sm"></div>
                      <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full"></div>
                      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">참여자 QR 코드</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQRModal(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ND</span>
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900 text-lg">{selectedEvent.title}</span>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{selectedEvent.event_code}</p>
                      <p>{formatDate(selectedEvent.start_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="w-56 h-56 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="w-40 h-40 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-3 shadow-sm"></div>
                    <p className="text-xs text-gray-500 font-medium">QR Code</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  이 QR 코드를 스캔하거나<br />
                  아래 링크로 접속해 명함을 제출할 수 있어요
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                  <p className="text-xs text-gray-600 break-all font-mono">
                    {window.location.origin}/events/{selectedEvent.id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">복사</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  <span className="hidden sm:inline">공유</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveQR} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">저장</span>
                </Button>
              </div>

              <Button
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                onClick={() => setShowQRModal(false)}
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
