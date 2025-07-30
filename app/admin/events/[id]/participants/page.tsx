"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminStore } from "@/stores/admin-store"
import { ArrowLeft, Download, Mail, QrCode, Search, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Participant {
  id: string
  name: string
  email: string
  company: string
  job: string
  joinDate: string
  status: "confirmed" | "pending" | "cancelled"
  qrCode?: string
}

export default function EventParticipantsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { adminUser } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all")

  // 더미 이벤트 데이터
  const event = {
    id: params.id,
    title: "Neimd 네트워킹 데모 이벤트",
    date: "2025-01-25",
    location: "온라인",
    eventCode: "DEMO01"
  }

  // 더미 참가자 데이터
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "허수정",
      email: "heosujeong@neimd.com",
      company: "Named",
      job: "기획자",
      joinDate: "2025-01-15",
      status: "confirmed",
      qrCode: "QR001"
    },
    {
      id: "2",
      name: "김철수",
      email: "chulsoo@example.com",
      company: "스타트업XYZ",
      job: "개발자",
      joinDate: "2025-01-16",
      status: "confirmed",
      qrCode: "QR002"
    },
    {
      id: "3",
      name: "이영희",
      email: "younghee@example.com",
      company: "디자인스튜디오",
      job: "UX 디자이너",
      joinDate: "2025-01-17",
      status: "pending"
    },
    {
      id: "4",
      name: "박민수",
      email: "minsu@example.com",
      company: "테크컴퍼니",
      job: "마케터",
      joinDate: "2025-01-18",
      status: "cancelled"
    }
  ])

  const getStatusBadge = (status: Participant["status"]) => {
    const statusConfig = {
      confirmed: { label: "확정", color: "bg-green-100 text-green-800" },
      pending: { label: "대기", color: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "취소", color: "bg-red-100 text-red-800" }
    }
    const config = statusConfig[status]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const filteredParticipants = participants.filter(participant => {
    const matchesFilter = filter === "all" || participant.status === filter
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.company.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleStatusChange = async (participantId: string, newStatus: Participant["status"]) => {
    try {
      // 실제로는 Supabase에서 참가자 상태를 업데이트해야 함
      await new Promise(resolve => setTimeout(resolve, 500)) // 시뮬레이션

      setParticipants(prev => prev.map(p =>
        p.id === participantId ? { ...p, status: newStatus } : p
      ))

      console.log('참가자 상태 변경:', participantId, newStatus)
    } catch (error) {
      console.error('상태 변경 오류:', error)
    }
  }

  const handleExportParticipants = () => {
    // CSV 내보내기 기능
    const csvContent = [
      ["이름", "이메일", "회사", "직책", "상태", "가입일"],
      ...filteredParticipants.map(p => [
        p.name,
        p.email,
        p.company,
        p.job,
        p.status,
        p.joinDate
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${event.title}_참가자목록.csv`
    link.click()
  }

  const handleSendNotification = () => {
    // 참가자들에게 알림 전송 기능
    console.log('참가자들에게 알림 전송')
    alert('알림 전송 기능은 별도 페이지에서 구현됩니다.')
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
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">참가자 관리</h1>
              <p className="text-sm text-gray-600">{event.title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSendNotification}>
              <Mail className="h-4 w-4 mr-2" />
              알림 전송
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportParticipants}>
              <Download className="h-4 w-4 mr-2" />
              내보내기
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
                <div className="text-sm text-gray-600">전체 참가자</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {participants.filter(p => p.status === "confirmed").length}
                </div>
                <div className="text-sm text-gray-600">확정</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {participants.filter(p => p.status === "pending").length}
                </div>
                <div className="text-sm text-gray-600">대기</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {participants.filter(p => p.status === "cancelled").length}
                </div>
                <div className="text-sm text-gray-600">취소</div>
              </CardContent>
            </Card>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="참가자명, 이메일, 회사로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "confirmed", "pending", "cancelled"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={filter === status ? "bg-purple-600" : ""}
                >
                  {status === "all" && "전체"}
                  {status === "confirmed" && "확정"}
                  {status === "pending" && "대기"}
                  {status === "cancelled" && "취소"}
                </Button>
              ))}
            </div>
          </div>

          {/* 참가자 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>참가자 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">참가자</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">회사/직책</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">상태</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">가입일</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">QR코드</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map((participant) => (
                      <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{participant.name}</div>
                            <div className="text-sm text-gray-600">{participant.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{participant.company}</div>
                            <div className="text-sm text-gray-600">{participant.job}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(participant.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {participant.joinDate}
                        </td>
                        <td className="py-3 px-4">
                          {participant.qrCode ? (
                            <Button variant="outline" size="sm">
                              <QrCode className="h-4 w-4 mr-1" />
                              보기
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {participant.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(participant.id, "confirmed")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  확정
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(participant.id, "cancelled")}
                                  className="text-red-600 border-red-200"
                                >
                                  거절
                                </Button>
                              </>
                            )}
                            {participant.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(participant.id, "cancelled")}
                                className="text-red-600 border-red-200"
                              >
                                취소
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
