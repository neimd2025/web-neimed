'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Share2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PublicBusinessCardPage() {
  const router = useRouter()
  const params = useParams()
  const cardId = params.id
  const [isCollected, setIsCollected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 실제로는 API에서 데이터를 가져와야 하지만, 여기서는 mock 데이터 사용
  const businessCards = [
    {
      id: 1,
      name: "정민철",
      introduction: "혁신적인 제품 개발을 리드합니다.",
      age: "33세",
      company: "StartupXYZ",
      position: "프로덕트 매니저",
      mbti: "ENTJ",
      personality: ["리더십", "전략적", "추진력"],
      interests: ["제품기획", "애자일", "스타트업", "프로덕트", "기획", "스타트업"],
      hobbies: ["축구", "독서", "팟캐스트"],
      externalLink: {
        name: "Medium",
        url: "medium.com"
      },
      shareLink: "named.link/1s2v-jung-minchul",
      avatar: "정",
      avatarColor: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      name: "최은정",
      introduction: "사용자 중심의 디자인으로 경험을 만듭니다.",
      age: "28세",
      company: "Design Studio",
      position: "UX 디자이너",
      mbti: "INFJ",
      personality: ["창의적", "공감능력", "세심함"],
      interests: ["디자인", "UX", "프로토타이핑"],
      hobbies: ["그림", "전시회", "여행"],
      externalLink: {
        name: "Behance",
        url: "behance.net"
      },
      shareLink: "named.link/1s2v-choi-eunjung",
      avatar: "최",
      avatarColor: "from-purple-500 to-pink-600"
    },
    {
      id: 3,
      name: "박준호",
      introduction: "데이터로 인사이트를 발견하고 가치를 창출합니다.",
      age: "35세",
      company: "데이터 분석가",
      position: "시니어 데이터 사이언티스트",
      mbti: "INTJ",
      personality: ["분석적", "논리적", "정확성"],
      interests: ["데이터", "AI", "머신러닝"],
      hobbies: ["독서", "수학", "프로그래밍"],
      externalLink: {
        name: "GitHub",
        url: "github.com"
      },
      shareLink: "named.link/1s2v-park-junho",
      avatar: "박",
      avatarColor: "from-green-500 to-blue-600"
    }
  ]

  const card = businessCards.find((c) => c.id === Number.parseInt(cardId as string))

  // 명함 수집 함수
  const handleCollectCard = async () => {
    if (isCollected) return

    setIsLoading(true)

    try {
      // 실제로는 Supabase에 명함 수집 데이터를 저장해야 함
      await new Promise(resolve => setTimeout(resolve, 1000)) // 시뮬레이션

      setIsCollected(true)
      console.log('명함이 성공적으로 수집되었습니다:', card?.name)

      // 성공 메시지 표시 후 수집된 명함 목록으로 이동
      setTimeout(() => {
        router.push('/saved-cards')
      }, 1500)

    } catch (error) {
      console.error('명함 수집 중 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 공유 함수
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${card?.name}님의 명함`,
          text: `${card?.name}님의 디지털 명함을 확인해보세요!`,
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

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{card.name}</h2>
              <p className="text-gray-600 text-base mb-4">{card.introduction}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>{card.age}</p>
                <p>{card.company} / {card.position}</p>
                <p>MBTI: {card.mbti}</p>
              </div>
            </div>

            {/* 태그 섹션들 */}
            <div className="space-y-6">
              {/* 성격 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">성격</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {card.personality.map((trait, index) => (
                    <Badge key={index} className="bg-purple-600 text-white px-3 py-1">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 관심사 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">관심사</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {card.interests.map((interest, index) => (
                    <Badge
                      key={index}
                      variant={index < 3 ? "default" : "outline"}
                      className={index < 3 ? "bg-purple-600 text-white" : "border-gray-200"}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 취미 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">취미</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {card.hobbies.map((hobby, index) => (
                    <Badge key={index} variant="outline" className="border-gray-200 px-3 py-1">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 외부 링크 */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{card.externalLink.name}</h4>
                <p className="text-gray-500 text-sm">{card.externalLink.url}</p>
              </div>

              {/* 공유 링크 */}
              <div className="text-center">
                <p className="text-purple-600 text-sm font-medium">{card.shareLink}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-6 bg-white border-t border-gray-200">
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
