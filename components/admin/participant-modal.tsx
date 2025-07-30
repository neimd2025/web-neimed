"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ParticipantModalProps {
  open: boolean
  onClose: () => void
}

export default function ParticipantModal({ open, onClose }: ParticipantModalProps) {
  const participants = [
    {
      name: "김철수",
      university: "서울대학교 / 컴퓨터공학과 3학년",
      email: "chulsoo@snu.ac.kr",
      phone: "010-1234-5678",
      interests: ["AI", "러닝머신", "스타트업"],
    },
    {
      name: "이영희",
      company: "카카오 / 프론트엔드 개발자",
      email: "younghee@kakao.com",
      phone: "010-1234-5678",
      interests: ["React", "TypeScript", "UI/UX"],
    },
    {
      name: "박민수",
      company: "네이버 / 백엔드 개발자",
      email: "minsii@naver.com",
      phone: "010-1234-5678",
      interests: ["Java", "Spring", "클라우드"],
    },
    {
      name: "최지원",
      university: "연세대학교 / 컴퓨터공학과 4학년",
      email: "chulsoo@snu.ac.kr",
      phone: "010-1234-5678",
      interests: [],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>👥 참여자 명함보기</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {participants.map((participant, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{participant.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{participant.university || participant.company}</p>
                    <p className="text-sm text-gray-600">{participant.email}</p>
                    <p className="text-sm text-gray-600">{participant.phone}</p>
                    {participant.interests.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">관심분야: {participant.interests.join(", ")}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-purple-600">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
