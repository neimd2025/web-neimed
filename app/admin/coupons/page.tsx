"use client"

import AdminHeader from "@/components/admin/admin-header"
import CouponCreateModal from "@/components/admin/coupon-create-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAdminStore } from "@/stores/admin-store"
import { Calendar, Copy, Filter, Gift, Plus, Search, Users } from "lucide-react"
import { useState } from "react"

export default function AdminCouponsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("전체")
  const { coupons } = useAdminStore()

  const filters = ["전체", "활성", "만료", "비활성"]
  const typeFilters = ["전체", "일반", "프리미엄", "이벤트"]
  const [activeTypeFilter, setActiveTypeFilter] = useState("전체")

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatusFilter =
      activeFilter === "전체" ||
      (activeFilter === "활성" && coupon.status === "active") ||
      (activeFilter === "만료" && coupon.status === "expired") ||
      (activeFilter === "비활성" && coupon.status === "disabled")

    const matchesTypeFilter =
      activeTypeFilter === "전체" ||
      (activeTypeFilter === "일반" && coupon.type === "standard") ||
      (activeTypeFilter === "프리미엄" && coupon.type === "premium") ||
      (activeTypeFilter === "이벤트" && coupon.type === "event")

    return matchesSearch && matchesStatusFilter && matchesTypeFilter
  })

  const activeCoupons = coupons.filter((c) => c.status === "active").length
  const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "premium":
        return "프리미엄"
      case "event":
        return "이벤트"
      default:
        return "일반"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "premium":
        return "bg-yellow-100 text-yellow-700"
      case "event":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />

      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">쿠폰 관리</h1>
            <p className="text-gray-500 mt-1">총 {coupons.length}개의 쿠폰</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            쿠폰 생성
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">{coupons.length}</span>
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">총 쿠폰</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">{activeCoupons}</span>
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">활성 쿠폰</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">{totalUsage}</span>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">총 사용량</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="쿠폰 제목, 코드, 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                className={`${
                  activeFilter === filter
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "border-2 border-gray-200 bg-white hover:border-purple-300"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {filter}
              </Button>
            ))}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            {typeFilters.map((filter) => (
              <Button
                key={filter}
                variant={activeTypeFilter === filter ? "default" : "outline"}
                size="sm"
                className={`${
                  activeTypeFilter === filter
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-2 border-gray-200 bg-white hover:border-blue-300"
                }`}
                onClick={() => setActiveTypeFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Coupons List */}
        <div className="space-y-4">
          {filteredCoupons.map((coupon) => (
            <Card key={coupon.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-bold text-gray-900">{coupon.title}</h3>
                      <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(coupon.type)}`}>
                        {getTypeLabel(coupon.type)}
                      </Badge>
                      <Badge
                        variant={coupon.status === "active" ? "default" : "secondary"}
                        className={`text-xs ${
                          coupon.status === "active"
                            ? "bg-green-100 text-green-700"
                            : coupon.status === "expired"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {coupon.status === "active" ? "활성" : coupon.status === "expired" ? "만료" : "비활성"}
                      </Badge>
                    </div>

                    {/* 쿠폰 코드 */}
                    <div className="flex items-center space-x-2 mb-2">
                      <code className="bg-gray-100 px-3 py-1 rounded-lg font-mono text-sm font-bold text-purple-600">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                        className="p-1 h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>할인: {coupon.discount}</span>
                      <span>유효기간: {coupon.validUntil}</span>
                      <span>
                        사용: {coupon.usedCount}/{coupon.usageLimit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">생성일: {coupon.createdDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{coupon.discount}</div>
                    <p className="text-xs text-gray-500">할인</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>사용률</span>
                    <span>{Math.round((coupon.usedCount / coupon.usageLimit) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery || activeFilter !== "전체" || activeTypeFilter !== "전체"
                ? "검색 조건에 맞는 쿠폰이 없습니다."
                : "아직 생성된 쿠폰이 없습니다."}
            </p>
            {!searchQuery && activeFilter === "전체" && activeTypeFilter === "전체" && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              >
                첫 번째 쿠폰 만들기
              </Button>
            )}
          </div>
        )}
      </div>

      <CouponCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  )
}
