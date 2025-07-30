"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bell } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NoticeModalProps {
  open: boolean
  onClose: () => void
}

export default function NoticeModal({ open, onClose }: NoticeModalProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")

  const handleSend = () => {
    // 공지 전송 로직
    console.log("공지 전송:", { title, message })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>공지 전송</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="공지사항 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-gray-200 focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">메시지</Label>
            <Textarea
              id="message"
              placeholder="참가자들에게 전달할 메시지를 입력하세요"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-2 border-gray-200 focus:border-purple-500 min-h-[120px]"
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              취소
            </Button>
            <Button onClick={handleSend} className="flex-1 bg-purple-600 hover:bg-purple-700">
              전송하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
