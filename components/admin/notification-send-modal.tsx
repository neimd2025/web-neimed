"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Bell } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAdminStore } from "@/stores/admin-store"

interface NotificationSendModalProps {
  open: boolean
  onClose: () => void
}

export default function NotificationSendModal({ open, onClose }: NotificationSendModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "all" as "all" | "specific" | "event_participants",
  })
  const { sendPushNotification } = useAdminStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendPushNotification(formData)
    setFormData({
      title: "",
      message: "",
      targetType: "all",
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>푸시 알림 발송</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">알림 제목</Label>
            <Input
              id="title"
              placeholder="예: 새로운 이벤트 안내"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-2 border-gray-200 focus:border-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">메시지</Label>
            <Textarea
              id="message"
              placeholder="회원들에게 전달할 메시지를 입력하세요"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="border-2 border-gray-200 focus:border-purple-500 min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>발송 대상</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={formData.targetType === "all"}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any })}
                  className="text-purple-600"
                />
                <span>전체 회원</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="targetType"
                  value="event_participants"
                  checked={formData.targetType === "event_participants"}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any })}
                  className="text-purple-600"
                />
                <span>이벤트 참가자</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="targetType"
                  value="specific"
                  checked={formData.targetType === "specific"}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any })}
                  className="text-purple-600"
                />
                <span>특정 회원</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
              발송하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
