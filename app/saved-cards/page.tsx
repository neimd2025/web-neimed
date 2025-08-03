"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { collectedCardAPI } from '@/lib/supabase/database'
import { ArrowLeft, Heart, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SavedCardsPage() {
  const { user } = useAuth()
  const [collectedCards, setCollectedCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)
  const router = useRouter()

  // 즐겨찾기된 명함 필터링
  const favoriteCards = collectedCards.filter(card => card.is_favorite)

  useEffect(() => {
    const loadCollectedCards = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        const cardsData = await collectedCardAPI.getUserCollectedCards(user.id)
        setCollectedCards(cardsData)
      } catch (error) {
        console.error('Error loading collected cards:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCollectedCards()
  }, [user?.id])

  const handleToggleFavorite = async (collectionId: string, isFavorite: boolean) => {
    try {
      const success = await collectedCardAPI.toggleFavorite(collectionId, isFavorite)
      if (success) {
        setCollectedCards(prev =>
          prev.map(card =>
            card.id === collectionId
              ? { ...card, is_favorite: isFavorite }
              : card
          )
        )
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // 필터링된 명함 목록
  const filteredCards = collectedCards.filter(card => {
    const matchesSearch = !searchTerm ||
      card.business_cards?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.business_cards?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.business_cards?.role?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFavorite = !showFavorites || card.is_favorite

    return matchesSearch && matchesFavorite
  })



  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">명함을 수집하려면 먼저 로그인해주세요.</p>
          <Link href="/login">
            <Button>로그인하기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <Link href="/home">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">수집된 명함</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* 검색 및 필터 */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="이름, 회사, 직책으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={showFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavorites(!showFavorites)}
              className={showFavorites ? "bg-purple-600" : ""}
            >
              <Heart className="w-4 h-4 mr-1" />
              즐겨찾기만
            </Button>
          </div>
        </div>

        {/* 통계 */}
        <div className="flex gap-4">
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{collectedCards.length}</p>
              <p className="text-sm text-gray-600">전체 명함</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{favoriteCards.length}</p>
              <p className="text-sm text-gray-600">즐겨찾기</p>
            </CardContent>
          </Card>
        </div>

        {/* 명함 목록 */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">명함을 불러오는 중...</p>
            </div>
          ) : filteredCards.length > 0 ? (
            filteredCards.map((collection) => {
              const card = collection.business_cards
              if (!card) return null

              return (
                <Card key={collection.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {card.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{card.full_name || '이름 없음'}</h3>
                          <p className="text-sm text-gray-600">
                            {card.role || '직책 없음'} @ {card.company || '회사 없음'}
                          </p>
                          {card.email && (
                            <p className="text-xs text-gray-500">{card.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(collection.id, collection.is_favorite || false)}
                          className={collection.is_favorite ? "text-red-500" : "text-gray-400"}
                        >
                          <Heart className={`w-4 h-4 ${collection.is_favorite ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/saved-cards/${collection.id}`)}
                        >
                          상세보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showFavorites ? '즐겨찾기된 명함이 없습니다' : '수집된 명함이 없습니다'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {showFavorites
                  ? '즐겨찾기할 명함을 찾아보세요!'
                  : '명함을 스캔하여 수집을 시작해보세요!'
                }
              </p>
              <Link href="/scan-card">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  명함 스캔하기
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
