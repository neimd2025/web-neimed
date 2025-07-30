"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdminStore } from "@/stores/admin-store"
import { generateCouponCodeByType } from "@/utils/coupon-generator"
import { Copy, Gift, RefreshCw, X } from "lucide-react"
import { useState } from "react"

interface CouponCreateModalProps {
  open: boolean
  onClose: () => void
}

export default function CouponCreateModal({ open, onClose }: CouponCreateModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    validUntil: "",
    usageLimit: 100,
    type: "standard" as "standard" | "premium" | "event",
    status: "active" as "active" | "expired" | "disabled",
    batchCount: 1,
  })
  const [previewCode, setPreviewCode] = useState("")
  const [showBatchOptions, setShowBatchOptions] = useState(false)
  const { createCoupon, createBatchCoupons } = useAdminStore()

  const generatePreviewCode = () => {
    const code = generateCouponCodeByType(formData.type)
    setPreviewCode(code)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (showBatchOptions && formData.batchCount > 1) {
      createBatchCoupons(formData, formData.batchCount)
    } else {
      createCoupon(formData)
    }

    setFormData({
      title: "",
      description: "",
      discount: "",
      validUntil: "",
      usageLimit: 100,
      type: "standard",
      status: "active",
      batchCount: 1,
    })
    setPreviewCode("")
    setShowBatchOptions(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5" />
              <span>새 쿠폰 생성</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 쿠폰 타입 선택 */}
          <div className="space-y-3">
            <Label>쿠폰 타입</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.type === "standard" ? "default" : "outline"}
                className={`text-sm ${
                  formData.type === "standard"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "border-gray-200 bg-white hover:border-purple-300"
                }`}
                onClick={() => setFormData({ ...formData, type: "standard" })}
              >
                일반
              </Button>
              <Button
                type="button"
                variant={formData.type === "premium" ? "default" : "outline"}
                className={`text-sm ${
                  formData.type === "premium"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "border-gray-200 bg-white hover:border-purple-300"
                }`}
                onClick={() => setFormData({ ...formData, type: "premium" })}
              >
                프리미엄
              </Button>
              <Button
                type="button"
                variant={formData.type === "event" ? "default" : "outline"}
                className={`text-sm ${
                  formData.type === "event"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "border-gray-200 bg-white hover:border-purple-300"
                }`}
                onClick={() => setFormData({ ...formData, type: "event" })}
              >
                이벤트
              </Button>
            </div>
          </div>

          {/* 쿠폰 코드 미리보기 */}
          <div className="space-y-2">
            <Label>쿠폰 코드 미리보기</Label>
            <div className="flex space-x-2">
              <Input
                value={previewCode}
                placeholder="미리보기 버튼을 클릭하세요"
                readOnly
                className="border-2 border-gray-200 bg-white font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePreviewCode}
                className="px-3 bg-transparent"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {previewCode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(previewCode)}
                  className="px-3"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">실제 생성 시 자동으로 고유한 코드가 생성됩니다</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">쿠폰 제목</Label>
            <Input
              id="title"
              placeholder="예: 신규 회원 환영 쿠폰"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-2 border-gray-200 focus:border-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="쿠폰에 대한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-2 border-gray-200 focus:border-purple-500 min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">할인 혜택</Label>
            <Input
              id="discount"
              placeholder="예: 10% 할인, 5,000원 할인"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              className="border-2 border-gray-200 focus:border-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">유효기간</Label>
            <Input
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="border-2 border-gray-200 focus:border-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageLimit">사용 한도</Label>
            <Input
              id="usageLimit"
              type="number"
              placeholder="100"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: Number.parseInt(e.target.value) || 0 })}
              className="border-2 border-gray-200 focus:border-purple-500"
              required
            />
          </div>

          {/* 배치 생성 옵션 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="batchMode"
                checked={showBatchOptions}
                onChange={(e) => setShowBatchOptions(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="batchMode" className="text-sm">
                여러 개 쿠폰 한번에 생성
              </Label>
            </div>

            {showBatchOptions && (
              <div className="space-y-2">
                <Label htmlFor="batchCount">생성 개수</Label>
                <Input
                  id="batchCount"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.batchCount}
                  onChange={(e) => setFormData({ ...formData, batchCount: Number.parseInt(e.target.value) || 1 })}
                  className="border-2 border-gray-200 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500">최대 100개까지 한번에 생성할 수 있습니다</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
              {showBatchOptions && formData.batchCount > 1 ? `${formData.batchCount}개 쿠폰 생성` : "쿠폰 생성"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
