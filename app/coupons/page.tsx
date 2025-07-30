"use client"

import MobileHeader from "@/components/mobile-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAdminStore } from "@/stores/admin-store"
import { useAuthStore } from "@/stores/auth-store"
import { Check, Gift, Ticket, X } from "lucide-react"
import { useState } from "react"

export default function CouponsPage() {
  const [couponCode, setCouponCode] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const { validateAndUseCoupon, coupons } = useAdminStore()
  const { user } = useAuthStore()

  const handleUseCoupon = () => {
    if (!couponCode.trim()) {
      setMessage("쿠폰 코드를 입력해주세요.")
      setMessageType("error")
      return
    }

    if (!user) {
      setMessage("로그인이 필요합니다.")
      setMessageType("error")
      return
    }

    const result = validateAndUseCoupon(couponCode.toUpperCase(), user.id)
    setMessage(result.message)
    setMessageType(result.success ? "success" : "error")

    if (result.success) {
      setCouponCode("")
    }
  }

  const availableCoupons = coupons.filter((c) => c.status === "active" && c.usedCount < c.usageLimit)

  return (
    <div className="min-h-screen bg-white">
      <MobileHeader title="쿠폰" showBackButton />

      <div className="px-4 py-6 space-y-6">
        {/* 쿠폰 사용 섹션 */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Ticket className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">쿠폰 사용하기</h2>
              <p className="text-gray-500">쿠폰 코드를 입력하여 할인 혜택을 받으세요</p>
            </div>

            <div className="space-y-3">
              <Input
                type="text"
                placeholder="쿠폰 코드를 입력하세요 (예: ABCD-1234-EFGH)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl font-mono text-center"
              />

              {message && (
                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    messageType === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {messageType === "success" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  <span className="text-sm">{message}</span>
                </div>
              )}

              <Button
                onClick={handleUseCoupon}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              >
                쿠폰 사용하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 사용 가능한 쿠폰 목록 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">사용 가능한 쿠폰</h3>

          {availableCoupons.length > 0 ? (
            <div className="space-y-3">
              {availableCoupons.map((coupon) => (
                <Card key={coupon.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-bold text-gray-900">{coupon.title}</h4>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {coupon.type === "premium" ? "프리미엄" : coupon.type === "event" ? "이벤트" : "일반"}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-purple-600">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCouponCode(coupon.code)}
                            className="text-xs text-purple-600 hover:bg-purple-50"
                          >
                            사용하기
                          </Button>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>유효기간: {coupon.validUntil}</span>
                          <span>남은 수량: {coupon.usageLimit - coupon.usedCount}개</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{coupon.discount}</div>
                        <p className="text-xs text-gray-500">할인</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-gray-200">
              <CardContent className="p-8 text-center">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">현재 사용 가능한 쿠폰이 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 쿠폰 사용 안내 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">쿠폰 사용 안내</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 쿠폰 코드는 대소문자를 구분하지 않습니다</li>
              <li>• 한 번 사용한 쿠폰은 재사용할 수 없습니다</li>
              <li>• 유효기간이 지난 쿠폰은 사용할 수 없습니다</li>
              <li>• 쿠폰은 선착순으로 사용 가능합니다</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
