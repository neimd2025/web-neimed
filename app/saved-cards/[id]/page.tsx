"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { useBusinessCards } from '@/hooks/use-business-cards'
import { ArrowLeft, Calendar, Heart, Mail, MapPin, Phone, Share } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CollectedCard {
  id: string
  is_favorite: boolean
  memo?: string
  business_cards: {
    full_name?: string
    role?: string
    company?: string
    share_link?: string
    introduction?: string
    email?: string
    contact?: string
    age?: string
    mbti?: string
  }
}

export default function SavedCardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { collectedCards, toggleFavorite, removeCollectedCard } = useBusinessCards()
  const [collection, setCollection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [memo, setMemo] = useState('')

  useEffect(() => {
    if (!params.id) return

    const foundCollection = collectedCards.find(c => c.id === params.id)
    if (foundCollection) {
      setCollection(foundCollection)
      setMemo(foundCollection.memo || '')
    }
    setLoading(false)
  }, [params.id, collectedCards])

  const handleToggleFavorite = async () => {
    if (!collection) return

    try {
      await toggleFavorite(collection.id, !collection.is_favorite)
      setCollection((prev: any) => prev ? { ...prev, is_favorite: !prev.is_favorite } : null)
      toast.success(collection.is_favorite ? '즐겨찾기에서 제거했습니다' : '즐겨찾기에 추가했습니다')
    } catch (error) {
      console.error('즐겨찾기 토글 오류:', error)
      toast.error('즐겨찾기 변경에 실패했습니다')
    }
  }

  const handleRemoveCard = async () => {
    if (!collection) return

    try {
      await removeCollectedCard(collection.id)
      toast.success('명함을 삭제했습니다')
      router.push('/saved-cards')
    } catch (error) {
      console.error('명함 삭제 오류:', error)
      toast.error('명함 삭제에 실패했습니다')
    }
  }

  const handleShare = () => {
    if (!collection?.business_cards?.share_link) {
      toast.error('공유 링크가 없습니다')
      return
    }

    // 공유 링크 복사
    navigator.clipboard.writeText(collection.business_cards.share_link)
    toast.success('공유 링크가 복사되었습니다')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!collection || !collection.business_cards) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">명함을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 명함이 존재하지 않거나 삭제되었습니다.</p>
          <Link href="/saved-cards">
            <Button>명함 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  const card = collection.business_cards

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">명함 상세</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* 명함 정보 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {card.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{card.full_name || '이름 없음'}</h2>
                  <p className="text-gray-600">
                    {card.role || '직책 없음'} @ {card.company || '회사 없음'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className={collection.is_favorite ? "text-red-500" : "text-gray-400"}
              >
                <Heart className={`w-5 h-5 ${collection.is_favorite ? "fill-current" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {card.introduction && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">소개</h3>
                <p className="text-gray-600 text-sm">{card.introduction}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {card.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="font-medium">{card.email}</p>
                  </div>
                </div>
              )}

              {card.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-medium">{card.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 개인 정보 */}
            {(card.age || card.mbti) && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">개인 정보</h3>
                <div className="flex gap-2">
                  {card.age && <Badge variant="outline">{card.age}</Badge>}
                  {card.mbti && <Badge variant="outline">{card.mbti}</Badge>}
                </div>
              </div>
            )}

            {/* 관심사 */}
            {card.interests && card.interests.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">관심사</h3>
                <div className="flex flex-wrap gap-2">
                  {card.interests.map((interest: string, index: number) => (
                    <Badge key={index} variant="outline">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 취미 */}
            {card.hobbies && card.hobbies.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">취미</h3>
                <div className="flex flex-wrap gap-2">
                  {card.hobbies.map((hobby: string, index: number) => (
                    <Badge key={index} variant="outline">{hobby}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 메모 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">메모</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="이 사람에 대한 메모를 작성해보세요..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* 수집 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">수집 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">수집일</p>
                <p className="font-medium">
                  {new Date(collection.collected_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {collection.event_id && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">수집 이벤트</p>
                  <p className="font-medium">이벤트 ID: {collection.event_id}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleShare}
          >
            <Share className="w-4 h-4 mr-2" />
            공유하기
          </Button>

          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleRemoveCard}
          >
            삭제하기
          </Button>
        </div>
      </div>
    </div>
  )
}
