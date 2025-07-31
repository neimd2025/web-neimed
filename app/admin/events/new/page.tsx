"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/stores/auth-store"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from 'react-hook-form'
import { toast } from "sonner"
import { z } from 'zod'

// Zod 스키마 정의
const eventSchema = z.object({
  title: z.string().min(1, '이벤트 이름을 입력해주세요').max(100, '이벤트 이름은 100자 이하여야 합니다'),
  startDate: z.string().min(1, '시작 날짜를 입력해주세요'),
  endDate: z.string().min(1, '종료 날짜를 입력해주세요'),
  location: z.string().min(1, '장소를 입력해주세요').max(200, '장소는 200자 이하여야 합니다'),
  description: z.string().min(1, '이벤트 설명을 입력해주세요').max(1000, '이벤트 설명은 1000자 이하여야 합니다'),
  maxParticipants: z.string().min(1, '최대 참가자 수를 입력해주세요').refine((val) => {
    const num = parseInt(val)
    return !isNaN(num) && num > 0 && num <= 1000
  }, '최대 참가자 수는 1명 이상 1000명 이하여야 합니다'),
  eventCode: z.string().optional()
}).refine((data) => {
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  return endDate > startDate
}, {
  message: "종료 날짜는 시작 날짜보다 늦어야 합니다",
  path: ["endDate"],
})

type EventFormData = z.infer<typeof eventSchema>

export default function NewEventPage() {
  const router = useRouter()
  const { adminUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema)
  })

  // 관리자 권한 확인
  if (!adminUser) {
            router.push('/admin/login')
    return null
  }

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      // 이벤트 코드 자동 생성 (입력되지 않은 경우)
      let eventCode = data.eventCode
      if (!eventCode) {
        eventCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      }

      // 이벤트 생성
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title: data.title,
          description: data.description,
          start_date: data.startDate,
          end_date: data.endDate,
          location: data.location,
          max_participants: parseInt(data.maxParticipants),
          event_code: eventCode,
          created_by: adminUser.id, // 관리자 ID 설정
          status: 'upcoming',
          current_participants: 0
        })
        .select()
        .single()

      if (eventError) {
        console.error('이벤트 생성 오류:', eventError)
        toast.error("이벤트 생성 중 오류가 발생했습니다.")
        return
      }

      console.log('이벤트 생성 성공:', event)
      toast.success('이벤트가 성공적으로 생성되었습니다!')

      // 성공 시 이벤트 목록으로 이동
      router.push('/admin/events')
    } catch (error) {
      console.error('이벤트 생성 오류:', error)
      toast.error("이벤트 생성 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-0 shadow-lg Audit">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">이벤트 이름</Label>
                <Input
                  {...register('title')}
                  placeholder="예: Neimd 네트워킹 데모 이벤트"
                  className={`border-2 border-gray-200 focus:border-purple-500 rounded-xl ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">시작 날짜</Label>
                  <Input
                    {...register('startDate')}
                    type="datetime-local"
                    className={`border-2 border-gray-200 focus:border-purple-500 rounded-xl ${errors.startDate ? 'border-red-500' : ''}`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">종료 날짜</Label>
                  <Input
                    {...register('endDate')}
                    type="datetime-local"
                    className={`border-2 border-gray-200 focus:border-purple-500 rounded-xl ${errors.endDate ? 'border-red-500' : ''}`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">장소</Label>
                <Input
                  {...register('location')}
                  placeholder="예: 온라인 또는 서울시 강남구"
                  className={`border-2 border-gray-200 focus:border-purple-500 rounded-xl ${errors.location ? 'border-red-500' : ''}`}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">최대 참가자 수</Label>
                <Input
                  {...register('maxParticipants')}
                  type="number"
                  placeholder="예: 100"
                  className={`border-2 border-gray-200 focus:border-purple-500 rounded-xl ${errors.maxParticipants ? 'border-red-500' : ''}`}
                />
                {errors.maxParticipants && (
                  <p className="text-red-500 text-sm">{errors.maxParticipants.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventCode">이벤트 코드 (선택사항)</Label>
                <Input
                  {...register('eventCode')}
                  placeholder="예: DEMO01 (자동 생성 시 비워두세요)"
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">이벤트 설명</Label>
                <Textarea
                  {...register('description')}
                  placeholder="이벤트에 대한 상세한 설명을 입력하세요"
                  className={`border-2 border-gray-200 focus:border-purple-500 rounded-xl min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
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

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 border-2 border-gray-200 py-3 rounded-xl"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? "생성 중..." : "이벤트 생성"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
