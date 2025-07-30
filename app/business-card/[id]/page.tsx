"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useBusinessCards } from "@/hooks/use-business-cards"
import { createClient } from "@/utils/supabase/client"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Share2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function PublicBusinessCardPage() {
  const router = useRouter()
  const params = useParams()
  const cardId = params.id
  const { user } = useAuth()
  const { collectCard } = useBusinessCards()
  const [isCollected, setIsCollected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [card, setCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // 명함 데이터 가져오기
  useEffect(() => {
    const fetchBusinessCard = async () => {
      if (!cardId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('business_cards')
          .select(`
            *,
            user_profiles!inner(
              full_name,
              contact,
              company,
              role,
              mbti,
              keywords,
              introduction,
              profile_image_url
            )
          `)
          .eq('id', cardId)
          .single()

        if (error) {
          console.error('명함 가져오기 오류:', error)
          toast.error('명함을 불러오는데 실패했습니다.')
          return
        }

        setCard(data)
      } catch (error) {
        console.error('명함 가져오기 오류:', error)
        toast.error('명함을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessCard()
  }, [cardId, supabase])

  // 이미 수집된 명함인지 확인
  useEffect(() => {
    const checkIfCollected = async () => {
      if (!user || !cardId) return

      try {
        const { data, error } = await supabase
          .from('collected_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('business_card_id', cardId)
          .single()

        if (!error && data) {
          setIsCollected(true)
        }
      } catch (error) {
        // 수집되지 않은 경우
        setIsCollected(false)
      }
    }

    checkIfCollected()
  }, [user, cardId, supabase])

  // 명함 수집 함수
  const handleCollectCard = async () => {
    if (!user || !card || isCollected) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('collected_cards')
        .insert({
          user_id: user.id,
          business_card_id: card.id,
          collected_at: new Date().toISOString()
        })

      if (error) {
        console.error('명함 수집 오류:', error)
        toast.error('명함 수집에 실패했습니다.')
        return
      }

      setIsCollected(true)
      toast.success('명함이 성공적으로 수집되었습니다!')

      // 성공 메시지 표시 후 수집된 명함 목록으로 이동
      setTimeout(() => {
        router.push('/saved-cards')
      }, 1500)

    } catch (error) {
      console.error('명함 수집 중 오류:', error)
      toast.error('명함 수집에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 공유 함수
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${card?.full_name}님의 명함`,
          text: `${card?.full_name}님의 디지털 명함을 확인해보세요!`,
          url: window.location.href
        })
      } else {
        // 공유 API가 지원되지 않는 경우 클립보드에 복사
        await navigator.clipboard.writeText(window.location.href)
        alert('링크가 클립보드에 복사되었습니다!')
      }
    } catch (error) {
      console.error('공유 중 오류:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="bg-white border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 text-gray-900" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">명함 상세</h1>
            <div className="w-10"></div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">명함을 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen">
        <div className="bg-white border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 text-gray-900" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">명함 상세</h1>
            <div className="w-10"></div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">명함을 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 text-gray-900" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">명함 상세</h1>
          <Button variant="ghost" size="sm" className="p-2" onClick={handleShare}>
            <Share2 className="w-4 h-4 text-gray-900" />
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          {/* 명함 카드 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6">
            {/* 프로필 섹션 */}
            <div className="text-center mb-6">
              <div className={`w-24 h-24 bg-gradient-to-br ${card.avatarColor} rounded-full mx-auto mb-5 flex items-center justify-center`}>
                <span className="text-white font-bold text-3xl">{card.avatar}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{card.full_name}</h2>
              <p className="text-gray-600 text-base mb-4">{card.introduction}</p>
              <div className="space-y-2 text-sm text-gray-500">
                {card.age && <p>{card.age}</p>}
                {(card.company || card.role) && (
                  <p>{card.company} / {card.role}</p>
                )}
                {card.mbti && <p>MBTI: {card.mbti}</p>}
              </div>
            </div>

            {/* 태그 섹션들 */}
            <div className="space-y-6">
              {/* 성격 */}
              {card.keywords && card.keywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">성격</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {card.keywords.map((keyword: string, index: number) => (
                      <Badge key={index} className="bg-purple-600 text-white px-3 py-1">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 외부 링크 */}
              {card.external_link && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">외부 링크</h4>
                  <p className="text-gray-500 text-sm">{card.external_link}</p>
                </div>
              )}

              {/* 공유 링크 */}
              <div className="text-center">
                <p className="text-purple-600 text-sm font-medium">{card.shareLink}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md px-5 py-6 bg-white border-t border-gray-200 shadow-lg">
        <Button
          className={`w-full h-15 font-semibold text-lg ${
            isCollected
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
          disabled={isLoading || isCollected}
          onClick={handleCollectCard}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              수집 중...
            </div>
          ) : isCollected ? (
            <>
              <Plus className="w-4 h-4 mr-2" />
              수집 완료
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              명함 수집하기
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
