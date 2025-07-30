"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdminStore } from "@/stores/admin-store"
import { createClient } from "@/utils/supabase/client"
import { ArrowLeft, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function NewEventPage() {
  const router = useRouter()
  const { adminUser } = useAdminStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    maxParticipants: "",
    eventCode: ""
  })

  // 관리자 권한 확인
  if (!adminUser) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">새로운 이벤트 만들기</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">이벤트 이름</Label>
              <Input
                id="title"
                placeholder="예: Neimd 네트워킹 데모 이벤트"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">시작 날짜</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">종료 날짜</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">장소</Label>
              <Input
                id="location"
                placeholder="예: 온라인 또는 서울시 강남구"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">최대 참가자 수</Label>
              <Input
                id="maxParticipants"
                type="number"
                placeholder="예: 100"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventCode">이벤트 코드 (선택사항)</Label>
              <Input
                id="eventCode"
                placeholder="예: DEMO01 (자동 생성 시 비워두세요)"
                value={formData.eventCode}
                onChange={(e) => setFormData({ ...formData, eventCode: e.target.value })}
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">이벤트 설명</Label>
              <Textarea
                id="description"
                placeholder="이벤트에 대한 상세한 설명을 입력하세요"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-2 border-gray-200 focus:border-purple-500 rounded-xl min-h-[100px]"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <Label className="text-gray-700 font-medium mb-4 block">이벤트 설정</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">파일을 업로드하거나 드래그 앤 드롭하세요</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF 최대 10MB</p>
            </div>
          </CardContent>
        </Card>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 border-2 border-gray-200 py-3 rounded-xl"
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-xl"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true)
              setError("")

              try {
                // 유효성 검사
                if (!formData.title || !formData.startDate || !formData.endDate || !formData.location || !formData.maxParticipants) {
                  setError("모든 필수 필드를 입력해주세요.")
                  return
                }

                const supabase = createClient()

                // 이벤트 코드 자동 생성 (입력되지 않은 경우)
                let eventCode = formData.eventCode
                if (!eventCode) {
                  eventCode = Math.random().toString(36).substring(2, 8).toUpperCase()
                }

                // 이벤트 생성
                const { data: event, error: eventError } = await supabase
                  .from('events')
                  .insert({
                    title: formData.title,
                    description: formData.description,
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    location: formData.location,
                    max_participants: parseInt(formData.maxParticipants),
                    event_code: eventCode,
                    created_by: adminUser.id, // 관리자 ID 설정
                    status: 'upcoming',
                    current_participants: 0
                  })
                  .select()
                  .single()

                if (eventError) {
                  console.error('이벤트 생성 오류:', eventError)
                  setError("이벤트 생성 중 오류가 발생했습니다.")
                  return
                }

                console.log('이벤트 생성 성공:', event)
                toast.success('이벤트가 성공적으로 생성되었습니다!')

                // 성공 시 이벤트 목록으로 이동
                router.push('/admin/events')
              } catch (error) {
                console.error('이벤트 생성 오류:', error)
                setError("이벤트 생성 중 오류가 발생했습니다.")
              } finally {
                setIsLoading(false)
              }
            }}
          >
            {isLoading ? "생성 중..." : "이벤트 생성"}
          </Button>
        </div>
      </div>
    </div>
  )
}
